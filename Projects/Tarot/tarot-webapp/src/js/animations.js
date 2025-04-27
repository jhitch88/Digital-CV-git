const FLIP_ANIMATION_DURATION = 600; // Full flip animation duration
let isFlipped = false;
let isAnimating = false;  // Add this to prevent multiple animations
let buttonFireflies = null; // Move this outside to make it persistent

function initCardAnimations() {
    const drawButton = document.querySelector('.draw-button');
    const resetButton = document.querySelector('.reset');
    const card = document.querySelector('.card');
    const cardImage = document.getElementById('card-image');

    function handleCardFlip(button) {
        if (!isAnimating) {
            isAnimating = true;
            const selectedCard = selectRandomCard();
            console.log('Selected card:', selectedCard);
            
            if (isFlipped && button === resetButton) {
                // Complete reset approach - back to starting position then flip
                card.classList.remove('flipped');
                card.classList.remove('flipping');
                
                // Force browser to recognize the state change
                void card.offsetWidth;
                
                // Now start a clean flip animation
                card.classList.add('flipping');
                
                setTimeout(() => {
                    // Change the card image halfway through
                    cardImage.src = `./images/${selectedCard}.jpg`;
                    
                    // Complete the flip
                    setTimeout(() => {
                        card.classList.remove('flipping');
                        card.classList.add('flipped');
                        isAnimating = false;
                    }, FLIP_ANIMATION_DURATION / 2);
                }, FLIP_ANIMATION_DURATION / 2);
            } else {
                // First flip or draw button
                card.classList.add('flipping');
                
                setTimeout(() => {
                    cardImage.src = `./images/${selectedCard}.jpg`;
                    card.classList.remove('flipping');
                    card.classList.add('flipped');
                    isAnimating = false;
                    
                    if (button === drawButton) {
                        document.dispatchEvent(new CustomEvent('cardFlipped'));
                        isFlipped = true;
                    }
                }, FLIP_ANIMATION_DURATION / 2);
            }

            // Show particle effect
            const cardRect = card.getBoundingClientRect();
            showParticleEffect(
                cardRect.left + (cardRect.width / 2),
                cardRect.top + (cardRect.height / 2)
            );
        }
    }

    // Button hover effects - only create fireflies once
    [drawButton, resetButton].forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!buttonFireflies) {
                buttonFireflies = createFireflies(button);
                
                // Update fireflies position when button state changes
                document.addEventListener('cardFlipped', () => {
                    updateFirefliesPosition(resetButton);
                });
                
                // Keep fireflies fresh by periodically regenerating them
                setInterval(() => {
                    refreshFireflies(buttonFireflies);
                }, 5000);
            }
        });
    });

    // Add click handlers for both buttons
    drawButton.addEventListener('click', () => handleCardFlip(drawButton));
    resetButton.addEventListener('click', () => handleCardFlip(resetButton));
}

function updateFirefliesPosition(element) {
    if (buttonFireflies) {
        const elementRect = element.getBoundingClientRect();
        const containerWidth = elementRect.width * 3;
        const containerHeight = elementRect.height * 3;
        
        buttonFireflies.style.width = `${containerWidth}px`;
        buttonFireflies.style.height = `${containerHeight}px`;
        buttonFireflies.style.left = `${elementRect.width / 2 - containerWidth / 2}px`;
        buttonFireflies.style.top = `${elementRect.height / 2 - containerHeight / 2}px`;
    }
}

function createFireflies(element) {
    const container = document.createElement('div');
    container.className = 'fireflies-container';
    
    // Position container around the element
    const elementRect = element.getBoundingClientRect();
    const containerWidth = elementRect.width * 3;
    const containerHeight = elementRect.height * 3;
    
    container.style.width = `${containerWidth}px`;
    container.style.height = `${containerHeight}px`;
    container.style.left = `${elementRect.width / 2 - containerWidth / 2}px`;
    container.style.top = `${elementRect.height / 2 - containerHeight / 2}px`;
    
    element.parentElement.appendChild(container);
    
    // Create fireflies
    for (let i = 0; i < 20; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';
        firefly.style.left = `${Math.random() * 100}%`;
        firefly.style.top = `${Math.random() * 100}%`;
        firefly.style.setProperty('--random-x', Math.random());
        firefly.style.setProperty('--random-y', Math.random());
        firefly.style.animationDuration = `${5 + Math.random() * 7}s`;
        container.appendChild(firefly);
    }
    
    return container;
}

// Add a function to refresh fireflies periodically
function refreshFireflies(container) {
    // Remove old fireflies
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Create new fireflies
    for (let i = 0; i < 20; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';
        firefly.style.left = `${Math.random() * 100}%`;
        firefly.style.top = `${Math.random() * 100}%`;
        firefly.style.setProperty('--random-x', Math.random());
        firefly.style.setProperty('--random-y', Math.random());
        firefly.style.animationDuration = `${5 + Math.random() * 7}s`;
        container.appendChild(firefly);
    }
}

function showParticleEffect(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCardAnimations);