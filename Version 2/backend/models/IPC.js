const mongoose = require('mongoose');

const ipcSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    offence: String,
    natureOfOffence: String,
    punishment: String,
    bailable: String,
    consequences: String,
    solutions: String,
    suggestions: String
}, {
    timestamps: true
});

const IPC = mongoose.models.IPC || mongoose.model('IPC', ipcSchema);

module.exports = IPC;
