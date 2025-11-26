// Simple persistence for user ratings and favorites
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'userData.json');

let userData = { ratings: {}, favorites: {} };

function loadData() {
    try {
        const raw = fs.readFileSync(dataFile, 'utf-8');
        userData = JSON.parse(raw);
    } catch (e) {
        // If file does not exist, start with empty data
        userData = { ratings: {}, favorites: {} };
    }
}

function saveData() {
    fs.writeFileSync(dataFile, JSON.stringify(userData, null, 2), 'utf-8');
}

loadData();

module.exports = {
    getRatings: () => userData.ratings,
    getFavorites: () => userData.favorites,
    setRating: (id, rating) => {
        userData.ratings[id] = rating;
        saveData();
    },
    setFavorite: (id, isFav) => {
        if (isFav) {
            userData.favorites[id] = true;
        } else {
            delete userData.favorites[id];
        }
        saveData();
    }
};
