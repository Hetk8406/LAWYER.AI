const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const verifyGemini = async () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing in .env");
        process.exit(1);
    }

    if (apiKey.startsWith("AIzaSy...")) {
        console.warn("⚠️ WARNING: It looks like you still have the placeholder key.");
    }

    console.log(`🔑 Key found: ${apiKey.substring(0, 8)}...`);

    try {
        console.log("📡 Connecting to Google Gemini...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Hello! Are you working? Reply with 'Yes, I am Gemini!'");
        const response = await result.response;
        const text = response.text();

        console.log("✅ SUCCESS: Gemini responded!");
        console.log(`🤖 Response: ${text}`);
    } catch (error) {
        console.error("❌ FAILURE: Could not connect to Gemini.");
        console.error(`Error: ${error.message}`);
    }
};

verifyGemini();
