import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputSection from './components/InputSection';
import RecipeCard from './components/RecipeCard';
import './App.css'; // Ensure you add some basic CSS for mobile responsiveness [cite: 24]

function App() {
    const [recipes, setRecipes] = useState([]);

    // Load default recipes on start
    useEffect(() => {
        axios.get('/api/recipes')
            .then(res => setRecipes(res.data))
            .catch(err => console.log(err));
    }, []);

    const searchRecipes = async (ingredients) => {
        try {
            const res = await axios.post('/api/recipes/search', { ingredients });
            setRecipes(res.data);
        } catch (error) {
            console.error("Error fetching recipes", error);
        }
    };

    return (
        <div className="App">
            <h1>Smart Recipe Generator</h1>
            <InputSection onSearch={searchRecipes} />
            <div className="recipe-grid">
                {recipes.map(recipe => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
            </div>
        </div>
    );
}
export default App;