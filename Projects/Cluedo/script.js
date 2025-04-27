// Cluedo Game JavaScript Code
const suspects = ['Mr. Green', 'Mrs. White', 'Colonel Mustard', 'Miss Scarlet', 'Professor Plum', 'Mrs. Peacock'];
const weapons = ['Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench'];
const locations = ['Kitchen', 'Ballroom', 'Conservatory', 'Dining Room', 'Lounge', 'Hall'];
let answer = []; // The answer will be randomly generated
let playerGuess = []; // The player's guess
let maxAttempts = 6; // Maximum attempts allowed
let attempts = 0; // Current attempt count
let feedback = []; // Feedback on guesses
let gameOver = false;

// Elements from the DOM
const suspectSelect = document.getElementById('suspect-select');
const weaponSelect = document.getElementById('weapon-select');
const locationSelect = document.getElementById('location-select');
const submitButton = document.getElementById('submit-guess');
const resetButton = document.getElementById('reset-button');
const feedbackArea = document.getElementById('feedback-area');
const guessHistory = document.getElementById('guess-history');
const answerContainer = document.getElementById('answer-container');
const attemptsText = document.getElementById('attempts-text');

// Additional elements from DOM
const suspectPosition = document.getElementById('suspect-position');
const weaponPosition = document.getElementById('weapon-position');
const locationPosition = document.getElementById('location-position');

// Initialize the game
function initGame() {
    // Reset game state
    answer = [];
    playerGuess = [];
    attempts = 0;
    feedback = [];
    gameOver = false;
    
    // Clear UI
    feedbackArea.innerHTML = "Make your first guess, detective's assistant!"; // Changed from textContent
    guessHistory.innerHTML = '';
    answerContainer.innerHTML = '';
    answerContainer.style.display = 'none';
    attemptsText.textContent = `Attempts: ${attempts}/${maxAttempts}`;
    
    // Generate random answer (one from each category)
    const randomSuspect = suspects[Math.floor(Math.random() * suspects.length)];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // Store the answer (in a random order)
    answer = [
        { type: 'suspect', value: randomSuspect },
        { type: 'weapon', value: randomWeapon },
        { type: 'location', value: randomLocation }
    ];
    
    // Shuffle the answer to make it more challenging
    answer.sort(() => Math.random() - 0.5);
    
    // Set up the select elements
    populateSelect(suspectSelect, suspects);
    populateSelect(weaponSelect, weapons);
    populateSelect(locationSelect, locations);
    
    // Set up the initial positions
    suspectPosition.value = "0";
    weaponPosition.value = "1";
    locationPosition.value = "2";
    ensureUniquePositions();
    
    // Add position selection event listeners to prevent duplicate positions
    suspectPosition.addEventListener('change', validatePositions);
    weaponPosition.addEventListener('change', validatePositions);
    locationPosition.addEventListener('change', validatePositions);
    
    // console.log('Answer (for debugging):', answer);
}

