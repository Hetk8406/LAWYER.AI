const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

const verifyAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected");

        const result = await User.updateMany({}, {
            $set: { verified: true, phoneVerified: true }
        });

        console.log(`Updated ${result.modifiedCount} users to verified status.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyAll();
