import React, { useState } from 'react';

function InputSection({ onSearch }) {
    const [input, setInput] = useState('');

    const handleSearch = () => {
        // Split by comma and clean whitespace
        const ingredients = input.split(',').map(item => item.trim());
        onSearch(ingredients);
    };

    return (
        <div className="input-section">
            <h2>What's in your fridge?</h2>
            <textarea 
                placeholder="Enter ingredients (e.g., eggs, cheese, milk)" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleSearch}>Find Recipes</button>
        </div>
    );
}
export default InputSection;