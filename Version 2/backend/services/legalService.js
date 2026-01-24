const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const legalData = [];

// Load all JSON files on startup
try {
    const files = fs.readdirSync(dataDir);
    files.forEach(file => {
        if (path.extname(file).toLowerCase() === '.json') {
            try {
                const filePath = path.join(dataDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const jsonData = JSON.parse(fileContent);

                // Normalize and add to master list
                const sourceName = file.replace('.json', ''); // e.g., 'IPC', 'CrPC'

                if (Array.isArray(jsonData)) {
                    jsonData.forEach(item => {
                        legalData.push({
                            source: sourceName,
                            section: item.Section || item['IPC Section'] || item.article || '',
                            title: item.Title || item.Offence || '',
                            description: item.Description || item.description || '',
                            example: item.Example || item.example || '', // Added example support
                            ...item // Keep original fields just in case
                        });
                    });
                }
                console.log(`[LegalService] Loaded ${jsonData.length} records from ${file}`);
            } catch (err) {
                console.error(`[LegalService] Error loading ${file}:`, err.message);
            }
        }
    });
    console.log(`[LegalService] Total legal records loaded: ${legalData.length}`);
} catch (err) {
    console.error('[LegalService] Failed to read data directory:', err.message);
}

const searchLegalData = async (query) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase().trim();

    // Split query into significant tokens (ignore small words like 'the', 'is', 'of')
    const tokens = lowerQuery.split(/[^a-z0-9]+/).filter(t => t.length > 2 && !['the', 'and', 'for', 'that', 'with'].includes(t));
    if (tokens.length === 0) return [];

    const results = legalData.map(item => {
        let score = 0;
        const section = (item.section || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const source = (item.source || '').toLowerCase();

        // 1. Exact Source + Section Match (Highest Priority)
        const queryHasSource = source && lowerQuery.includes(source);

        // Extract numbers from query and section for precise matching
        const queryNumbers = lowerQuery.match(/\d+/g) || [];
        const sectionNumbers = section.match(/\d+/g) || [];

        // Check if ANY number in the query EXACTLY matches a number in the section ID
        // This prevents "Section 4" from matching "Section 41" just because of substring
        const exactNumberMatch = queryNumbers.some(qn => sectionNumbers.includes(qn));

        if (queryHasSource && exactNumberMatch) score += 50;
        if (exactNumberMatch) score += 40; // High boost for matching the specific number
        if (section === lowerQuery) score += 100; // Perfect match

        // 2. Title Match (High Priority)
        if (title.includes(lowerQuery)) score += 30;

        // 3. Token Matching (Bag of Words)
        tokens.forEach(token => {
            // Only give high points for token matching SECTION if it is a number
            if (section.includes(token)) {
                if (/\d/.test(token)) score += 10; // It's a number (e.g. '302'), good match
                else score += 1; // It's just text (e.g. 'ipc'), weak match
            }
            if (title.includes(token)) score += 5;
            if (desc.includes(token)) score += 1;
            if (source.includes(token)) score += 1;
        });

        // Boost for "Drafting" queries if item is related to contracts/agreements
        if (lowerQuery.includes('draft') || lowerQuery.includes('agreement')) {
            if (title.includes('contract') || title.includes('agreement') || desc.includes('draft')) score += 5;
        }

        return { ...item, score };
    });

    // Filter relevant results and sort by score
    // Threshold adjusted to 25 to force generic queries (score ~5-10) to Fallback
    // Direct hits like "Murder" (30+) or "Section 302" (40+) will still pass.
    return results
        .filter(r => r.score >= 25)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Return top 5
};


module.exports = { searchLegalData };
