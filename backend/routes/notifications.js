const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

admin.initializeApp({
  credential: admin.credential.cert(require('../path-to-firebase-adminsdk.json')),
});

router.post('/send', async (req, res) => {
  const { userId, message } = req.body;
  try {
    const payload = {
      notification: {
        title: 'Financial Tracker Alert',
        body: message,
      },
    };
    // Assume user’s device token is stored in the User model
    const user = await require('../models/User').findById(userId);
    if (user.deviceToken) {
      await admin.messaging().sendToDevice(user.deviceToken, payload);
      res.json({ message: 'Notification sent' });
    } else {
      res.status(400).json({ message: 'No device token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;