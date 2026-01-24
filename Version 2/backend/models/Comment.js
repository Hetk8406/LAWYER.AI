const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment cannot be empty'],
        trim: true
    },
    blog: {
        type: mongoose.Schema.ObjectId,
        ref: 'Blog',
        required: [true, 'Comment must belong to a blog post']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Comment must belong to a user']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Populate user info automatically
commentSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name profilePicture role'
    });
    next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
