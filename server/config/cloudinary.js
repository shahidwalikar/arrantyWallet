// server/config/cloudinary.js

const cloudinary = require('cloudinary').v2;

// --- TEMPORARY DEBUGGING ---
// These will still be undefined because the .env file is not set up correctly for them
console.log('Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Cloudinary API Key:', process.env.CLOUDINARY_API_KEY);
// -------------------------

// --- THIS IS THE TEMPORARY CODE FOR TESTING ---
// It uses your keys directly as strings.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;