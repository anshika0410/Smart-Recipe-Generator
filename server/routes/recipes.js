const express = require('express');
const router = express.Router();
const sampleRecipes = require('../data');

// POST: Get recipes based on ingredients
router.post('/search', async (req, res) => {
    const { ingredients } = req.body; // Array of user ingredients

    try {
        // Find recipes where at least one ingredient matches
        const recipes = sampleRecipes.filter(recipe =>
            recipe.ingredients.some(recipeIng =>
                ingredients.some(userIng => new RegExp(userIng, 'i').test(recipeIng))
            )
        );

        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Get all recipes (for browsing)
router.get('/', async (req, res) => {
    try {
        const recipes = sampleRecipes.slice(0, 20);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;