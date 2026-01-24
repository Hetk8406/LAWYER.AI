const User = require('../models/User');
const Blog = require('../models/Blog');

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const lawyers = await User.countDocuments({ role: 'lawyer' });
        const civilians = await User.countDocuments({ role: 'civilian' });
        const lawStudents = await User.countDocuments({ role: 'law_student' });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const totalBlogs = await Blog.countDocuments();

        res.json({
            status: 'success',
            data: {
                users: {
                    totalUsers,
                    lawyers,
                    civilians,
                    lawStudents,
                    adminUsers
                },
                blogs: {
                    totalBlogs
                }
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({
            status: 'success',
            data: { users } // Matching legacy format
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        // Prevent deleting self or other admins
        if (user.role === 'admin') {
            return res.status(400).json({ status: 'error', message: 'Cannot delete admin users' });
        }

        await user.deleteOne();
        res.json({ status: 'success', message: 'User removed' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

// @desc    Verify user (Lawyer approval)
// @route   PATCH /api/admin/users/:id/verify
// @access  Private/Admin
const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        user.verified = !user.verified; // Toggle verification
        await user.save();

        res.json({ status: 'success', data: { user } });
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

module.exports = {
    getStats,
    getAllUsers,
    deleteUser,
    verifyUser
};
