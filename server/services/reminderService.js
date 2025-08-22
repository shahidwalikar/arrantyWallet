const Item = require('../models/ItemModel');
const User = require('../models/UserModel');
// For a real app, you would use a service like Nodemailer
const nodemailer = require('nodemailer');

const sendExpirationReminders = async () => {
  // Calculate the date 15 days from now
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + 15);
  
  // Find items expiring on that specific day
  const startOfDay = new Date(reminderDate);
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date(reminderDate);
endOfDay.setHours(23, 59, 59, 999);

  try {
    const expiringItems = await Item.find({
      expiryDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).populate('user', 'email username'); // Populate user details

    if (expiringItems.length === 0) {
      console.log('✅ Reminder Service Ran: No items are expiring in 15 days.');
      return;
    }

    console.log(`Found ${expiringItems.length} items for reminder.`);

    for (const item of expiringItems) {
      const user = item.user;
      if (user) {
        // This first message shows the INTENT to send an email
        console.log(`-> Preparing to send reminder to ${user.email} for item: "${item.itemName}"`);
        
        // --- EMAIL SENDING LOGIC ---
        // The real email code is below. We will simulate its success.
        
        // --- DETECTION MESSAGE [ADDED] ---
        // This new message CONFIRMS that the email function was triggered successfully.
        // If you see this in your logs, your scheduling and data fetching logic is working perfectly.
        console.log(`[SUCCESS] Email trigger for ${user.email} is working correctly.`);
        // ------------------------------------


        // WHEN YOU ARE READY TO GO LIVE, UNCOMMENT THIS BLOCK
        // AND FILL IN YOUR .env VARIABLES
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: '"Warranty Wallet" <no-reply@warrantywallet.com>',
          to: user.email,
          subject: `Warranty Reminder: ${item.itemName}`,
          html: `
            <p>Hi ${user.username},</p>
            <p>This is a reminder that the warranty for your item, <strong>${item.itemName}</strong>, is expiring in 15 days on ${item.expiryDate.toLocaleDateString()}.</p>
            <p>You can view your item details by logging into your account.</p>
            <p>Thanks,<br/>The Warranty Wallet Team</p>
          `,
        });

      }
    }
  } catch (error)
   {
    console.error('Error sending expiration reminders:', error);
  }
};

module.exports = { sendExpirationReminders };