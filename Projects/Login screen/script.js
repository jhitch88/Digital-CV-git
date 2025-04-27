// Create floating shapes
const background = document.getElementById('background');
        
for (let i = 0; i < 15; i++) {
    const shape = document.createElement('div');
    shape.classList.add('floating-shape');
    
    // Random position, size, and animation
    const size = Math.random() * 100 + 50;
    shape.style.width = `${size}px`;
    shape.style.height = `${size}px`;
    shape.style.left = `${Math.random() * 100}%`;
    shape.style.top = `${Math.random() * 100}%`;
    shape.style.animationDuration = `${Math.random() * 20 + 10}s`;
    shape.style.animationDelay = `${Math.random() * 5}s`;
    shape.style.animation = `float ${Math.random() * 10 + 10}s infinite ease-in-out`;
    
    background.appendChild(shape);
}

// Button loading animation
const loginButton = document.getElementById('login-button');
loginButton.addEventListener('click', function() {
    const buttonText = this.textContent;
    this.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>';
    
    // Simulate login process
    setTimeout(() => {
        this.innerHTML = 'Success!';
        setTimeout(() => {
            this.textContent = buttonText;
        }, 1500);
    }, 2000);
});

// Subtle movement of login card following cursor
const loginCard = document.querySelector('.login-card');
document.addEventListener('mousemove', (e) => {
    // const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    loginCard.style.transform = `rotateX(${yAxis}deg)`;
});

// Reset card position when mouse leaves
document.addEventListener('mouseleave', () => {
    loginCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
});