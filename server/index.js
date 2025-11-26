const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const recipeRoutes = require('./routes/recipes');
app.use('/api/recipes', recipeRoutes);

console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => {
        console.error("Failed to connect to MONGO_URI:", err.message);
        // Fallback to local MongoDB
        console.log("Attempting to connect to local MongoDB...");
        mongoose.connect('mongodb://localhost:27017/recipeApp')
            .then(() => console.log("Connected to local MongoDB"))
            .catch(localErr => console.error("Local MongoDB failed:", localErr));
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));