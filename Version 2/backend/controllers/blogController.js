const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

// Get all blog posts
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const posts = await Blog.find(query)
      .populate('author', 'name role')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: posts
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get a single blog post
exports.getPost = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id)
      .populate('author', 'name role')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } }
      });

    if (!post) {
      return res.status(404).json({
        status: 'fail',
        message: 'Blog post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: post
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create a new blog post (Lawyers/Admin only)
exports.createPost = async (req, res) => {
  try {
    // Only lawyers or admins can create posts
    if (req.user.role !== 'lawyer' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only lawyers can create blog posts'
      });
    }

    const post = await Blog.create({
      ...req.body,
      author: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: post
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update a blog post (Author/Admin only)
exports.updatePost = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ status: 'fail', message: 'Blog post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'You can only edit your own posts' });
    }

    Object.assign(post, req.body);
    post.updatedAt = Date.now();
    await post.save();

    res.status(200).json({
      status: 'success',
      data: post
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete a blog post (Author/Admin only)
exports.deletePost = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ status: 'fail', message: 'Blog post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'You can only delete your own posts' });
    }

    // Use deleteOne() instead of remove() to avoid deprecation issues
    await Blog.deleteOne({ _id: post._id });
    await Comment.deleteMany({ blog: post._id }); // Cleanup comments

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Add a comment to a blog post
exports.addComment = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ status: 'fail', message: 'Blog post not found' });
    }

    const comment = await Comment.create({
      blog: post._id,
      user: req.user.id,
      content: req.body.content
    });

    // Populate user details for immediate display
    await comment.populate('user', 'name profilePicture role');

    res.status(201).json({
      status: 'success',
      data: comment
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
