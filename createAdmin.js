import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import Customer from './models/Customer.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_delivery_DB';

async function createAdmin() {
    try {
        // Connect to database
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Customer.findOne({ email: 'admin@fooddelivery.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('Admin1234*', 10);

        const admin = new Customer({
            name: 'Admin User',
            email: 'admin@fooddelivery.com',
            phone: '+216000000000',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            isActive: true,
            language: 'en'
        });

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@fooddelivery.com');
        console.log('Password: Admin1234*');
        console.log('\nYou can now login with these credentials to test admin endpoints.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
}

createAdmin();
