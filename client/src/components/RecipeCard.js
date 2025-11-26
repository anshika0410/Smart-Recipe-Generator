import React from 'react';

function RecipeCard({ recipe }) {
    return (
        <div className="card">
            <img src={recipe.image} alt={recipe.name} style={{width: '100%'}} />
            <h3>{recipe.name}</h3>
            <p><strong>Time:</strong> {recipe.time} mins | <strong>Difficulty:</strong> {recipe.difficulty}</p>
            <p><strong>Nutrition:</strong> {recipe.nutrition.calories} kcal</p>
            <details>
                <summary>View Instructions</summary>
                <p>{recipe.instructions.join(', ')}</p>
            </details>
        </div>
    );
}
export default RecipeCard;