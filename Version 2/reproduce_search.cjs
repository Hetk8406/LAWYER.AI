const fs = require('fs');
const path = require('path');

const ipcDataPath = path.join(__dirname, 'backend', 'data', 'IPC.json');
console.log(`Reading from: ${ipcDataPath}`);

try {
    const rawData = fs.readFileSync(ipcDataPath, 'utf-8');
    const parsedData = JSON.parse(rawData);

    // Map JSON fields to our application's schema format
    const ipcData = parsedData.map(item => ({
        section: item["IPC Section"],
        description: item["Description"],
        offence: item["Offence"],
    }));

    console.log(`Loaded ${ipcData.length} items.`);

    const query = "302";
    const lowerQuery = query.toLowerCase().trim();

    console.log(`Searching for "${query}" (normalized: "${lowerQuery}")`);

    const results = ipcData.filter(item => {
        const sectionMatch = item.section && item.section.toLowerCase().includes(lowerQuery);
        // const offenceMatch = item.offence && item.offence.toLowerCase().includes(lowerQuery); // Commented out to focus on section match first

        if (sectionMatch) {
            console.log(`Match found: ${item.section}`);
        }
        return sectionMatch;
    });

    console.log(`Total matches for "${query}": ${results.length}`);

} catch (error) {
    console.error("Error:", error);
}
