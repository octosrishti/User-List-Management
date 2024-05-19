// routes/listRoutes.js
const express = require('express');
const router = express.Router();
const List = require('../models/list');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { authenticate } = require('./authRoutes');
const { check, validationResult } = require('express-validator');

// Create list
router.post('/', [
    authenticate,
    check('title').notEmpty(),
    check('customProperties').isArray()
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const newList = new List(req.body);
    try {
        await newList.save();
        res.json({ message: 'List created successfully' });
    } catch (err) {
        next(err);
    }
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send email to list
router.post('/:listId/send-email', [
    authenticate,
    check('subject').notEmpty(),
    check('body').notEmpty()
], async (req, res, next) => {
    const { listId } = req.params;
    const { subject, body } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        const users = await User.find({ unsubscribed: false });
        users.forEach(user => {
            let personalizedBody = body;
            personalizedBody = personalizedBody.replace('[name]', user.name).replace('[email]', user.email);
            list.customProperties.forEach(prop => {
                personalizedBody = personalizedBody.replace(`[${prop.title}]`, user[prop.title] || prop.fallbackValue);
            });
            personalizedBody += `\n\nTo unsubscribe, click here: ${process.env.BASE_URL}/users/unsubscribe/${user._id}`;

            const mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject,
                text: personalizedBody
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(`Error sending email to ${user.email}: ${error.message}`);
                }
            });
        });

        res.json({ message: 'Emails sent successfully' });
    } catch (err) {
        next(err);
    }
});

// Unsubscribe user
router.get('/unsubscribe/:userId', async (req, res, next) => {
    const { userId } = req.params;
    try {
        await User.findByIdAndUpdate(userId, { unsubscribed: true });
        res.send('You have been unsubscribed from this list.');
    } catch (err) {
        next(err);
    }
});

module.exports = router;

