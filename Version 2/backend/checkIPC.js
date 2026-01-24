const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const IPC = require('./models/IPC');

dotenv.config({ path: path.join(__dirname, '.env') });

const countIPC = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected");

        const count = await IPC.countDocuments();
        console.log(`Total IPC Documents in DB: ${count}`);

        if (count > 0) {
            const sample = await IPC.findOne();
            console.log("Sample Document:", sample);
        }

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

countIPC();
