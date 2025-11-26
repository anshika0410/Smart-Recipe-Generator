const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const recipeRoutes = require('./routes/recipes');
app.use('/api/recipes', recipeRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Catch-all route to serve React app
    // Use regex literal to avoid Express 5 path-to-regexp errors
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// No MongoDB connection needed for this demo
console.log('Skipping MongoDB connection.');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));