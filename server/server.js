const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const { sendExpirationReminders } = require('./services/reminderService');
const app = express();
// Load environment variables
dotenv.config();

// Connect to the database
connectDB();
app.path()

app.use(express.static(path.join(__dirname, '../client'))); // Serve static files from 'public' directory
// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// API Routes
app.use('/api/users', authRoutes);
app.use('/api/items', itemRoutes);

// Scheduled Task for Reminders (runs every day at 8:00 AM)
cron.schedule('0 8 * * *', () => {
  console.log('Running daily check for warranty expirations...');
  sendExpirationReminders();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`),
    console.log(`http://localhost:${PORT}`)
);