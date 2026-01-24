const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@lawai.com';
        const adminPassword = 'admin123';

        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin user found. Updating...');
            admin.role = 'admin';
            admin.verified = true;
            admin.phoneVerified = true;
            admin.password = adminPassword; // Triggers pre-save hash
            admin.markModified('password');
            await admin.save();
            console.log('Admin user updated.');
        } else {
            console.log('Creating new admin user...');
            admin = await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                phone: '+919876543210',
                verified: true,
                phoneVerified: true,
                gender: 'male',
                language: 'english',
                dob: { day: '01', month: '01', year: '1990' },
                termsAccepted: true
            });
            console.log('Admin user created.');
        }

        console.log(`\nDirect Login Credentials:\nEmail: ${adminEmail}\nPassword: ${adminPassword}\n`);
        process.exit();

    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
