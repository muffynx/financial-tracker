const express = require('express');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Add transaction
router.post('/', authMiddleware, async (req, res) => {
  const { amount, type, category, date, time, notes } = req.body; // เพิ่ม time
  try {
    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    // รวม date และ time เป็น Date object
    const dateTimeString = `${date}T${time}:00.000+07:00`; // e.g., "2025-08-20T09:48:00.000+07:00"
    const transactionDate = new Date(dateTimeString);

    if (isNaN(transactionDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date or time format' });
    }

    const transaction = new Transaction({
      userId: req.user.userId,
      amount: parseFloat(amount),
      type,
      category,
      date: transactionDate,
      notes,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get transactions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;