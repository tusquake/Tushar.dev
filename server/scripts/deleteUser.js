require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const TARGET_EMAIL = 'tusharseth80@gmail.com';

async function run() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.\n');

    const user = await User.findOne({ email: TARGET_EMAIL.toLowerCase() });

    if (!user) {
        console.log(`No user found with email: ${TARGET_EMAIL}`);
    } else {
        console.log(`Found user: ${user.name} | ${user.email} | Role: ${user.role}`);
        await User.deleteOne({ email: TARGET_EMAIL.toLowerCase() });
        console.log(`Successfully deleted user: ${TARGET_EMAIL}`);
    }

    await mongoose.connection.close();
    console.log('Connection closed.');
}

run().catch(err => {
    console.error('Script error:', err.message);
    process.exit(1);
});
