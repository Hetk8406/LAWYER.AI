const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A blog must have a title'],
    trim: true,
    maxlength: [100, 'A blog title must have less than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'A blog must have content'],
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  image: {
    type: String,
    default: 'default-blog.jpg'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A blog must have an author']
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate comments
blogSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'blog',
  localField: '_id'
});

// Index for faster queries
blogSchema.index({ author: 1, createdAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
