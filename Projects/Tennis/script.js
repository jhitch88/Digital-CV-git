// Pong Game JavaScript Code

var canvas;
var canvasContext;

var ballX = 50;
var ballY = 50;
var ballSpeedX = 12;
var ballSpeedY = 4;
var paddle1Y = 250;
var paddle2Y = 250;

var player1Score = 0;
var player2Score = 0;
const WINNING_SCORE = 3; // Score to win the game

var showingWinScreen = false; // Flag to indicate if the win screen should be shown

const PADDLE_THICKNESS = 10;
const PADDLE_HEIGHT = 90;

function calcMousePos(e){
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = e.clientX - rect.left - root.scrollLeft;
    var mouseY = e.clientY - rect.top - root.scrollTop;
    return{x: mouseX, y: mouseY};
}

function handleMouseClick(e) {
    if (showingWinScreen) {
        player1Score = 0;
        player2Score = 0;
        showingWinScreen = false; // Reset the flag to hide the win screen
    }
}

window.onload = function() {
    canvas = document.getElementById("gameCanvas");
    canvasContext = canvas.getContext('2d');

    var framesPerSecond = 30;
    setInterval(function(){
        drawAll();
        moveAll();
    }, 1000/framesPerSecond);

    canvas.addEventListener('mousedown', function(e) {
        if (showingWinScreen) {
            handleMouseClick();
        }
    }); // Added missing closing bracket

    canvas.addEventListener('mousemove', function(e) {
        var mousePos = calcMousePos(e);
        paddle1Y = mousePos.y - (PADDLE_HEIGHT / 2); // Center the paddle on the mouse position
        
        // Prevent player paddle from going off screen
        if (paddle1Y < 0) {
            paddle1Y = 5;
        }
        if (paddle1Y > canvas.height - PADDLE_HEIGHT) {
            paddle1Y = canvas.height - PADDLE_HEIGHT - 5;
        }
    });
}

function drawNet(){
    for (var i = 0; i < canvas.height; i += 40) {
        colorRect(canvas.width / 2 - 1, i, 2, 20, 'white'); // Draw the net
    }
    canvasContext.fillStyle = 'white';
}

function drawAll(){
    // Clear the canvas
    colorRect(0, 0, canvas.width, canvas.height, 'black');

    if (showingWinScreen) {
        if (player1Score >= WINNING_SCORE){
            canvasContext.fillStyle = 'white';
            canvasContext.font = '30px "Press Start 2P", "Courier New", monospace'; // Set retro font
            canvasContext.textAlign = 'center';
            canvasContext.fillText("YOU WON!", canvas.width / 2, canvas.height / 2); // Centered text
        } 

        if (player2Score >= WINNING_SCORE) {
            canvasContext.fillStyle = 'white';
            canvasContext.font = '30px "Press Start 2P", "Courier New", monospace'; // Set retro font
            canvasContext.textAlign = 'center';
            canvasContext.fillText("GAME OVER", canvas.width / 2, canvas.height / 2); // Centered text
        }
        
        // Add click to continue text
        canvasContext.font = '18px "Press Start 2P", "Courier New", monospace';
        canvasContext.fillText("Click to continue", canvas.width / 2, canvas.height / 2 + 50);
        return;
    }
    drawNet(); // Draw the net
    // Draw paddles
    colorRect(10, paddle1Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'white'); // Draw the player paddle
    //draw AI paddle
    colorRect(canvas.width-PADDLE_THICKNESS*2, paddle2Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'white'); // Draw the AI paddle
    // Draw the ball
    drawBall(ballX, ballY, 5, 'white'); // Ball position is updated in drawBall function

    // Draw the scores
    canvasContext.fillStyle = 'white';
    canvasContext.font = '30px "Press Start 2P", "Courier New", monospace'; // Set retro font
    canvasContext.textAlign = 'center';
    canvasContext.fillText(player1Score, canvas.width / 4, canvas.height / 10); // Player 1 score
    canvasContext.fillText(player2Score, canvas.width * 3 / 4, canvas.height / 10); // Player 2 score
}

function computerMovement() {
    //AI paddle movement
    var paddle2YCenter = paddle2Y + (PADDLE_HEIGHT / 2);
    if (paddle2YCenter < ballY - 35) {
        paddle2Y += 7; // Move down
    }
    else if (paddle2YCenter > ballY + 35) {
        paddle2Y -= 5; // Move up
    }
    
    // Prevent AI paddle from going off screen
    if (paddle2Y < 0) {
        paddle2Y = 5;
    }
    if (paddle2Y > canvas.height - PADDLE_HEIGHT) {
        paddle2Y = canvas.height - PADDLE_HEIGHT - 5;
    }
}

function moveAll(){
    if (showingWinScreen) {
        return; // Skip movement if showing win screen
    }
    // Move the ball
    updateBallPosition();
    computerMovement();
}

function ballReset(){
    if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
        // Reset scores
        showingWinScreen = true; // Show the win screen
    }
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = -ballSpeedY;
    // ballSpeedX = -ballSpeedX; // This line is intentionally disabled as the ball reset already reverses direction
}
function updateBallPosition() {
    const BALL_RADIUS = 5; // Define ball radius for clearer code
    
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Improved AI paddle collision detection
    if (ballX + BALL_RADIUS >= canvas.width - PADDLE_THICKNESS * 2) {
        if (ballY + BALL_RADIUS >= paddle2Y && ballY - BALL_RADIUS <= paddle2Y + PADDLE_HEIGHT) {
            ballSpeedX = -ballSpeedX;
            var deltaY = ballY - (paddle2Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35; // Adjust ball speed based on paddle hit position
        } else if (ballX > canvas.width) {
            player1Score++; // Player 1 scores a point
            ballReset();
        }
    } 
    
    // Improved player paddle collision detection
    if (ballX - BALL_RADIUS <= PADDLE_THICKNESS + 10) {
        if (ballY + BALL_RADIUS >= paddle1Y && ballY - BALL_RADIUS <= paddle1Y + PADDLE_HEIGHT) {
            ballSpeedX = -ballSpeedX;
            var deltaY = ballY - (paddle1Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35; // Adjust ball speed based on paddle hit position
        } else if (ballX < 0) {
            player2Score++; // Player 2 scores a point
            ballReset();
        }
    }

    // Handle wall collisions
    if (ballY + BALL_RADIUS >= canvas.height || ballY - BALL_RADIUS <= 0) {
        ballSpeedY = -ballSpeedY;
    }
}

function drawBall(centerX, centerY, radius, drawColor){
    canvasContext.fillStyle = drawColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
    canvasContext.fill();

}

function colorRect(leftX, topY, width, height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX, topY, width, height);
}