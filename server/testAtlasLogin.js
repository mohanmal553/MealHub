const mongoose = require('mongoose');
const User = require('./models/User');

const ATLAS_URI = 'mongodb+srv://mohanmal553_db_user:CYvsq0Gt531SduuD@cluster0.iuednzg.mongodb.net/mealhub?retryWrites=true&w=majority';

async function testAtlasLogin() {
  try {
    await mongoose.connect(ATLAS_URI);
    console.log('Connected to Atlas DB');

    const admin = await User.findOne({ email: 'mealhub.mohan@gmail.com' });
    if (!admin) {
      console.error('❌ Admin user NOT found on Atlas!');
      process.exit(1);
    }

    const isMatch = await admin.comparePassword('admin123');
    console.log(`Admin User Found: ${admin.email}`);
    console.log(`Password Match ('admin123'): ${isMatch}`);

    if (isMatch) {
      console.log('✅ ATLAS ADMIN LOGIN VERIFIED SUCCESSFULLY!');
      process.exit(0);
    } else {
      console.error('❌ Password comparison failed on Atlas!');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error testing Atlas login:', err);
    process.exit(1);
  }
}

testAtlasLogin();
