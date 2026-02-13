/**
 * Database Seed Script
 * Creates test users for testing purposes
 * Run: node seedDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const testUsers = [
    {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Test@1234', // Will be hashed
        failedLoginAttempts: 0,
        lockUntil: null
    },
    {
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin@1234',
        failedLoginAttempts: 0,
        lockUntil: null
    },
    {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'JohnDoe@123',
        failedLoginAttempts: 0,
        lockUntil: null
    },
    {
        username: 'alice',
        email: 'alice@example.com',
        password: 'Alice@Password99',
        failedLoginAttempts: 0,
        lockUntil: null
    },
    {
        username: 'bob',
        email: 'bob@example.com',
        password: 'Bob$ecure2024',
        failedLoginAttempts: 0,
        lockUntil: null
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/secure_login_system');

        console.log('Connected to MongoDB');

        // Clear existing users (optional - comment out if you want to keep existing users)
        console.log('Clearing existing test users...');
        await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });

        // Create users with hashed passwords
        console.log('Creating test users...');
        const usersToInsert = await Promise.all(
            testUsers.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 12);
                return {
                    ...user,
                    password: hashedPassword
                };
            })
        );

        await User.insertMany(usersToInsert);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📝 Test Users Created:');
        console.log('═'.repeat(70));
        testUsers.forEach(user => {
            console.log(`Username: ${user.username.padEnd(15)} | Email: ${user.email.padEnd(25)} | Password: ${user.password}`);
        });
        console.log('═'.repeat(70));
        console.log('\n⚠️  NOTE: These are test credentials. Do NOT use in production!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase();
