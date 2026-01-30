const axios = require('axios');

async function testChat() {
    try {
        // 1. Login to get token (if needed) or mock it.
        // Since we don't have easy login mock, we might need to bypass auth or use a known user.
        // Actually, let's just try to hit the endpoint. If it needs auth, we'll get 401.
        // Assuming we need a token. Let's try to login first.

        // Wait, I can't easily login without a real user password.
        // But I can check server.js... wait, the user is running the server. I can't inject code easily.

        // I'll try to use the 'check_users.cjs' logic to find a user and maybe I can't login.

        // Alternative: I can use the `sendMessage` function directly if I mock the req/res?
        // No, I need to test the running server.

        console.log("Skipping auth for now, checking if server is up...");

        // Let's just try to hit the health check or root
        // The user says "Ai Chat Page is still seen in red".

        // Let's try to curl the chatbot endpoint?
        // backend/server.js: app.get("/api/chatbot"...)

        const res = await axios.get('http://localhost:5000/api/chatbot');
        console.log("Server is reachable:", res.data);

    } catch (error) {
        console.error("Test Failed:", error.message);
        if (error.response) console.error("Status:", error.response.status);
    }
}

testChat();
