const mongoose = require('mongoose');
const User = require('../models/User');
const DailyMeal = require('../models/DailyMeal');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');

const ATLAS_URI = 'mongodb+srv://mohanmal553_db_user:CYvsq0Gt531SduuD@cluster0.iuednzg.mongodb.net/mealhub?retryWrites=true&w=majority';
const ALT_ATLAS_URI = 'mongodb+srv://mohanmal553_db_user:CYvsq0Gt531SduuD@cluster0.iuednzg.mongodb.net/?retryWrites=true&w=majority';

const seedAtlas = async () => {
  let connected = false;

  console.log('📡 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(ATLAS_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB Atlas (database: mealhub)');
    connected = true;
  } catch (err1) {
    console.warn('Attempting connection to root Atlas URI...', err1.message);
    try {
      await mongoose.connect(ALT_ATLAS_URI, { serverSelectionTimeoutMS: 8000 });
      console.log('✅ Connected to MongoDB Atlas root');
      connected = true;
    } catch (err2) {
      console.error('❌ Failed to connect to Atlas:', err2.message);
      process.exit(1);
    }
  }

  if (!connected) process.exit(1);

  try {
    console.log('🧹 Clearing existing MongoDB Atlas data...');
    await User.deleteMany({});
    await DailyMeal.deleteMany({});
    await Expense.deleteMany({});
    await Payment.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('👑 Creating Admin Account on Atlas (mealhub.mohan@gmail.com)...');
    const admin = await User.create({
      name: 'MealHub Admin',
      email: 'mealhub.mohan@gmail.com',
      password: 'admin123',
      role: 'admin',
      roomNumber: 'A-101',
      phone: '9876543210'
    });

    console.log('👥 Creating Student Accounts on Atlas...');
    const student1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      password: 'student123',
      role: 'student',
      roomNumber: 'A-102',
      phone: '9876543211'
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@gmail.com',
      password: 'student123',
      role: 'student',
      roomNumber: 'A-103',
      phone: '9876543212'
    });

    const student3 = await User.create({
      name: 'Amit Kumar',
      email: 'amit@gmail.com',
      password: 'student123',
      role: 'student',
      roomNumber: 'B-201',
      phone: '9876543213'
    });

    const student4 = await User.create({
      name: 'Sneha Verma',
      email: 'sneha@gmail.com',
      password: 'student123',
      role: 'student',
      roomNumber: 'B-202',
      phone: '9876543214'
    });

    const students = [student1, student2, student3, student4];

    console.log('🍲 Creating Daily Meals on Atlas...');
    const currentMonthStr = '2026-07';
    const mealsToInsert = [];

    for (let day = 1; day <= 25; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${currentMonthStr}-${dayStr}`;

      students.forEach((st, idx) => {
        let isOff = false;
        if (idx === 0 && (day === 5 || day === 18)) isOff = true;
        if (idx === 1 && (day === 10 || day === 11)) isOff = true;
        if (idx === 2 && (day === 15 || day === 22)) isOff = true;
        if (idx === 3 && (day === 7 || day === 14)) isOff = true;

        mealsToInsert.push({
          date: dateStr,
          student: st._id,
          status: isOff ? 'OFF' : 'ON',
          mealCount: isOff ? 0 : (day % 3 === 0 ? 2 : 1),
          note: isOff ? 'Out of town' : '',
          updatedBy: admin._id
        });
      });
    }

    await DailyMeal.insertMany(mealsToInsert);

    console.log('🛒 Creating Expenses on Atlas...');
    const expensesToInsert = [
      {
        date: '2026-07-02',
        itemName: 'Vegetables & Rice Batch 1',
        category: 'general',
        cost: 1200,
        paidBy: admin._id,
        paidByName: admin.name,
        notes: 'Fresh vegetables and rice'
      },
      {
        date: '2026-07-05',
        itemName: 'Cooking Oil & Spices',
        category: 'general',
        cost: 1800,
        paidBy: admin._id,
        paidByName: admin.name,
        notes: 'Monthly staples'
      },
      {
        date: '2026-07-10',
        itemName: 'LPG Gas Cylinder Refill',
        category: 'general',
        cost: 1150,
        paidBy: admin._id,
        paidByName: admin.name,
        notes: 'Gas refill'
      },
      {
        date: '2026-07-12',
        itemName: 'Sunday Special Chicken Biryani',
        category: 'special',
        cost: 1600,
        paidBy: admin._id,
        paidByName: admin.name,
        notes: 'Special feast'
      },
      {
        date: '2026-07-15',
        itemName: 'Weekly Green Vegetables',
        category: 'general',
        cost: 950,
        paidBy: admin._id,
        paidByName: admin.name,
        notes: 'Fresh veggies'
      },
      {
        date: '2026-07-19',
        itemName: 'Paneer Butter Masala Special',
        category: 'special',
        cost: 1200,
        paidBy: admin._id,
        paidByName: admin.name,
        notes: 'Weekend dinner'
      },
      {
        date: '2026-07-20',
        itemName: 'Milk & Breakfast Supplies',
        category: 'general',
        cost: 850,
        paidBy: admin._id,
        paidByName: admin.name,
        notes: 'Breakfast goods'
      },
      {
        date: '2026-07-24',
        itemName: 'Vegetables & Grocery Batch 2',
        category: 'general',
        cost: 1400,
        paidBy: admin._id,
        paidByName: admin.name,
        notes: 'Weekly fresh vegetables'
      }
    ];

    await Expense.insertMany(expensesToInsert);

    console.log('💳 Creating Payments on Atlas...');
    const paymentsToInsert = [
      {
        date: '2026-07-01',
        month: '2026-07',
        student: student1._id,
        amount: 1500,
        paymentMethod: 'UPI',
        note: 'July Advance Deposit'
      },
      {
        date: '2026-07-01',
        month: '2026-07',
        student: student2._id,
        amount: 1500,
        paymentMethod: 'UPI',
        note: 'July Advance Deposit'
      },
      {
        date: '2026-07-03',
        month: '2026-07',
        student: student3._id,
        amount: 1200,
        paymentMethod: 'Cash',
        note: 'July Advance Deposit'
      },
      {
        date: '2026-07-02',
        month: '2026-07',
        student: student4._id,
        amount: 1500,
        paymentMethod: 'Bank Transfer',
        note: 'July Advance Deposit'
      }
    ];

    await Payment.insertMany(paymentsToInsert);

    await ActivityLog.create({
      actionType: 'ATLAS_SEED',
      entityName: 'MongoDB Atlas',
      description: 'Seeded admin and student accounts along with daily meals, expenses, and payments.',
      oldValue: 'Empty Atlas DB',
      newValue: 'Seeded Atlas DB',
      performedBy: admin.name,
      performedByRole: 'admin',
      date: '2026-07-25'
    });

    console.log('\n======================================================');
    console.log('🚀 MONGODB ATLAS SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Admin Credentials (Atlas):');
    console.log('  Email:    mealhub.mohan@gmail.com');
    console.log('  Password: admin123');
    console.log('------------------------------------------------------');
    console.log('Student Credentials (Atlas):');
    console.log('  1. rahul@gmail.com    / student123');
    console.log('  2. priya@gmail.com    / student123');
    console.log('  3. amit@gmail.com     / student123');
    console.log('  4. sneha@gmail.com    / student123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during Atlas seeding:', err);
    process.exit(1);
  }
};

seedAtlas();
