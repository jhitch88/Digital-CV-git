//Create a tic-tac-toe game using JS, HTML, and CSS. Simple lines and symboles like X and O. Divs for the board. Symbols for the icons.

// The game should be played in a 3x3 grid
// The game should have a reset button
// The game should have a score counter for both players
// The game should have a win condition for both players
// The game should have a draw condition
// The game should be played in the browser
// The game should be responsive

// Game elements
const board = document.querySelector(".board");
const cells = document.querySelectorAll(".cell");
const resetButton = document.querySelector(".reset-button");
const resetScoresButton = document.querySelector(".reset-scores-button");
const player1Score = document.querySelector(".player1-score");
const player2Score = document.querySelector(".player2-score");
const turnIndicator = document.getElementById("turn-indicator");
const gameOverlay = document.getElementById("game-overlay");
const resultMessage = document.getElementById("result-message");

// Game variables
const player1Symbol = "X";
const player2Symbol = "O";
let currentPlayer = player1Symbol;
let player1Wins = 0;
let player2Wins = 0;
let gameActive = true;

let gameBoard = ["", "", "", "", "", "", "", "", ""]; // Game board state

// Function to handle cell click
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));

    // Don't allow clicks on filled cells or when game is over
    if (gameBoard[clickedCellIndex] !== "" || !gameActive) {
        return;
    }
    
    // In vs computer mode, only allow clicks when it's player's turn
    if (playingVsComputer && currentPlayer !== player1Symbol) {
        return;
    }

    // Make the player's move
    gameBoard[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer === player1Symbol ? "x" : "o");

    // Check for game end
    checkWin();
    
    // If we're playing against computer and game is still active, make computer move
    if (playingVsComputer && gameActive && currentPlayer === player2Symbol) {
        setTimeout(computerMove, 600); // Add delay for better UX
    }
}

// Draw the board
function drawBoard() {
    cells.forEach((cell, index) => {
        cell.textContent = gameBoard[index];
        
        // Add class for styling
        if (gameBoard[index] === player1Symbol) {
            cell.classList.add("x");
            cell.classList.remove("o");
        } else if (gameBoard[index] === player2Symbol) {
            cell.classList.add("o");
            cell.classList.remove("x");
        } else {
            cell.classList.remove("x", "o");
        }
    });
    
    // Update turn indicator
    turnIndicator.textContent = gameActive ? 
        `Player ${currentPlayer}'s Turn` : 
        `Game Over`;
}

// Add the computer move function
function computerMove() {
    if (!gameActive) return;
    
    // Find the best move
    const bestMove = findBestMove();
    
    // Make the move
    gameBoard[bestMove] = player2Symbol;
    cells[bestMove].textContent = player2Symbol;
    cells[bestMove].classList.add("o");
    
    // Check if game is over
    checkWin();
}

