
require('dotenv').config();
const OpenAI = require('openai');

async function testKey() {
    console.log("Loading .env...");
    const key = process.env.OPENAI_API_KEY;

    if (!key) {
        console.error("ERROR: OPENAI_API_KEY is undefined or empty.");
        return;
    }

    console.log(`Key found: ${key.substring(0, 5)}...${key.substring(key.length - 5)}`);
    console.log(`Key length: ${key.length}`);

    const openai = new OpenAI({ apiKey: key });

    try {
        console.log("Attempting to connect to OpenAI...");
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Hello" }],
            model: "gpt-3.5-turbo",
        });
        console.log("SUCCESS! Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("FAILED! Error Name:", error.name);
        console.error("Error Message:", error.message);
        // console.error("Full Error:", error);
    }
}

testKey();
