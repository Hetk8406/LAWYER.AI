const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'lawyer', 'law_student', 'admin'], default: 'user' },
    // Simplified schema for checking
});

const User = mongoose.model('User', UserSchema);

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected");

        const users = await User.find({}, 'name email role');
        console.log("All Users:", JSON.stringify(users, null, 2));

        // Simulate Logic check
        const lawyers = users.filter(u => u.role === 'lawyer');
        const civilians = users.filter(u => u.role === 'user');

        console.log(`stats: ${lawyers.length} lawyers, ${civilians.length} users`);

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkUsers();
