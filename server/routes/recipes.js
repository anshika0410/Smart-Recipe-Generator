const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// POST: Get recipes based on ingredients
router.post('/search', async (req, res) => {
    const { ingredients } = req.body; // Array of user ingredients

    try {
        // Find recipes where at least one ingredient matches
        // Ideally, you want to sort by "most matches"
        const recipes = await Recipe.find({
            ingredients: { $in: ingredients.map(i => new RegExp(i, 'i')) }
        });

        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Get all recipes (for browsing)
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find().limit(20); // Requirement: Min 20 recipes 
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;