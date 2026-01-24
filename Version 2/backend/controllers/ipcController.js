const { findIPC } = require('../services/ipcService');
const IPC = require('../models/IPC');

// @desc    Search IPC sections
// @route   GET /api/ipc/search
const searchIPCController = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ status: 'error', error: 'Search query is required.' });
        }

        console.log(`[IPC Controller] Received query: "${query}"`);
        const results = await findIPC(query);
        console.log(`[IPC Controller] Results found: ${results.length}`);

        if (!results || results.length === 0) {
            return res.status(404).json({ status: 'error', error: 'No results found.' });
        }

        res.json({ status: 'success', data: results });
    } catch (error) {
        console.error('Error in searchIPCController:', error);
        res.status(500).json({ status: 'error', error: 'Server error' });
    }
};

// @desc    Get all IPC sections (paginated)
const getAllIPC = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const sections = await IPC.find().skip(skip).limit(limit);
        const total = await IPC.countDocuments();

        res.json({
            status: 'success',
            data: sections,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

// @desc    Create new IPC section
const createIPC = async (req, res) => {
    try {
        const newSection = await IPC.create(req.body);
        res.status(201).json({ status: 'success', data: newSection });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

// @desc    Update IPC section
const updateIPC = async (req, res) => {
    try {
        const section = await IPC.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!section) return res.status(404).json({ status: 'error', message: 'Section not found' });
        res.json({ status: 'success', data: section });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

// @desc    Delete IPC section
const deleteIPC = async (req, res) => {
    try {
        const section = await IPC.findByIdAndDelete(req.params.id);
        if (!section) return res.status(404).json({ status: 'error', message: 'Section not found' });
        res.json({ status: 'success', message: 'Section deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

module.exports = {
    searchIPCController,
    getAllIPC,
    createIPC,
    updateIPC,
    deleteIPC
};
