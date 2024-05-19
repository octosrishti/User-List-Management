require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes').router;
const listRoutes = require('./routes/listRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000; // Use the PORT defined in environment variables or default to 3000
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/userDB'; // Use the MongoDB URI defined in environment variables or default to local

app.get("/", (req, res) => {
    res.send("Welcome to ecommerce app");
  });

// Middleware
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/lists', listRoutes);
app.use('/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('Failed to connect to MongoDB', err);
});
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});
