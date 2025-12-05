/**
 * Common utility functions for games
 */

const GameUtils = {
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    random: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Load best score from local storage
     * @param {string} key
     * @returns {number}
     */
    loadBestScore: function (key) {
        return parseInt(localStorage.getItem(key)) || 0;
    },

    /**
     * Save best score to local storage if current score is higher
     * @param {string} key
     * @param {number} currentScore
     * @param {number} currentBest
     * @returns {number} The new best score
     */
    saveBestScore: function (key, currentScore, currentBest) {
        if (currentScore > currentBest) {
            localStorage.setItem(key, currentScore);
            return currentScore;
        }
        return currentBest;
    }
};

// Export for use in other files (if using modules, but here we use global for simplicity in this project structure)
window.GameUtils = GameUtils;
