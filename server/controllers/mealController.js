const mongoose = require('mongoose');
const DailyMeal = require('../models/DailyMeal');
const { inMemDailyMeals, generateId } = require('../utils/inMemoryStore');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get meals for a specific month
// @route   GET /api/meals?month=YYYY-MM
const getMealsByMonth = async (req, res) => {
  const month = req.query.month || new Date().toISOString().substring(0, 7);

  try {
    const dbMeals = await DailyMeal.find({ date: { $regex: `^${month}` } }).lean();
    return res.json(dbMeals || []);
  } catch (err) {
    console.error('Error fetching meals from DB:', err.message);
  }

  const memMeals = inMemDailyMeals.filter(m => m.date.startsWith(month));
  res.json(memMeals);
};

// @desc    Toggle or set single meal status (ON vs OFF)
// @route   POST /api/meals/toggle
const toggleMealStatus = async (req, res) => {
  const { date, studentId, status, mealCount, note } = req.body;

  if (!date || !studentId) {
    return res.status(400).json({ message: 'Date and studentId are required' });
  }

  const finalStatus = (status || 'ON').toUpperCase();
  const finalCount = mealCount !== undefined ? Number(mealCount) : (finalStatus === 'ON' ? 1 : 0);
  let oldStatus = finalStatus === 'ON' ? 'OFF' : 'ON';

  try {
    let sId = studentId;
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      sId = new mongoose.Types.ObjectId(studentId);
    }

    let meal = await DailyMeal.findOne({ date, student: { $in: [studentId, sId] } });
    if (meal) {
      oldStatus = meal.status;
      meal.status = finalStatus;
      meal.mealCount = finalCount;
      if (note !== undefined) meal.note = note;
      if (req.user && req.user._id) meal.updatedBy = req.user._id;
      await meal.save();
    } else {
      meal = await DailyMeal.create({
        date,
        student: sId,
        status: finalStatus,
        mealCount: finalCount,
        note: note || '',
        updatedBy: req.user?._id
      });
    }

    await logActivity({
      req,
      actionType: 'MEAL_TOGGLED',
      entityName: 'Meal Matrix',
      description: `Toggled meal status on ${date}`,
      oldValue: oldStatus,
      newValue: finalStatus
    });

    console.log(`✅ Meal DB Save Success: Date ${date}, Student ${studentId}, Status ${finalStatus}`);
    return res.json(meal);
  } catch (err) {
    console.error('Error saving meal to DB:', err);
  }

  const keyIndex = inMemDailyMeals.findIndex(m => m.date === date && (m.student === studentId || m.student?._id === studentId));
  if (keyIndex !== -1) {
    inMemDailyMeals[keyIndex].status = finalStatus;
    inMemDailyMeals[keyIndex].mealCount = finalCount;
    if (note !== undefined) inMemDailyMeals[keyIndex].note = note;
    return res.json(inMemDailyMeals[keyIndex]);
  } else {
    const newMeal = {
      _id: `meal_${date}_${studentId}`,
      date,
      student: studentId,
      status: finalStatus,
      mealCount: finalCount,
      note: note || ''
    };
    inMemDailyMeals.push(newMeal);
    return res.json(newMeal);
  }
};

// @desc    Bulk set meal statuses for a day
// @route   POST /api/meals/bulk-toggle
const bulkToggleMeals = async (req, res) => {
  const { date, mealUpdates } = req.body;

  if (!date || !Array.isArray(mealUpdates)) {
    return res.status(400).json({ message: 'Date and mealUpdates array required' });
  }

  try {
    for (const update of mealUpdates) {
      const finalStatus = (update.status || 'ON').toUpperCase();
      const finalCount = update.mealCount !== undefined ? Number(update.mealCount) : (finalStatus === 'ON' ? 1 : 0);
      
      let sId = update.studentId;
      if (mongoose.Types.ObjectId.isValid(update.studentId)) {
        sId = new mongoose.Types.ObjectId(update.studentId);
      }

      await DailyMeal.findOneAndUpdate(
        { date, student: { $in: [update.studentId, sId] } },
        { status: finalStatus, mealCount: finalCount, student: sId, updatedBy: req.user?._id },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Bulk Meal DB Save Success for date ${date}`);
    return res.json({ message: 'Meals updated successfully' });
  } catch (err) {
    console.error('Error bulk updating meals in DB:', err);
  }

  mealUpdates.forEach(update => {
    const sId = update.studentId;
    const finalStatus = (update.status || 'ON').toUpperCase();
    const finalCount = update.mealCount !== undefined ? Number(update.mealCount) : (finalStatus === 'ON' ? 1 : 0);

    const idx = inMemDailyMeals.findIndex(m => m.date === date && (m.student === sId || m.student?._id === sId));
    if (idx !== -1) {
      inMemDailyMeals[idx].status = finalStatus;
      inMemDailyMeals[idx].mealCount = finalCount;
    } else {
      inMemDailyMeals.push({
        _id: `meal_${date}_${sId}`,
        date,
        student: sId,
        status: finalStatus,
        mealCount: finalCount,
        note: ''
      });
    }
  });

  res.json({ message: 'Meals updated successfully' });
};

// @desc    Get student personal history
// @route   GET /api/meals/my-history
const getMyMealHistory = async (req, res) => {
  const studentId = req.user._id.toString();
  const month = req.query.month || new Date().toISOString().substring(0, 7);

  try {
    let sId = studentId;
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      sId = new mongoose.Types.ObjectId(studentId);
    }

    const dbMeals = await DailyMeal.find({
      student: { $in: [studentId, sId] },
      date: { $regex: `^${month}` }
    }).sort({ date: 1 }).lean();

    return res.json(dbMeals || []);
  } catch (err) {
    console.error('Error getting meal history from DB:', err);
  }

  const memMeals = inMemDailyMeals.filter(
    m => (m.student === studentId || m.student?._id === studentId) && m.date.startsWith(month)
  );
  res.json(memMeals);
};

module.exports = {
  getMealsByMonth,
  toggleMealStatus,
  bulkToggleMeals,
  getMyMealHistory
};
