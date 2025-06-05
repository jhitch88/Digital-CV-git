class BootlickerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');        this.isGameActive = false;
        this.currentColor = 'green';
        this.brushSize = 20;
        this.isLicking = false;
        
        // Images
        this.images = {
            boot: new Image(),
            green: new Image(),
            red: new Image(),
            tongue: new Image()
        };        // Progress tracking
        this.totalPixels = 0;
        this.initialColorPixels = 0;
        this.completionThreshold = 0.995; // 99.5% completion to win - almost perfectly clean!
        
        // Timer and leaderboard
        this.startTime = null;
        this.endTime = null;
        this.leaderboard = this.loadLeaderboard();
          // Load images and initialize
        this.loadImages().then(() => {
            this.setupEventListeners();
            this.resetGame();
            this.displayLeaderboard(); // Show existing leaderboard
        });
    }
    
    async loadImages() {
        const imagePromises = [
            this.loadImage('images/boot.png', 'boot'),
            this.loadImage('images/boot_green.png', 'green'),
            this.loadImage('images/boot_red.png', 'red'),
            this.loadImage('images/tongue.png', 'tongue')
        ];
        
        await Promise.all(imagePromises);
        console.log('All images loaded successfully!');
    }
    
    loadImage(src, key) {
        return new Promise((resolve, reject) => {
            this.images[key].onload = resolve;
            this.images[key].onerror = reject;
            this.images[key].src = src;
        });
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startLicking(e));
        this.canvas.addEventListener('mousemove', (e) => this.lick(e));
        this.canvas.addEventListener('mouseup', () => this.stopLicking());
        this.canvas.addEventListener('mouseleave', () => this.stopLicking());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startLicking(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.lick(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopLicking();
        });
          // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('clearLeaderboardBtn').addEventListener('click', () => this.clearLeaderboard());
        
        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentColor = e.target.dataset.color;
                this.resetGame();
            });
        });
    }    startGame() {
        this.isGameActive = true;
        this.startTime = Date.now(); // Start the timer
        document.getElementById('startBtn').textContent = 'Game Active!';
        document.getElementById('startBtn').disabled = true;
        
        // Reset the overlay canvas to restore all color
        this.overlayCanvas = null;
        this.overlayCtx = null;
        this.updateProgress(0);
        
        this.drawGame();
        this.calculateInitialColorPixels();
        this.updateTimer(); // Start timer display
    }    resetGame() {
        this.isGameActive = false;
        this.isLicking = false;
        this.startTime = null;
        this.endTime = null;
        document.getElementById('startBtn').textContent = 'Start Game';
        document.getElementById('startBtn').disabled = false;
        this.updateProgress(0);
        this.updateTimerDisplay(0);
        
        // Reset overlay canvas
        this.overlayCanvas = null;
        this.overlayCtx = null;
        
        this.drawGame();
    }
    
    drawGame() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate dimensions to fit images in canvas while maintaining aspect ratio
        const canvasAspect = this.canvas.width / this.canvas.height;
        const imageAspect = this.images.boot.width / this.images.boot.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (canvasAspect > imageAspect) {
            // Canvas is wider than image
            drawHeight = this.canvas.height * 0.8;
            drawWidth = drawHeight * imageAspect;
        } else {
            // Canvas is taller than image
            drawWidth = this.canvas.width * 0.8;
            drawHeight = drawWidth / imageAspect;
        }
        
        offsetX = (this.canvas.width - drawWidth) / 2;
        offsetY = (this.canvas.height - drawHeight) / 2;
        
        // Store drawing parameters for hit detection
        this.drawParams = { drawWidth, drawHeight, offsetX, offsetY };
        
        // Draw base boot
        this.ctx.drawImage(this.images.boot, offsetX, offsetY, drawWidth, drawHeight);
        
        // Draw colored overlay if game hasn't started
        if (!this.isGameActive) {
            this.ctx.drawImage(this.images[this.currentColor], offsetX, offsetY, drawWidth, drawHeight);
        } else {
            // Create a temporary canvas for the overlay manipulation
            if (!this.overlayCanvas) {
                this.overlayCanvas = document.createElement('canvas');
                this.overlayCanvas.width = this.canvas.width;
                this.overlayCanvas.height = this.canvas.height;
                this.overlayCtx = this.overlayCanvas.getContext('2d');
                
                // Draw the initial colored overlay
                this.overlayCtx.drawImage(this.images[this.currentColor], offsetX, offsetY, drawWidth, drawHeight);
            }
            
            // Draw the current state of the overlay
            this.ctx.drawImage(this.overlayCanvas, 0, 0);
        }
    }
      calculateInitialColorPixels() {
        if (!this.overlayCanvas || !this.drawParams) return;
        
        // Get image data from the overlay canvas
        const imageData = this.overlayCtx.getImageData(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        const data = imageData.data;
        
        let colorPixels = 0;
        
        // Count pixels that have alpha > 0 (visible color pixels)
        for (let i = 3; i < data.length; i += 4) { // Check alpha channel (every 4th value)
            if (data[i] > 0) { // Alpha > 0 means visible pixel
                colorPixels++;
            }
        }
        
        this.initialColorPixels = colorPixels;
        console.log('Initial color pixels:', this.initialColorPixels);
    }
    
    calculateRemainingColorPixels() {
        if (!this.overlayCanvas) return this.initialColorPixels;
        
        // Get current image data from the overlay canvas
        const imageData = this.overlayCtx.getImageData(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        const data = imageData.data;
        
        let remainingPixels = 0;
        
        // Count pixels that still have alpha > 0 (remaining color pixels)
        for (let i = 3; i < data.length; i += 4) { // Check alpha channel
            if (data[i] > 0) { // Alpha > 0 means visible pixel
                remainingPixels++;
            }
        }
        
        return remainingPixels;
    }
    
    startLicking(e) {
        if (!this.isGameActive) return;
        this.isLicking = true;
        this.lick(e);
    }
    
    stopLicking() {
        this.isLicking = false;
    }
    
    lick(e) {
        if (!this.isGameActive || !this.isLicking) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        // Check if click/touch is within the boot area
        if (this.isWithinBootArea(x, y)) {
            this.removeColorAt(x, y);
        }
    }
    
    isWithinBootArea(x, y) {
        const { drawWidth, drawHeight, offsetX, offsetY } = this.drawParams;
        return x >= offsetX && x <= offsetX + drawWidth && 
               y >= offsetY && y <= offsetY + drawHeight;
    }
      removeColorAt(x, y) {
        if (!this.overlayCtx) return;
        
        // Create circular brush to "lick" away the color
        this.overlayCtx.globalCompositeOperation = 'destination-out';
        this.overlayCtx.beginPath();
        this.overlayCtx.arc(x, y, this.brushSize, 0, 2 * Math.PI);
        this.overlayCtx.fill();
        this.overlayCtx.globalCompositeOperation = 'source-over';
        
        // Update the main canvas
        this.drawGame();
        
        // Update progress based on actual remaining pixels
        this.updateProgress();
        
        // Check for completion
        this.checkGameCompletion();
    }
      updateProgress(customPercent = null) {
        let percent;
        if (customPercent !== null) {
            percent = customPercent;
        } else if (this.initialColorPixels > 0) {
            const remainingPixels = this.calculateRemainingColorPixels();
            const removedPixels = this.initialColorPixels - remainingPixels;
            percent = Math.min(100, (removedPixels / this.initialColorPixels) * 100);
        } else {
            percent = 0;
        }
        
        document.querySelector('.progress-fill').style.width = percent + '%';
        document.getElementById('progress-percent').textContent = Math.floor(percent) + '%';
    }
    
    checkGameCompletion() {
        if (this.initialColorPixels === 0) return;
        
        const remainingPixels = this.calculateRemainingColorPixels();
        const completionPercent = (this.initialColorPixels - remainingPixels) / this.initialColorPixels;
        
        console.log('Completion check:', {
            initial: this.initialColorPixels,
            remaining: remainingPixels,
            percent: (completionPercent * 100).toFixed(1) + '%'
        });
        
        if (completionPercent >= this.completionThreshold) {
            this.gameComplete();
        }
    }
      gameComplete() {
        this.isGameActive = false;
        this.endTime = Date.now();
        const completionTime = this.endTime - this.startTime;
        
        this.updateProgress(100);
        this.updateTimerDisplay(completionTime);
        
        // Add to leaderboard
        this.addToLeaderboard(completionTime, this.currentColor);
        
        // Celebration animation
        document.querySelector('.game-container').classList.add('celebrate');
        
        // Show completion message with time
        const timeString = this.formatTime(completionTime);
        setTimeout(() => {
            alert(`🎉 Congratulations! You licked the boot clean in ${timeString}! 🎉`);
            document.querySelector('.game-container').classList.remove('celebrate');
            this.displayLeaderboard();
        }, 1000);
          // Reset button state
        document.getElementById('startBtn').textContent = 'Start New Game';
        document.getElementById('startBtn').disabled = false;
    }
    
    // Timer functions
    updateTimer() {
        if (!this.isGameActive || !this.startTime) return;
        
        const currentTime = Date.now() - this.startTime;
        this.updateTimerDisplay(currentTime);
        
        // Update every 100ms for smooth display
        setTimeout(() => this.updateTimer(), 100);
    }
    
    updateTimerDisplay(time) {
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = this.formatTime(time);
        }
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const ms = Math.floor((milliseconds % 1000) / 10); // Two decimal places
        return `${seconds}.${ms.toString().padStart(2, '0')}s`;
    }
    
    // Leaderboard functions
    loadLeaderboard() {
        const saved = localStorage.getItem('bootlicker-leaderboard');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveLeaderboard() {
        localStorage.setItem('bootlicker-leaderboard', JSON.stringify(this.leaderboard));
    }
    
    addToLeaderboard(time, color) {
        const entry = {
            time: time,
            color: color,
            date: new Date().toLocaleDateString(),
            formattedTime: this.formatTime(time)
        };
        
        this.leaderboard.push(entry);
        this.leaderboard.sort((a, b) => a.time - b.time); // Sort by fastest time
        this.leaderboard = this.leaderboard.slice(0, 10); // Keep top 10
        this.saveLeaderboard();
    }
    
    displayLeaderboard() {
        const leaderboardElement = document.querySelector('.leaderboard-list');
        if (!leaderboardElement) return;
        
        leaderboardElement.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            leaderboardElement.innerHTML = '<li class="no-scores">No scores yet - play to set your first record!</li>';
            return;
        }
        
        this.leaderboard.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'leaderboard-entry';
            if (index === 0) li.classList.add('best-score');
            
            li.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="time">${entry.formattedTime}</span>
                <span class="color ${entry.color}">${entry.color}</span>
                <span class="date">${entry.date}</span>
            `;
            leaderboardElement.appendChild(li);
        });
    }
    
    clearLeaderboard() {
        this.leaderboard = [];
        this.saveLeaderboard();
        this.displayLeaderboard();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BootlickerGame();
});