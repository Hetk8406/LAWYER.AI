const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const IPC = require('../models/IPC');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedIPC = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');

        // Check if data exists
        const count = await IPC.countDocuments();
        if (count > 0) {
            console.log('IPC data already exists. Skipping seed.');
            process.exit();
        }

        const jsonPath = path.join(__dirname, '../data/IPC.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        const ipcDocs = jsonData.map(item => ({
            section: item['IPC Section'],
            description: item['Description'],
            offence: item['Offence'],
            natureOfOffence: item['Nature of Offence'],
            punishment: item['Punishment'],
            bailable: item['Bailable or Not'],
            consequences: item['Consequences'],
            solutions: item['Solutions'],
            suggestions: item['Suggestions']
        }));

        await IPC.insertMany(ipcDocs);
        console.log(`Seeded ${ipcDocs.length} IPC sections successfully.`);
        process.exit();
    } catch (error) {
        console.error('Error seeding IPC:', error);
        process.exit(1);
    }
};

seedIPC();
