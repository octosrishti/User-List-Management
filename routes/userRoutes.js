// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const User = require('../models/user');
const List = require('../models/list');
const { authenticate } = require('./authRoutes');
const { check, validationResult } = require('express-validator');

// CSV upload middleware
const upload = multer({ dest: 'uploads/' });

// Upload CSV
router.post('/upload-csv/:listId', [authenticate, upload.single('csv')], async (req, res, next) => {
    const { listId } = req.params;
    const users = [];
    let errors = [];

    // Fetch the list to get custom properties
    try {
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (row) => {
                const user = { name: row.name, email: row.email };
                list.customProperties.forEach(prop => {
                    user[prop.title] = row[prop.title] || prop.fallbackValue;
                });
                users.push(user);
            })
            .on('end', async () => {
                fs.unlinkSync(req.file.path); // Remove the CSV file after parsing
                let addedCount = 0;
                for (const user of users) {
                    try {
                        await User.create(user);
                        addedCount++;
                    } catch (err) {
                        errors.push({ user, error: err.message });
                    }
                }
                res.json({
                    message: `${addedCount} users added successfully`,
                    errors,
                    total: await User.countDocuments()
                });
            });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
