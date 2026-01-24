const fs = require('fs');
const path = require('path');

// Load IPC data into memory once when the service starts
// This avoids reading the file on every request, which is efficient for ~500 items.
const ipcDataPath = path.join(__dirname, '..', 'data', 'IPC.json');
let ipcData = [];

try {
    const rawData = fs.readFileSync(ipcDataPath, 'utf-8');
    const parsedData = JSON.parse(rawData);

    // Map JSON fields to our application's schema format
    ipcData = parsedData.map(item => ({
        _id: item["Column1"] || Math.random().toString(36).substr(2, 9), // Use Column1 as ID or generate one
        section: item["IPC Section"],
        description: item["Description"],
        offence: item["Offence"],
        punishment: item["Punishment"],
        bailable: item["Bailable or Not"],
        natureOfOffence: item["Nature of Offence"],
        consequences: item["Consequences"], // Check if these exist in your JSON, mapping blindly based on previous code
        solutions: item["Solutions"]
    }));

    console.log(`[IPC Service] Loaded ${ipcData.length} sections from file.`);
} catch (error) {
    console.error(`[IPC Service] Failed to load IPC.json:`, error);
}

const findIPC = async (query) => {
    try {
        console.log(`[IPC Service - File Based] Searching for: "${query}"`);
        if (!query) return [];

        const lowerQuery = query.toLowerCase().trim().replace(/['"]/g, '');

        // Filter data in memory
        const results = ipcData.filter(item => {
            const sectionMatch = item.section && item.section.toLowerCase().includes(lowerQuery);
            const offenceMatch = item.offence && item.offence.toLowerCase().includes(lowerQuery);
            const descriptionMatch = item.description && item.description.toLowerCase().includes(lowerQuery);

            // You can add more fields if needed, e.g. keywords if they exist
            return sectionMatch || offenceMatch || descriptionMatch;
        });

        // Sort results: Exact/Partial Section match first
        results.sort((a, b) => {
            const aSecMatch = a.section && a.section.toLowerCase().includes(lowerQuery);
            const bSecMatch = b.section && b.section.toLowerCase().includes(lowerQuery);

            if (aSecMatch && !bSecMatch) return -1;
            if (!aSecMatch && bSecMatch) return 1;
            return 0;
        });

        console.log(`[IPC Service] Matches found: ${results.length}`);
        return results;

    } catch (error) {
        console.error("Error searching IPC (File-based):", error);
        throw error; // Controller will handle this
    }
};

module.exports = { findIPC };
