const { findIPC } = require('./backend/services/ipcService');

async function valdiateIPC() {
    console.log("Testing findIPC integration...");
    try {
        // Wait a bit for the sync file read (though it's sync, so it blocks import)
        // IPC data loading is synchronous at module level.

        const query = "'302'";
        console.log(`Calling findIPC('${query}')`);
        const results = await findIPC(query);
        console.log("Results:", JSON.stringify(results, null, 2));
        console.log(`Count: ${results.length}`);
    } catch (err) {
        console.error("Test failed:", err);
    }
}

valdiateIPC();
