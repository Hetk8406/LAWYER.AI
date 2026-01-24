const Message = require('./models/Message');

const runCleanup = async () => {
    try {
        const days = 15;
        const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const result = await Message.deleteMany({ createdAt: { $lt: threshold } });
        if (result.deletedCount > 0) {
            console.log(`[Cleanup] Deleted ${result.deletedCount} messages older than ${days} days.`);
        } else {
            // content log to avoid spamming console
            // console.log(`[Cleanup] No messages older than ${days} days found.`);
        }
    } catch (err) {
        console.error('[Cleanup] Error deleting old messages:', err);
    }
};

const startCleanupJob = () => {
    console.log('[Cleanup] Scheduled job initialized: Deleting messages older than 15 days.');

    // Run once on startup after a small delay to ensure DB connection
    setTimeout(runCleanup, 5000);

    // Run every 24 hours
    setInterval(runCleanup, 24 * 60 * 60 * 1000);
};

module.exports = startCleanupJob;
