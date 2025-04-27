document.addEventListener('DOMContentLoaded', function() {
    const magicBall = document.querySelector('.magic-ball');
    
    // Three.js variables
    let scene, camera, renderer, pyramid, light, textTexture;
    let isRevealed = false;
    
    // Setup Three.js scene
    function initThreeJS() {
        const container = document.getElementById('pyramid-scene');
        
        // Scene setup
        scene = new THREE.Scene();
        
        // Camera setup - perspective camera for 3D effect
        camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        
        // Renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x1a3a7e, 1); // Same blue as background
        container.appendChild(renderer.domElement);
        
        // Lighting
        light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 0, 5);
        scene.add(light);
        
        // Add ambient light for better visibility
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
        scene.add(ambientLight);
        
        // Create pyramid with default texture
        createPyramid("Ask a question");
        
        // MOVED: Apply scale after pyramid is created
        pyramid.scale.set(2, 2, 2);
        
        // Initial position - hidden below view
        pyramid.position.y = -5;
        
        // Start animation loop
        animate();
    }
    
    // Create text texture for the pyramid face
    function createTextTexture(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;
        
        // White background for the entire canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a subtle triangle outline to help with alignment
        ctx.strokeStyle = '#eeeeee';
        ctx.beginPath();
        ctx.moveTo(256, 110);  // Top of triangle
        ctx.lineTo(100, 400);  // Bottom left
        ctx.lineTo(412, 400);  // Bottom right
        ctx.closePath();
        ctx.stroke();
        
        // Draw the text
        ctx.fillStyle = 'black';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Split text into lines for better positioning
        const maxWidth = 260; // Reduced width to prevent overflow
        const lineHeight = 40;
        const lines = getLines(ctx, text, maxWidth);
        
        // Position text in center of the triangle shape
        // Move the text up slightly from the exact center to account for the triangle shape
        const centerY = 230; // Adjusted to be in the visual center of the triangle
        const startY = centerY - ((lines.length - 1) * lineHeight / 2);
        
        // Draw each line
        lines.forEach((line, i) => {
            ctx.fillText(line, 256, startY + (i * lineHeight));
        });
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    // Helper function to split text into lines
    function getLines(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for(let i = 1; i < words.length; i++) {
            const width = ctx.measureText(currentLine + ' ' + words[i]).width;
            if(width < maxWidth) {
                currentLine += ' ' + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);
        return lines;
    }
    
    // 2. Update the pyramid creation for better face orientation:
    function createPyramid(text) {
        // console.log("Creating pyramid with text:", text);
        textTexture = createTextTexture(text);
        
        if (pyramid) {
            // Update existing pyramid
            pyramid.material.map = textTexture;
            pyramid.material.needsUpdate = true;
        } else {
            // Create new pyramid (tetrahedron)
            const geometry = new THREE.TetrahedronGeometry(1, 0);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0xffffff, 
                map: textTexture,
                shininess: 30
            });
            
            pyramid = new THREE.Mesh(geometry, material);
            
            // Better orientation for text visibility
            pyramid.rotation.x = Math.PI * 0.2; // Adjusted to show more of the face
            pyramid.rotation.y = Math.PI * 0.25;
            pyramid.rotation.z = 0;
            
            scene.add(pyramid);
            // console.log("Pyramid created and added to scene");
        }
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate pyramid gently when revealed
        // if (isRevealed) {
        //     pyramid.rotation.y += 0.01;
        // }
        
        renderer.render(scene, camera);
    }
    
    // Responses array
    const responses = [
        "It is certain",
        "Without a doubt",
        "Yes definitely",
        "Most likely",
        "Yes",
        "Signs point to yes",
        "Reply hazy try again",
        "Ask again later",
        "Cannot predict now",
        "Don't count on it",
        "My sources say no",
        "Very doubtful",
        "No",
        "Outlook not so good",
        "Concentrate and ask again"
    ];
    
    let canShake = true;
    
    // Click event handler
    // Click event handler
    magicBall.addEventListener('click', function() {
        if (!canShake) return;
        
        canShake = false;
        isRevealed = false;
        
        // Update texture to "Shaking..."
        createPyramid("Shaking...");
        
        // Set initial position and rotation
        pyramid.position.y = -5;
        pyramid.rotation.x = -Math.PI; // Start upside down
        
        // Start shaking animation
        magicBall.classList.add('shaking');
        
        setTimeout(() => {
            // Stop shaking
            magicBall.classList.remove('shaking');
            
            // Get random response
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            // console.log("Selected response:", randomResponse);
            createPyramid(randomResponse);
            
            // Set revealed state and animate
            setTimeout(() => {
                isRevealed = true;
                
                // Lazy roll animation
                try {
                    // Using GSAP for smooth animation
                    gsap.to(pyramid.position, {
                        y: 0,
                        duration: 2.2,
                        ease: "power2.out"
                    });
                    
                    // Roll into position
                    gsap.to(pyramid.rotation, {
                        x: Math.PI * 0.2, // Final x rotation
                        duration: 2.2,
                        ease: "power2.out"
                    });
                } catch (error) {
                    // Fallback animation
                    console.log("GSAP not available, using fallback");
                    let progress = 0;
                    const animationInterval = setInterval(() => {
                        progress += 0.02;
                        
                        // Position animation
                        pyramid.position.y = -5 * (1 - progress);
                        
                        // Rotation animation - rolling effect
                        pyramid.rotation.x = -Math.PI + (Math.PI * 1.1 * progress);
                        
                        if (progress >= 1) {
                            pyramid.position.y = 0;
                            pyramid.rotation.x = Math.PI * 0.2;
                            clearInterval(animationInterval);
                        }
                    }, 16);
                }
                
                canShake = true;
            }, 500);
        }, 1000);
    });
    
    // Initialize Three.js scene
    initThreeJS();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const container = document.getElementById('pyramid-scene');
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});