const legalService = require('./backend/services/legalService');

(async () => {
    console.log("--- Testing Legal Service ---");
    // specific queries user failed with
    const queries = [
        "What is Section 41 of CrPC?",
        "Explain Section 10 of CPC"
    ];

    for (const q of queries) {
        console.log(`\nQuery: "${q}"`);
        try {
            const results = await legalService.searchLegalData(q);
            console.log(`Found ${results.length} results:`);
            results.forEach(r => {
                console.log(`[Score: ${r.score}] ${r.source} - ${r.section}: ${r.title}`);
            });
            if (results.length === 0) console.log("NO MATCHES FOUND.");
        } catch (e) {
            console.error("Search Error:", e);
        }
    }
})();
