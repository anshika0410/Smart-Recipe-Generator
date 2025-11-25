const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    name: String,
    image: String, // URL to image
    ingredients: [String], // List of ingredients for matching logic
    instructions: [String], // Step-by-step guide [cite: 13]
    nutrition: { // Nutritional info requirement [cite: 13]
        calories: Number,
        protein: String,
        carbs: String
    },
    difficulty: String, // For filtering [cite: 15]
    time: Number, // In minutes
    dietary: [String] // e.g., "Vegetarian", "Gluten-Free" [cite: 10]
});

module.exports = mongoose.model('Recipe', RecipeSchema);