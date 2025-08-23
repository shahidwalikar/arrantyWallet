const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const { sendExpirationReminders } = require('./services/reminderService');

// Load environment variables right at the beginning
dotenv.config();

const app = express();

// Connect to the database
connectDB();

// --- BEST PRACTICE CORS CONFIGURATION ---
// This should be one of the first middleware your app uses.
const allowedOrigins = [
  'https://warrantywallet.onrender.com'
  // You can add your local frontend URL here for testing if needed
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// --- END OF CORS CONFIGURATION ---


// --- MIDDLEWARE ---
// IMPORTANT: Middleware order matters! Body parsers should come after CORS.
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


// --- API ROUTES ---
// Your API routes are defined here.
app.use('/api/users', authRoutes);
app.use('/api/items', itemRoutes);


// --- SERVE STATIC FILES (FRONTEND) ---
// This serves your client-side files.
app.use(express.static(path.join(__dirname, '../client')));


// --- SCHEDULED TASKS ---
// This remains unchanged.
cron.schedule('0 8 * * *', () => {
  console.log('Running daily check for warranty expirations...');
  sendExpirationReminders();
});


// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});