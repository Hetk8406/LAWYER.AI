const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const IPC = require('./models/IPC');

dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Loading .env from:", path.join(__dirname, '.env'));
console.log("MONGO_URI present:", !!process.env.MONGO_URI);

const seedIPC = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected for Seeding");

        const dataPath = path.join(__dirname, 'data', 'IPC.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const sections = JSON.parse(rawData);

        // Transform data to match Schema if needed
        const formattedData = sections.map(item => ({
            section: item["IPC Section"],
            description: item["Description"],
            offence: item["Offence"],
            punishment: item["Punishment"],
            bailable: item["Bailable or Not"], // Schema expects String
            natureOfOffence: item["Nature of Offence"], // Mapped correctly
            consequences: item["Consequences"],
            solutions: item["Solutions"],
            suggestions: item["Suggestions"]
        }));

        // Deduplicate based on section
        const uniqueSections = [];
        const seenSections = new Set();

        for (const item of formattedData) {
            if (!seenSections.has(item.section)) {
                seenSections.add(item.section);
                uniqueSections.push(item);
            } else {
                console.warn(`Duplicate section skipped: ${item.section}`);
            }
        }

        await IPC.deleteMany(); // Clear existing
        console.log("Existing IPC data cleared");

        try {
            await IPC.insertMany(uniqueSections, { ordered: false });
            console.log(`Seeded ${uniqueSections.length} IPC sections successfully`);
        } catch (insertError) {
            if (insertError.writeErrors) {
                console.error(`Inserted ${insertError.insertedDocs.length} documents.`);
                console.error(`Failed to insert ${insertError.writeErrors.length} documents.`);
                console.error("First Error:", insertError.writeErrors[0].errmsg);
            } else {
                console.error("Insertion Error:", insertError.message);
            }
        }

        process.exit();
    } catch (error) {
        console.error("Seeding Error:", error.message);
        process.exit(1);
    }
};

seedIPC();
