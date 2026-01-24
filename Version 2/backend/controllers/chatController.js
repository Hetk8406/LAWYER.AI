const ChatSession = require('../models/ChatSession');
const legalService = require('../services/legalService');
// const { findIPC } = require('../services/ipcService'); // Deprecated in favor of legalService // Fallback service
const axios = require('axios');
// const OpenAI = require('openai'); // Deprecated

// Google Gemini Initialization handled in helper
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper function to get answer from Python ML Service
const getMLAnswer = async (question) => {
    try {
        const response = await axios.post('http://localhost:5001/api/get-answer', { question });
        if (response.data && response.data.status === 'success') {
            return { answer: response.data.answer, confidence: response.data.confidence };
        }
        return null;
    } catch (error) {
        return null;
    }
};

// Helper function to get answer from OpenAI (ChatGPT)
// Helper function to get answer from Google Gemini
const getGeminiAnswer = async (question) => {
    if (!process.env.GEMINI_API_KEY) return null;
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-1.5-flash for speed and efficiency
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are LawAI, a helpful and intelligent legal assistant for Indian Law. 
        You provide accurate, concise, and professional answers. 
        If it's a legal question, provide broad context and cite relevant acts (IPC, CrPC, etc.) if possible.
        User Query: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        return null;
    }
};

// Simulated AI Response (Offline Mode)
const getSimulatedAnswer = async (query) => {
    // Basic keyword matching for demo/offline purposes
    const lowerQuery = query.toLowerCase();

    // Check IPC Service first
    // Check Legal Service (IPC, CrPC, etc.)
    try {
        const legalResults = await legalService.searchLegalData(query);
        if (legalResults && legalResults.length > 0) {
            const topResult = legalResults[0];
            let response = `**Found in ${topResult.source}:**\n\n**Section ${topResult.section}**: ${topResult.title}\n\n*Description*: ${topResult.description}`;

            if (topResult.example) {
                response += `\n\n**Example**: ${topResult.example}`;
            }

            return response;
        }
    } catch (e) { console.error("Legal Search Error:", e); }


    // Removed hardcoded checks to allow Gemini to handle all general/drafting queries.


    // If no specific legal data found and no hardcoded match, return null to allow Gemini to take over
    return null;
};

const sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ status: 'error', message: 'Message is required' });
        }

        let session;
        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, userId });
        }

        // If no session exists or ID not found, create one
        if (!session) {
            session = new ChatSession({ userId, messages: [] });
        }

        // Update Title if it's the first message
        if (session.messages.length === 0) {
            session.title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        }

        // Save User Message
        session.messages.push({ role: 'user', content: message });

        let botResponse = null;
        let source = 'none';

        // 1. Try Local ML 
        const mlResult = await getMLAnswer(message);
        if (mlResult) {
            botResponse = mlResult.answer;
            source = 'ml';
        }

        // 2. Try Local Legal Data (JSON) - Strict Search
        if (!botResponse) {
            botResponse = await getSimulatedAnswer(message);
            if (botResponse) source = 'simulated';
        }

        // 3. Try Gemini (Fallback for General Qs or No JSON Match)
        if (!botResponse) {
            const aiResponse = await getGeminiAnswer(message);
            if (aiResponse) {
                botResponse = aiResponse;
                source = 'gemini';
            }
        }

        // Save Bot Message
        session.messages.push({ role: 'bot', content: botResponse });
        await session.save();

        res.status(200).json({
            status: 'success',
            data: {
                response: botResponse,
                sessionId: session._id,
                title: session.title,
                source
            }
        });

    } catch (error) {
        console.error("Chat Error:", error);
        // RETURN A FRIENDLY ERROR INSTEAD OF 500
        res.status(200).json({
            status: 'success',
            data: {
                response: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
                sessionId: req.body.sessionId // Return ID if possible to keep chat alive
            }
        });
    }
};

const createSession = async (req, res) => {
    try {
        const session = new ChatSession({
            userId: req.user.id,
            messages: []
        });
        await session.save();
        res.status(201).json({ status: 'success', data: session });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to create session' });
    }
};

const getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user.id }).sort({ lastUpdated: -1 });
        res.status(200).json({ status: 'success', data: sessions });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch sessions' });
    }
};

const getSession = async (req, res) => {
    try {
        const session = await ChatSession.findOne({ _id: req.params.sessionId, userId: req.user.id });
        if (!session) return res.status(404).json({ status: 'error', message: 'Session not found' });
        res.status(200).json({ status: 'success', data: session });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to load session' });
    }
};

const deleteSession = async (req, res) => {
    try {
        await ChatSession.findOneAndDelete({ _id: req.params.sessionId, userId: req.user.id });
        res.status(200).json({ status: 'success', message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to delete session' });
    }
};

module.exports = { createSession, getSessions, getSession, deleteSession, sendMessage };
