import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'instructor', 'student'], required: true },
  accountNumber: { type: String, unique: true, sparse: true },
  admissionNumber: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'active', 'blocked', 'suspended'], default: 'active' },
  plan: { type: String, enum: ['basic', 'premium'], default: 'basic' },
  isActivated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

const seedUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    console.log('🗑️  Clearing existing admin and instructor accounts...');
    await User.deleteMany({ role: { $in: ['super_admin', 'admin', 'instructor'] } });

    const hashedPassword = await bcrypt.hash('DavexLms##.7', 12);

    const seedData = [
      {
        fullName: 'Super Administrator',
        email: 'wanbrossmedia@gmail.com',
        password: hashedPassword,
        role: 'super_admin',
        accountNumber: '00001',
        status: 'active',
        plan: 'premium',
        isActivated: true,
      },
      {
        fullName: 'System Admin',
        email: 'admin@davex.com',
        password: hashedPassword,
        role: 'admin',
        accountNumber: '00002',
        status: 'active',
        plan: 'premium',
        isActivated: true,
      },
      {
        fullName: 'John Davex',
        email: 'instructorjohn@gmail.com',
        password: hashedPassword,
        role: 'instructor',
        accountNumber: '10001',
        status: 'active',
        plan: 'basic',
        isActivated: true,
      },
    ];

    console.log('📝 Creating seed users...');
    const users = await User.insertMany(seedData);

    console.log('\n✅ Seed completed successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 LOGIN CREDENTIALS (All use same password)');
    console.log('═══════════════════════════════════════════════════');
    console.log('Password for all accounts: Admin@123');
    console.log('───────────────────────────────────────────────────');
    
    users.forEach(user => {
      console.log(`\n${user.role.toUpperCase().replace('_', ' ')}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Account Number: ${user.accountNumber}`);
      console.log(`  Status: ${user.status}`);
    });
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🔐 IMPORTANT: Change these passwords after first login!');
    console.log('═══════════════════════════════════════════════════\n');

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedUsers();
