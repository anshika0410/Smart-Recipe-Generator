const express = require('express');
const router = express.Router();
const sampleRecipes = require('../data');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
// We initialize inside the route or here. 
// If we initialize here, we need to make sure process.env is ready.
// But safely, we can do it inside or check if key exists.
// Given the previous issues, let's keep it simple but safe.

// POST: Get recipes based on ingredients
router.post('/search', async (req, res) => {
    const { ingredients } = req.body; // Array of user ingredients
    console.log("Received search for ingredients:", ingredients);

    if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ message: "No ingredients provided" });
    }

    try {
        // 1. Try to find recipes locally first
        const localRecipes = sampleRecipes.filter(recipe =>
            recipe.ingredients.some(recipeIng =>
                ingredients.some(userIng => new RegExp(userIng, 'i').test(recipeIng))
            )
        );

        if (localRecipes.length > 0) {
            console.log("Found local recipes:", localRecipes.length);
            return res.json(localRecipes);
        }

        // 2. If no local recipes found, use Gemini
        console.log("No local recipes found. Generating with Gemini...");

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured in .env");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Create 3 unique recipes using some or all of these ingredients: ${ingredients.join(", ")}.
            You can add common pantry items (oil, salt, pepper, etc.).
            
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
            Do not include markdown formatting like \`\`\`json. Just the raw JSON array.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini raw response:", text);

        // Clean up potential markdown formatting if Gemini adds it
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