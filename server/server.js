require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const learningRoutes = require('./routes/learningRoutes');
const learningResourceRoutes = require('./routes/learningResourceRoutes');
const contactRoutes = require('./routes/contactRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Initialize express app
const app = express();

// Trust proxy for rate limiting (Cloud Run/Render)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
    'https://tushar-dev-1.onrender.com',
    'https://portfolio-tushar-bf51e.web.app',
    'https://portfolio-tushar-bf51e.firebaseapp.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow server-to-server or Postman requests
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Portfolio API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/learning-resources', learningResourceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    }
    // For non-API routes, we just return 404
    res.status(404).send('Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
🚀 Portfolio Server running in ${process.env.NODE_ENV || 'development'} mode
📡 API: http://localhost:${PORT}/api
🏥 Health: http://localhost:${PORT}/api/health
  `);
});

module.exports = app;