// Add the AI logic for finding the best move
function findBestMove() {
    // First check if computer can win
    const winningMove = findWinningMove(player2Symbol);
    if (winningMove !== -1) return winningMove;
    
    // Then check if player can win and block them
    const blockingMove = findWinningMove(player1Symbol);
    if (blockingMove !== -1) return blockingMove;
    
    // Try to take center if available
    if (gameBoard[4] === "") return 4;
    
    // Take corners if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => gameBoard[i] === "");
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available space
    const availableMoves = gameBoard.map((cell, index) => cell === "" ? index : -1).filter(i => i !== -1);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Helper function to find winning moves
function findWinningMove(symbol) {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (const [a, b, c] of winConditions) {
        // Check if there are two of our symbols and an empty space
        if (gameBoard[a] === symbol && gameBoard[b] === symbol && gameBoard[c] === "") return c;
        if (gameBoard[a] === symbol && gameBoard[c] === symbol && gameBoard[b] === "") return b;
        if (gameBoard[b] === symbol && gameBoard[c] === symbol && gameBoard[a] === "") return a;
    }
    
    return -1; // No winning move found
}

// Check for win condition
function checkWin() {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    let roundWon = false;
    let roundDraw = !gameBoard.includes("");
    let winningCells = [];
    
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (gameBoard[a] === "" || gameBoard[b] === "" || gameBoard[c] === "") {
            continue;
        }
        if (gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            winningCells = [a, b, c];
            
            // Highlight winning cells
            cells[a].style.backgroundColor = "#98FB98"; // Light green
            cells[b].style.backgroundColor = "#98FB98";
            cells[c].style.backgroundColor = "#98FB98";
            break;
        }
    }
    
    if (roundWon) {
        gameActive = false;
        updateScore();
        
        // Show victory message with overlay
        let winMessage = `${currentPlayer} Wins!`;
        let messageClass = currentPlayer === player1Symbol ? "win-message-x" : "win-message-o";
        
        if (playingVsComputer && currentPlayer === player2Symbol) {
            winMessage = "Computer Wins!";
        }
        
        // Show the overlay with animated effect
        resultMessage.textContent = winMessage;
        resultMessage.className = messageClass;
        gameOverlay.classList.add("active");
        
        // Reset game after a delay
        setTimeout(() => {
            gameOverlay.classList.remove("active");
            setTimeout(() => {
                resetGame(false); // Reset game but keep scores
            }, 300); // Additional delay after overlay fades
        }, 2000); // Show overlay for 2 seconds
        
    } else if (roundDraw) {
        gameActive = false;
        
        // Show draw message with overlay
        resultMessage.textContent = "It's a Draw!";
        resultMessage.className = "draw-message";
        gameOverlay.classList.add("active");
        
        // Reset game after a delay
        setTimeout(() => {
            gameOverlay.classList.remove("active");
            setTimeout(() => {
                resetGame(false); // Reset game but keep scores
            }, 300); // Additional delay after overlay fades
        }, 2000); // Show overlay for 2 seconds
        
    } else {
        currentPlayer = currentPlayer === player1Symbol ? player2Symbol : player1Symbol;
        
        // Update the turn indicator
        if (!playingVsComputer) {
            turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
        } else {
            turnIndicator.textContent = currentPlayer === player1Symbol ? 
                "Your Turn" : "Computer's Turn";
        }
    }
}

// Update score
function updateScore() {
    if (currentPlayer === player1Symbol) {
        player1Wins++;
        player1Score.textContent = `Player 1: ${player1Wins}`;
    } else {
        player2Wins++;
        player2Score.textContent = `Player 2: ${player2Wins}`;
    }
}

// Reset game
function resetGame(resetScores = false) {
    gameBoard = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = player1Symbol;
    
    cells.forEach((cell) => {
        cell.textContent = "";
        cell.style.backgroundColor = ""; // Reset background color
        cell.classList.remove("x", "o");
    });
    
    if (resetScores) {
        player1Wins = 0;
        player2Wins = 0;
        player1Score.textContent = "Player 1: 0";
        player2Score.textContent = "Player 2: 0";
    }
    
    // Update UI based on game mode
    if (playingVsComputer) {
        player2Score.textContent = "Computer: " + player2Wins;
        turnIndicator.textContent = "Your Turn";
    } else {
        player2Score.textContent = "Player 2: " + player2Wins;
        turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

// Event listeners
cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
});

resetButton.addEventListener("click", () => resetGame(false));
resetScoresButton.addEventListener("click", () => resetGame(true));

// Add this to your global variables
let playingVsComputer = false;

// Add these event listeners for the mode buttons
document.querySelector(".vs-player-button").addEventListener("click", () => {
    playingVsComputer = false;
    resetGame(true);
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
});

document.querySelector(".vs-computer-button").addEventListener("click", () => {
    playingVsComputer = true;
    resetGame(true);
    turnIndicator.textContent = "Player X vs Computer";
});

// Initialize game
drawBoard();