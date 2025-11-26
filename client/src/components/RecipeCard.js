import React, { useState } from 'react';

function RecipeCard({ recipe, onRate, onFavorite, servingSize }) {
    const [rating, setRating] = useState(0);
    const [isFav, setIsFav] = useState(false);

    const handleRate = (r) => {
        setRating(r);
        if (onRate) onRate(recipe._id, r);
    };

    const toggleFav = () => {
        const newFav = !isFav;
        setIsFav(newFav);
        if (onFavorite) onFavorite(recipe._id, newFav);
    };

    const scaleIngredient = (ingredient) => {
        // Simple regex to find the leading number
        const match = ingredient.match(/^([\d./]+)(.*)$/);
        if (match && servingSize) {
            // Use Function constructor instead of eval for safer execution, though eval is acceptable for simple fraction parsing here
            try {
                // eslint-disable-next-line no-new-func
                const amount = parseFloat(new Function('return ' + match[1])());
                if (!isNaN(amount)) {
                    // Assume base serving size is 2 for scaling
                    const scaledAmount = (amount * servingSize) / 2;
                    // Format to 2 decimal places if needed, remove trailing zeros
                    const formattedAmount = parseFloat(scaledAmount.toFixed(2));
                    return `${formattedAmount}${match[2]}`;
                }
            } catch (e) {
                return ingredient;
            }
        }
        return ingredient;
    };

    return (
        <div className="card">
            <img src={recipe.image} alt={recipe.name} style={{ width: '100%' }} />
            <h3>{recipe.name}</h3>
            <p><strong>Time:</strong> {recipe.time} mins | <strong>Difficulty:</strong> {recipe.difficulty}</p>
            <p><strong>Nutrition:</strong> {recipe.nutrition.calories} kcal</p>

            <div className="actions" style={{ margin: '10px 0' }}>
                <button onClick={toggleFav} style={{ marginRight: '10px' }}>
                    {isFav ? '❤️ Unfavorite' : '🤍 Favorite'}
                </button>
                <span>
                    Rate:
                    {[1, 2, 3, 4, 5].map(r => (
                        <button
                            key={r}
                            onClick={() => handleRate(r)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.2em',
                                color: r <= rating ? 'gold' : 'gray'
                            }}
                        >
                            ★
                        </button>
                    ))}
                </span>
            </div>

            <details>
                <summary>View Instructions</summary>
                <p><strong>Ingredients (for {servingSize || 2} servings):</strong></p>
                <ul>
                    {recipe.ingredients.map((ing, i) => (
                        <li key={i}>{scaleIngredient(ing)}</li>
                    ))}
                </ul>
                <p><strong>Instructions:</strong></p>
                <p>{recipe.instructions.join(', ')}</p>
            </details>
        </div>
    );
}
export default RecipeCard;