// Populate select elements with options
function populateSelect(selectElement, options) {
    // Clear existing options except the first placeholder
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Add new options
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

// Validate positions to prevent duplicates - completely rewritten function
function validatePositions() {
    // Get the changed selector
    const changedSelector = this;
    const newValue = parseInt(changedSelector.value);
    
    // Get all current values
    const positions = [
        { selector: suspectPosition, value: parseInt(suspectPosition.value) },
        { selector: weaponPosition, value: parseInt(weaponPosition.value) },
        { selector: locationPosition, value: parseInt(locationPosition.value) }
    ];
    
    // Find duplicates of the new value (excluding the current selector)
    const duplicates = positions.filter(p => 
        p.selector !== changedSelector && p.value === newValue
    );
    
    if (duplicates.length > 0) {
        // Find the old value of the changed selector (before it was changed)
        let oldPositions = [];
        for (let i = 0; i < 3; i++) {
            if (!positions.some(p => p.value === i && p.selector !== changedSelector)) {
                oldPositions.push(i);
            }
        }
        
        // We swap with the first duplicate found
        const duplicate = duplicates[0];
        const oldValue = oldPositions[0]; // The position that was previously used by changedSelector
        
        // Perform the swap - set the other selector to the old value
        duplicate.selector.value = oldValue.toString();
    }
    
    // Double-check that all positions are unique after our changes
    ensureUniquePositions();
}

// Additional function to ensure all positions are unique
function ensureUniquePositions() {
    const values = [
        parseInt(suspectPosition.value),
        parseInt(weaponPosition.value), 
        parseInt(locationPosition.value)
    ];
    
    // If we don't have 3 unique values, reset to defaults
    if (new Set(values).size !== 3) {
        suspectPosition.value = "0";
        weaponPosition.value = "1";
        locationPosition.value = "2";
    }
}

// Submit a guess
function submitGuess() {
    if (gameOver) return;
    
    const suspect = suspectSelect.value;
    const weapon = weaponSelect.value;
    const location = locationSelect.value;
    
    // Verify all selections are made
    if (!suspect || !weapon || !location) {
        feedbackArea.textContent = "Detective Jacques Cluedo says: 'Meow! You need to select all three clues!'";
        return;
    }
    
    attempts++;
    attemptsText.textContent = `Attempts: ${attempts}/${maxAttempts}`;
    
    // Create the player's guess with positions
    const positions = [
        parseInt(suspectPosition.value),
        parseInt(weaponPosition.value),
        parseInt(locationPosition.value)
    ];
    
    // Create ordered guess array
    playerGuess = new Array(3);
    playerGuess[positions[0]] = { type: 'suspect', value: suspect };
    playerGuess[positions[1]] = { type: 'weapon', value: weapon };
    playerGuess[positions[2]] = { type: 'location', value: location };
    
    // Check the guess against the answer
    const result = checkGuess(playerGuess);
    
    // Add to history
    addGuessToHistory(playerGuess, result, positions);
    
    // Update feedback area
    updateFeedback(result);
    
    // Check if the player has won or lost
    checkGameState(result);
}

// Check the guess against the answer - ensure feedback for all 3 positions
function checkGuess(guess) {
    // Create results array with placeholders for each position
    const results = [null, null, null]; // Initialize with nulls to ensure we fill all positions
    const matchedAnswerIndices = []; // Track which answers have been matched
    
    // First check for exact matches (right clue in right position)
    for (let i = 0; i < guess.length; i++) {
        if (guess[i].type === answer[i].type && guess[i].value === answer[i].value) {
            results[i] = {
                clue: guess[i].type,
                value: guess[i].value,
                status: 'correct'
            };
            matchedAnswerIndices.push(i); // Mark this answer as matched
        }
    }
    
    // Then check for partial matches (right clue wrong position)
    for (let guessIndex = 0; guessIndex < guess.length; guessIndex++) {
        // Skip if this position already has a result (exact match)
        if (results[guessIndex] !== null) continue;
        
        let found = false;
        for (let answerIndex = 0; answerIndex < answer.length; answerIndex++) {
            // Skip if this answer was already matched or if already found a match
            if (matchedAnswerIndices.includes(answerIndex) || found) continue;
            
            // Check for partial match - same type and value but different position
            if (guess[guessIndex].type === answer[answerIndex].type && 
                guess[guessIndex].value === answer[answerIndex].value) {
                results[guessIndex] = {
                    clue: guess[guessIndex].type,
                    value: guess[guessIndex].value,
                    status: 'partial'
                };
                matchedAnswerIndices.push(answerIndex); // Mark this answer as matched
                found = true;
            }
        }
        
        // If no match found, this guess is wrong (and we haven't set a result yet)
        if (!found) {
            results[guessIndex] = {
                clue: guess[guessIndex].type,
                value: guess[guessIndex].value,
                status: 'wrong'
            };
        }
    }
    
    // Double-check that we have feedback for all positions
    for (let i = 0; i < results.length; i++) {
        if (results[i] === null) {
            // This should never happen with the logic above, but just in case
            results[i] = {
                clue: guess[i].type,
                value: guess[i].value,
                status: 'wrong'
            };
        }
    }
    
    return results;
}

// Add a guess to the history display with position information
function addGuessToHistory(guess, results, positions) {
    const historyItem = document.createElement('div');
    historyItem.className = 'guess-item';
    
    // Create ordered display of guesses using file terminology
    const guessDetails = document.createElement('div');
    guessDetails.innerHTML = `Attempt ${attempts}: 
        <strong>File #1:</strong> ${guess[0].value} (${guess[0].type}), 
        <strong>File #2:</strong> ${guess[1].value} (${guess[1].type}), 
        <strong>File #3:</strong> ${guess[2].value} (${guess[2].type})`;
    
    const resultIndicators = document.createElement('div');
    results.forEach(result => {
        const indicator = document.createElement('span');
        indicator.className = result.status;
        indicator.textContent = '● ';
        resultIndicators.appendChild(indicator);
    });
    
    historyItem.appendChild(guessDetails);
    historyItem.appendChild(resultIndicators);
    guessHistory.insertBefore(historyItem, guessHistory.firstChild);
}

// Update the feedback area with current results
function updateFeedback(results) {
    let feedbackText = "Detective Jacques Cluedo says: 'Let's check these case files...'\n\n";
    
    results.forEach((result, index) => {
        const positionText = `File #${index + 1}: `;
        switch(result.status) {
            case 'correct':
                feedbackText += `<span class="correct">✓ ${positionText}The ${result.clue} is definitely in the right file!</span>\n`;
                break;
            case 'partial':
                feedbackText += `<span class="partial">~ ${positionText}The ${result.clue} is involved in the case but should be in a different file.</span>\n`;
                break;
            case 'wrong':
                feedbackText += `<span class="wrong">✗ ${positionText}The ${result.clue} is not involved in this case at all.</span>\n`;
                break;
        }
    });
    
    feedbackArea.innerHTML = feedbackText;
}

// Check if the player has won or lost
function checkGameState(results) {
    // Check for win - all results are correct
    const allCorrect = results.every(result => result.status === 'correct');
    
    if (allCorrect) {
        gameOver = true;
        feedbackArea.innerHTML = "<span>Detective Jacques Cluedo purrs loudly! 'You've solved the case! You're the best assistant ever!'</span>\n\n<span>The culprit has been caught!</span>";
        revealAnswer("You solved the case!");
    } 
    // Check for loss - max attempts reached
    else if (attempts >= maxAttempts) {
        gameOver = true;
        feedbackArea.innerHTML = "<span>Detective Jacques Cluedo looks disappointed. 'Oh no, we're out of time! The culprit got away...'</span>\n\n<span>Better luck next time!</span>";
        revealAnswer("The case remains unsolved...");
    }
}

// Reveal the answer at the end of the game
function revealAnswer(message) {
    answerContainer.style.display = 'block';
    
    const headerElement = document.createElement('h3');
    headerElement.textContent = message;
    
    const answerElement = document.createElement('div');
    answerElement.className = 'answer-revealed';
    
    const sortedAnswer = [...answer].sort((a, b) => {
        const typeOrder = { suspect: 1, weapon: 2, location: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
    });
    
    answerElement.innerHTML = `
        The solution was: 
        <br>
        <strong>${getSuspect(sortedAnswer)}</strong> committed the crime using the <strong>${getWeapon(sortedAnswer)}</strong> in the <strong>${getLocation(sortedAnswer)}</strong>!
    `;
    
    answerContainer.appendChild(headerElement);
    answerContainer.appendChild(answerElement);
}

// Helper functions to extract values from the answer array
function getSuspect(answerArray) {
    return answerArray.find(item => item.type === 'suspect')?.value || 'Unknown';
}

function getWeapon(answerArray) {
    return answerArray.find(item => item.type === 'weapon')?.value || 'Unknown';
}

function getLocation(answerArray) {
    return answerArray.find(item => item.type === 'location')?.value || 'Unknown';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    submitButton.addEventListener('click', submitGuess);
    resetButton.addEventListener('click', initGame);
    
    // Position selection validation
    suspectPosition.addEventListener('change', validatePositions);
    weaponPosition.addEventListener('change', validatePositions);
    locationPosition.addEventListener('change', validatePositions);
    
    // Initialize the game on load
    initGame();
});