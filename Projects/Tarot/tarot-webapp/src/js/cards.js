const tarotCards = [];

function loadTarotCards() {
    // Total number of cards (00-77)
    for (let i = 0; i <= 77; i++) {
        const paddedIndex = String(i).padStart(2, '0');
        tarotCards.push(paddedIndex);
    }
}

function selectRandomCard() {
    const randomIndex = Math.floor(Math.random() * tarotCards.length);
    return tarotCards[randomIndex];
}

function resetCard() {
    const drawButton = document.querySelector('.draw-button');
    const resetButton = document.querySelector('.reset');
    
    // Hide reset button, show draw button
    resetButton.style.display = 'none';
    drawButton.style.display = 'inline-block';
    
    // Reset card state without changing image
    isFlipped = false;
    isAnimating = false;
}

// Initialize cards when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTarotCards();
    // console.log('Loaded cards:', tarotCards); // Debug log
    const drawButton = document.querySelector('.draw-button');
    const resetButton = document.querySelector('.reset');
    
    // Initially hide reset button
    resetButton.style.display = 'none';
    
    // Show reset button and hide draw button after card flip
    document.addEventListener('cardFlipped', () => {
        drawButton.style.display = 'none';
        resetButton.style.display = 'inline-block';
    });
    
    // Remove the reset button click handler from here since it's handled in animations.js
    // This avoids conflicting event handlers
});