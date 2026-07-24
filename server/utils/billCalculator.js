/**
 * Bill Calculator Utility for MealHub
 * Implements the core expense splitting and bill calculation logic:
 * - General Groceries: Total cost divided by total group meals to find Daily Meal Rate.
 * - Special Dish Expenses: Divided ONLY among students who were 'ON' on that specific date.
 * - Net Calculation: Gross Cost (General + Special) - Advance Payments/Deposits = Net Owed/Refund.
 */

function calculateMonthlyBillsData(studentsInput, meals, expenses, payments, monthStr) {
  // Ensure only non-admin members are included in calculations
  const students = (studentsInput || []).filter(st => st.role !== 'admin');

  // 1. Filter expenses for the target month
  const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr));
  const monthPayments = payments.filter(p => p.month === monthStr || p.date.startsWith(monthStr));

  // 2. Separate General and Special expenses
  const generalExpenses = monthExpenses.filter(e => e.category === 'general');
  const specialExpenses = monthExpenses.filter(e => e.category === 'special');

  const totalGeneralCost = generalExpenses.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
  const totalSpecialCost = specialExpenses.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
  const totalOverallExpense = totalGeneralCost + totalSpecialCost;

  // 3. Map existing meal records by `${date}_${studentId}`
  const mealMap = {};
  meals.forEach(m => {
    if (m.date.startsWith(monthStr)) {
      const studentId = (m.student && m.student._id) ? m.student._id.toString() : m.student.toString();
      const key = `${m.date}_${studentId}`;
      mealMap[key] = m;
    }
  });

  // Determine active elapsed dates in target month (up to today if current month, or all days if past month)
  const nowStr = new Date().toISOString().substring(0, 10);
  const [year, monthNum] = monthStr.split('-').map(Number);
  const totalDaysInMonth = new Date(year, monthNum, 0).getDate();

  const activeDates = [];
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${monthStr}-${dayStr}`;
    if (dateStr <= nowStr || monthStr < nowStr.substring(0, 7)) {
      activeDates.push(dateStr);
    }
  }

  // Calculate student total meals & total group meals
  const studentMealStats = {};
  students.forEach(st => {
    const sId = st._id.toString();
    studentMealStats[sId] = {
      student: st,
      totalMeals: 0,
      specialBreakdown: [],
      specialDishCost: 0,
      totalPaid: 0
    };
  });

  let totalGroupMeals = 0;

  // Compute total meals per student across all active days in month
  students.forEach(st => {
    const sId = st._id.toString();
    activeDates.forEach(dStr => {
      const key = `${dStr}_${sId}`;
      const mealRec = mealMap[key];
      
      let isOn = true;
      let count = 1;

      if (mealRec) {
        isOn = (mealRec.status || '').toUpperCase() === 'ON';
        count = isOn ? (typeof mealRec.mealCount === 'number' ? mealRec.mealCount : 1) : 0;
      }

      if (isOn) {
        studentMealStats[sId].totalMeals += count;
        totalGroupMeals += count;
      }
    });
  });

  // 4. Calculate Daily Meal Rate for General Groceries
  const mealRate = totalGroupMeals > 0 ? (totalGeneralCost / totalGroupMeals) : 0;

  // 5. Calculate Special Dish charges day by day
  specialExpenses.forEach(exp => {
    const expDate = exp.date;
    const expCost = Number(exp.cost) || 0;

    // Find all students ON on expDate
    const onStudentIds = [];
    students.forEach(st => {
      const sId = st._id.toString();
      const key = `${expDate}_${sId}`;
      const mealRec = mealMap[key];
      // Default to ON if no record created yet, or check status
      if (mealRec) {
        if (mealRec.status === 'ON' && (mealRec.mealCount === undefined || mealRec.mealCount > 0)) {
          onStudentIds.push(sId);
        }
      } else {
        // If no meal record explicitly set to OFF on that day, count as ON
        onStudentIds.push(sId);
      }
    });

    const onStudentCount = onStudentIds.length;
    if (onStudentCount > 0 && expCost > 0) {
      const sharePerStudent = Number((expCost / onStudentCount).toFixed(2));

      onStudentIds.forEach(sId => {
        if (studentMealStats[sId]) {
          studentMealStats[sId].specialDishCost += sharePerStudent;
          studentMealStats[sId].specialBreakdown.push({
            date: expDate,
            itemName: exp.itemName,
            totalCost: expCost,
            onStudentCount: onStudentCount,
            studentShare: sharePerStudent
          });
        }
      });
    }
  });

  // 6. Add payments made by students
  monthPayments.forEach(p => {
    const sId = (p.student && p.student._id) ? p.student._id.toString() : p.student.toString();
    if (studentMealStats[sId]) {
      studentMealStats[sId].totalPaid += Number(p.amount) || 0;
    }
  });

  // 7. Generate final summary list
  const bills = students.map(st => {
    const sId = st._id.toString();
    const stats = studentMealStats[sId];

    const generalMealCost = Number((stats.totalMeals * mealRate).toFixed(2));
    const specialDishCost = Number(stats.specialDishCost.toFixed(2));
    const grossTotal = Number((generalMealCost + specialDishCost).toFixed(2));
    const totalPaid = Number(stats.totalPaid.toFixed(2));
    const netAmount = Number((grossTotal - totalPaid).toFixed(2));

    return {
      studentId: sId,
      studentName: st.name,
      roomNumber: st.roomNumber || 'N/A',
      email: st.email,
      totalMeals: stats.totalMeals,
      mealRate: Number(mealRate.toFixed(2)),
      generalMealCost,
      specialDishCost,
      grossTotal,
      totalPaid,
      netAmount, // > 0 owes money, < 0 gets refund
      status: netAmount <= 0 ? 'settled' : 'pending',
      specialBreakdown: stats.specialBreakdown
    };
  });

  return {
    month: monthStr,
    totalGeneralCost: Number(totalGeneralCost.toFixed(2)),
    totalSpecialCost: Number(totalSpecialCost.toFixed(2)),
    totalOverallExpense: Number(totalOverallExpense.toFixed(2)),
    totalGroupMeals,
    mealRate: Number(mealRate.toFixed(2)),
    bills
  };
}

module.exports = {
  calculateMonthlyBillsData
};
