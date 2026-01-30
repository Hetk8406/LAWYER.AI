const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const axios = require('axios');
const path = require('path');
const jwt = require('jsonwebtoken');

// Import routes
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const userProfileRoutes = require('./routes/userProfile');
const contactRoutes = require('./routes/contactRoutes');
const errorHandler = require('./middleware/errorHandler');
const ipcRoutes = require('./routes/ipcRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:5000', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];
        // Allow requests with no origin, localhost, or ANY ngrok domain
        if (!origin || allowedOrigins.includes(origin) || origin.includes('ngrok-free')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Access-Control-Allow-Headers',
        'Access-Control-Request-Headers',
        'Access-Control-Allow-Origin'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

const { initSocket } = require('./socket');

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/profile', userProfileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ipc', ipcRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/courtroom', require('./routes/courtroomRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// ...

app.get("/api/chatbot", (req, res) => {
    res.json({ chatbotId: "67adae0c9e89a6ec0f140953", type: "default" });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    // Start cleanup job
    const startCleanupJob = require('./cleanupJob');
    startCleanupJob();

    // Drop the problematic username index on startup
    try {
        await mongoose.connection.db.collection('users').dropIndex('username_1');
        console.log('Dropped username index');
    } catch (err) {
        if (err.code !== 27) { // 27 is the error code for index not found
            console.error('Error dropping username index:', err);
        }
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Update user's last active timestamp middleware
app.use((req, res, next) => {
    if (req.user) {
        req.user.lastActive = new Date();
        req.user.save().catch(console.error);
    }
    next();
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    initSocket(server, corsOptions);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// 404 handler
// Serve static files from the React frontend app
const distPath = path.join(__dirname, '../dist');
console.log('Serving static files from:', distPath);
app.use(express.static(distPath));

// API 404 handler (Keep this for API routes)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API Route not found'
    });
});

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    console.log('Fallback to:', indexPath);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send(err.message);
        }
    });
});