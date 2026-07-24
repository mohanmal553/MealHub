const generateId = () => Math.random().toString(36).substring(2, 9);

// Initial Admin Account
const inMemUsers = [
  {
    _id: 'admin_1',
    name: 'MealHub Admin',
    email: 'mealhub.mohan@gmail.com',
    password: 'admin123',
    role: 'admin',
    roomNumber: 'A-101'
  }
];

const getInMemUserById = (id) => {
  if (!id) return null;
  return inMemUsers.find(u => u._id === id || u._id.toString() === id.toString()) || null;
};

const inMemStudents = [];
const inMemDailyMeals = [];
const inMemExpenses = [];
const inMemPayments = [];
const inMemMonthlyBills = [];
const inMemActivityLogs = [];

module.exports = {
  generateId,
  inMemUsers,
  getInMemUserById,
  inMemStudents,
  inMemDailyMeals,
  inMemExpenses,
  inMemPayments,
  inMemMonthlyBills,
  inMemActivityLogs
};
