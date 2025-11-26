const express = require('express');
const router = express.Router();
const sampleRecipes = require('../data');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const userData = require('../userData');

// POST: Search recipes based on ingredients (local first, then Gemini)
router.post('/search', async (req, res) => {
    const { ingredients, filters } = req.body; // filters: { difficulty, maxTime, dietary }
    if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ message: "No ingredients provided" });
    }

    const { difficulty, maxTime, dietary } = filters || {};

    try {
        // Local search with filters
        const localRecipes = sampleRecipes.filter(recipe => {
            // 1. Ingredient match
            const hasIngredients = recipe.ingredients.some(recipeIng =>
                ingredients.some(userIng => new RegExp(userIng, 'i').test(recipeIng))
            );
            if (!hasIngredients) return false;

            // 2. Difficulty filter
            if (difficulty && recipe.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false;

            // 3. Time filter (maxTime)
            if (maxTime && recipe.time > parseInt(maxTime)) return false;

            // 4. Dietary filter (must match ALL selected)
            if (dietary && dietary.length > 0) {
                const recipeDietary = recipe.dietary.map(d => d.toLowerCase());
                const hasAllDietary = dietary.every(d => recipeDietary.includes(d.toLowerCase()));
                if (!hasAllDietary) return false;
            }

            return true;
        });

        if (localRecipes.length > 0) {
            return res.json(localRecipes);
        }

        // Gemini fallback
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured in .env");
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Construct filter instructions for prompt
        let filterInstructions = "";
        if (difficulty) filterInstructions += `Difficulty should be ${difficulty}. `;
        if (maxTime) filterInstructions += `Preparation time must be under ${maxTime} minutes. `;
        if (dietary && dietary.length > 0) filterInstructions += `Must be ${dietary.join(" and ")}. `;

        const prompt = `
      Create 3 unique recipes using some or all of these ingredients: ${ingredients.join(", ")}.
      You can add common pantry items (oil, salt, pepper, etc.).
      ${filterInstructions}

      Return the response ONLY as a JSON array with this exact schema for each recipe:
      [
        {
          "name": "Recipe Name",
          "image": "https://loremflickr.com/800/600/food,dinner",
          "ingredients": ["List", "of", "ingredients"],
          "instructions": ["Step 1", "Step 2"],
          "nutrition": { "calories": 500, "protein": "20g", "carbs": "50g" },
          "difficulty": "Easy/Medium/Hard",
          "time": 30,
          "dietary": ["Vegetarian", "Gluten-Free"]
        }
      ]
      Do not include markdown formatting like json. Just the raw JSON array.
    `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const recipes = JSON.parse(jsonStr);
        res.json(recipes);
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({
            message: "Failed to generate recipes. Please check that your GEMINI_API_KEY is valid and try again.",
            error: err.message
        });
    }
});

// GET: List a subset of recipes for browsing
router.get('/', async (req, res) => {
    try {
        const recipes = sampleRecipes.slice(0, 20);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Rate a recipe (rating 1-5)
router.post('/rate/:id', (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating' });
    }
    userData.setRating(id, rating);
    res.json({ message: 'Rating saved' });
});

// POST: Favorite or unfavorite a recipe
router.post('/favorite/:id', (req, res) => {
    const { id } = req.params;
    const { favorite } = req.body; // true to favorite, false to remove
    userData.setFavorite(id, !!favorite);
    res.json({ message: favorite ? 'Added to favorites' : 'Removed from favorites' });
});

// GET: Suggest recipes based on ratings and favorites
router.get('/suggestions', (req, res) => {
    const ratings = userData.getRatings();
    const favorites = userData.getFavorites();
    const scored = sampleRecipes.map(r => ({
        recipe: r,
        rating: ratings[r._id] || 0,
        favorite: favorites[r._id] ? 1 : 0
    }));
    scored.sort((a, b) => {
        if (b.favorite !== a.favorite) return b.favorite - a.favorite;
        return b.rating - a.rating;
    });
    const suggestions = scored.slice(0, 5).map(s => s.recipe);
    res.json(suggestions);
});

module.exports = router;