document.addEventListener('DOMContentLoaded', () => {
    const colorThief = new ColorThief();
    const images = document.querySelectorAll('.carousel-image');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    let currentIndex = Math.floor(images.length / 2);

    function updateCarousel() {
        images.forEach((img, index) => {
            img.classList.remove('center', 'adjacent');
            // Only show 3 images at a time
            const position = index - currentIndex;
            
            if (Math.abs(position) > 1) {
                img.style.display = 'none';
            } else {
                img.style.display = 'block';
                if (position === 0) {
                    img.classList.add('center');
                    updateBackgroundColor(img);
                } else {
                    img.classList.add('adjacent');
                }
            
                // Calculate scale and brightness
                const scale = position === 0 ? 1 : 0.7;
                const brightness = position === 0 ? 1 : 0.6;
                const xOffset = position * 160; // Adjust this value to control spacing
                
                img.style.transform = `translateX(${xOffset}px) scale(${scale})`;
                img.style.filter = `brightness(${brightness})`;
                img.style.zIndex = position === 0 ? 2 : 1;
            }
        });
    }

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Initialize carousel
    updateCarousel();

    // Add event listeners to each image (deprecated)
    // images.forEach(img => {
    //     img.addEventListener('mouseenter', () => {
    //         if (img.complete) {
    //             updateBackgroundColor(img);
    //         } else {
    //             img.addEventListener('load', () => updateBackgroundColor(img));
    //         }
    //     });
    // });

    function updateBackgroundColor(img) {
        const dominantColor = colorThief.getColor(img);
        const palette = colorThief.getPalette(img, 5); // Get 5 dominant colors
        
        // Calculate brightness of dominant color (0-255)
        const brightness = Math.round((dominantColor[0] * 299 +
                                    dominantColor[1] * 587 +
                                    dominantColor[2] * 114) / 1000);
        
        // If the dominant color is too bright (threshold: 200)
        if (brightness > 150) {
            // Find the darkest color in the palette
            const darkColor = palette.reduce((darkest, current) => {
                const currentBrightness = Math.round((current[0] * 299 +
                                                    current[1] * 587 +
                                                    current[2] * 114) / 1000);
                const darkestBrightness = Math.round((darkest[0] * 299 +
                                                    darkest[1] * 587 +
                                                    darkest[2] * 114) / 1000);
                return currentBrightness < darkestBrightness ? current : darkest;
            });
            
            document.body.style.backgroundColor = `rgb(${darkColor[0]}, ${darkColor[1]}, ${darkColor[2]})`;
        } else {
            document.body.style.backgroundColor = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
        }
    }
});