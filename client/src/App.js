import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import InputSection from './components/InputSection';
import RecipeCard from './components/RecipeCard';
import './App.css'; // Ensure you add some basic CSS for mobile responsiveness [cite: 24]

function App() {
    const [recipes, setRecipes] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [filters, setFilters] = useState({
        difficulty: '',
        maxTime: '',
        dietary: []
    });
    const [servingSize, setServingSize] = useState(2); // Default serving size
    const resultsRef = useRef(null);

    // Load default recipes and suggestions on start
    useEffect(() => {
        fetchRecipes();
        fetchSuggestions();
    }, []);

    const fetchRecipes = () => {
        axios.get('/api/recipes')
            .then(res => setRecipes(res.data))
            .catch(err => console.log(err));
    };

    const fetchSuggestions = () => {
        axios.get('/api/recipes/suggestions')
            .then(res => setSuggestions(res.data))
            .catch(err => console.log("Error fetching suggestions", err));
    };

    const searchRecipes = async (ingredients) => {
        try {
            const res = await axios.post('/api/recipes/search', { ingredients, filters });
            setRecipes(res.data);
            // Scroll to results after a short delay to ensure rendering
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error("Error fetching recipes", error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDietaryChange = (e) => {
        const { value, checked } = e.target;
        setFilters(prev => {
            const newDietary = checked
                ? [...prev.dietary, value]
                : prev.dietary.filter(d => d !== value);
            return { ...prev, dietary: newDietary };
        });
    };

    const handleRate = async (id, rating) => {
        try {
            await axios.post(`/api/recipes/rate/${id}`, { rating });
            fetchSuggestions(); // Refresh suggestions after rating
        } catch (error) {
            console.error("Error rating recipe", error);
        }
    };

    const handleFavorite = async (id, isFavorite) => {
        try {
            await axios.post(`/api/recipes/favorite/${id}`, { favorite: isFavorite });
            fetchSuggestions(); // Refresh suggestions after favoriting
        } catch (error) {
            console.error("Error favoriting recipe", error);
        }
    };

    return (
        <div className="App">
            <h1>Smart Recipe Generator</h1>

            <InputSection onSearch={searchRecipes} />

            <div className="filters-section" style={{
                padding: '25px',
                background: '#ffffff',
                marginBottom: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                maxWidth: '800px',
                margin: '0 auto 30px auto',
                textAlign: 'center'
            }}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Filters & Customization</h3>

                <div style={{
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
                        Difficulty:
                        <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} style={{
                            marginLeft: '10px',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #ddd'
                        }}>
                            <option value="">Any</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
                        Max Time:
                        <input type="number" name="maxTime" value={filters.maxTime} onChange={handleFilterChange} placeholder="mins" style={{
                            marginLeft: '10px',
                            width: '70px',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #ddd'
                        }} />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
                        Serving Size:
                        <input type="number" value={servingSize} onChange={(e) => setServingSize(Number(e.target.value))} min="1" style={{
                            marginLeft: '10px',
                            width: '60px',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #ddd'
                        }} />
                    </label>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <strong style={{ color: '#555' }}>Dietary:</strong>
                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'].map(diet => (
                        <label key={diet} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                value={diet}
                                checked={filters.dietary.includes(diet)}
                                onChange={handleDietaryChange}
                                style={{ marginRight: '6px', width: '16px', height: '16px' }}
                            />
                            {diet}
                        </label>
                    ))}
                </div>
            </div>

            <h2 ref={resultsRef}>All Recipes</h2>
            <div className="recipe-grid">
                {recipes.map(recipe => (
                    <RecipeCard
                        key={recipe._id}
                        recipe={recipe}
                        onRate={handleRate}
                        onFavorite={handleFavorite}
                        servingSize={servingSize}
                    />
                ))}
            </div>

            {suggestions.length > 0 && (
                <div className="suggestions-section">
                    <h2>You Might Also Like</h2>
                    <div className="recipe-grid">
                        {suggestions.map(recipe => (
                            <RecipeCard
                                key={'sugg-' + recipe._id}
                                recipe={recipe}
                                onRate={handleRate}
                                onFavorite={handleFavorite}
                                servingSize={servingSize}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
export default App;