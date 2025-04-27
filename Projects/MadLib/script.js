document.addEventListener('DOMContentLoaded', function() {
    const wordForm = document.getElementById('word-form');
    const wordInputsContainer = document.querySelector('.word-inputs');
    const completedStory = document.getElementById('completed-story');
    const storyText = document.getElementById('story-text');
    const resetButton = document.getElementById('reset-button');
    
    // Store original placeholder text from bold elements
    const originalBoldTexts = [];
    const boldElements = storyText.querySelectorAll('b');
    for (let i = 0; i < boldElements.length; i++) {
        originalBoldTexts.push(boldElements[i].textContent);
    }

    wordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get all input values in order
        const inputs = Array.from(wordForm.querySelectorAll('input[type="text"]')).map(input => input.value);
        
        // Replace each bold element with corresponding input
        for (let i = 0; i < Math.min(boldElements.length, inputs.length); i++) {
            boldElements[i].textContent = inputs[i];
        }
        
        // Hide the form container
        wordInputsContainer.style.display = 'none';
        
        // Show the completed story
        completedStory.style.visibility = 'visible';
        
        // Scroll to the story
        completedStory.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Reset story button functionality
    resetButton.addEventListener('click', function() {
        // Reset form inputs
        wordForm.reset();
        
        // Show the form again
        wordInputsContainer.style.display = 'block';
        
        // Hide the completed story
        completedStory.style.visibility = 'hidden';
        
        // Reset bold text to original placeholders
        for (let i = 0; i < boldElements.length; i++) {
            boldElements[i].textContent = originalBoldTexts[i];
        }
        
        // Scroll back to the form
        wordInputsContainer.scrollIntoView({ behavior: 'smooth' });
    });
});