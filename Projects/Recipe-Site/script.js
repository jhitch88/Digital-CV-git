class RecipeApp {
    constructor() {
        this.recipes = this.loadRecipes();
        this.currentRecipe = null;
        this.editingRecipe = null;
        this.wakeLock = null;
        this.currentView = 'recipe-list-view';
        
        this.initializeApp();
        this.bindEvents();
        this.renderRecipes();
    }

    initializeApp() {
        // Initialize wake lock support
        this.initializeWakeLock();
        
        // Show empty state if no recipes
        this.updateEmptyState();
    }

    bindEvents() {
        // Navigation events
        document.getElementById('add-recipe-btn').addEventListener('click', () => this.showAddRecipe());
        document.getElementById('back-btn').addEventListener('click', () => this.showRecipeList());
        document.getElementById('cancel-btn').addEventListener('click', () => this.showRecipeList());
        document.getElementById('edit-recipe-btn').addEventListener('click', () => this.editCurrentRecipe());
        document.getElementById('delete-recipe-btn').addEventListener('click', () => this.deleteCurrentRecipe());

        // Wake lock
        document.getElementById('wake-lock-btn').addEventListener('click', () => this.toggleWakeLock());

        // Search
        document.getElementById('recipe-search').addEventListener('input', (e) => this.searchRecipes(e.target.value));

        // Form events
        document.getElementById('recipe-form').addEventListener('submit', (e) => this.saveRecipe(e));
        document.getElementById('add-ingredient').addEventListener('click', () => this.addIngredient());
        document.getElementById('add-step').addEventListener('click', () => this.addStep());

        // Dynamic form events (using event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-ingredient')) {
                e.target.closest('.ingredient-item').remove();
            }
            if (e.target.classList.contains('remove-step')) {
                e.target.closest('.step-item').remove();
                this.updateStepNumbers();
            }
            if (e.target.closest('.recipe-card')) {
                const recipeId = e.target.closest('.recipe-card').dataset.recipeId;
                this.showRecipe(recipeId);
            }
        });
    }

    // Wake Lock functionality
    async initializeWakeLock() {
        const wakeLockBtn = document.getElementById('wake-lock-btn');
        
        if ('wakeLock' in navigator) {
            wakeLockBtn.style.display = 'flex';
        } else {
            wakeLockBtn.style.display = 'none';
        }
    }

    async toggleWakeLock() {
        const wakeLockBtn = document.getElementById('wake-lock-btn');
        
        try {
            if (this.wakeLock !== null) {
                await this.wakeLock.release();
                this.wakeLock = null;
                wakeLockBtn.classList.remove('active');
                wakeLockBtn.title = 'Keep screen on';
            } else {
                this.wakeLock = await navigator.wakeLock.request('screen');
                wakeLockBtn.classList.add('active');
                wakeLockBtn.title = 'Screen staying on';
                
                this.wakeLock.addEventListener('release', () => {
                    wakeLockBtn.classList.remove('active');
                    wakeLockBtn.title = 'Keep screen on';
                    this.wakeLock = null;
                });
            }
        } catch (err) {
            console.error('Wake lock error:', err);
        }
    }

    // Data management
    loadRecipes() {
        const stored = localStorage.getItem('recipes');
        return stored ? JSON.parse(stored) : [];
    }

    saveRecipes() {
        localStorage.setItem('recipes', JSON.stringify(this.recipes));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // View management
    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        this.currentView = viewId;
    }

    showRecipeList() {
        this.showView('recipe-list-view');
        this.currentRecipe = null;
        this.editingRecipe = null;
        this.renderRecipes();
    }

    showAddRecipe() {
        this.showView('recipe-form-view');
        this.editingRecipe = null;
        document.getElementById('form-title').textContent = 'Add New Recipe';
        this.resetForm();
    }

    showRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        this.currentRecipe = recipe;
        this.showView('recipe-detail-view');
        this.renderRecipeDetail(recipe);
    }

    editCurrentRecipe() {
        if (!this.currentRecipe) return;
        
        this.editingRecipe = this.currentRecipe;
        this.showView('recipe-form-view');
        document.getElementById('form-title').textContent = 'Edit Recipe';
        this.populateForm(this.currentRecipe);
    }

    deleteCurrentRecipe() {
        if (!this.currentRecipe) return;
        
        if (confirm('Are you sure you want to delete this recipe?')) {
            this.recipes = this.recipes.filter(r => r.id !== this.currentRecipe.id);
            this.saveRecipes();
            this.showRecipeList();
        }
    }

    // Recipe rendering
    renderRecipes(filteredRecipes = null) {
        const recipesToRender = filteredRecipes || this.recipes;
        const grid = document.getElementById('recipe-grid');
        
        if (recipesToRender.length === 0) {
            grid.innerHTML = '';
            this.updateEmptyState();
            return;
        }

        grid.innerHTML = recipesToRender.map(recipe => `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-card-content">
                    <h3>${recipe.name}</h3>
                    <p>${recipe.description || 'No description'}</p>
                    <div class="recipe-meta">
                        ${recipe.prepTime ? `<span>⏱️ ${recipe.prepTime}m prep</span>` : ''}
                        ${recipe.cookTime ? `<span>🔥 ${recipe.cookTime}m cook</span>` : ''}
                        ${recipe.servings ? `<span>👥 ${recipe.servings} servings</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        this.updateEmptyState();
    }

    renderRecipeDetail(recipe) {
        const content = document.getElementById('recipe-content');
        
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        
        content.innerHTML = `
            <h1 class="recipe-title">${recipe.name}</h1>
            ${recipe.description ? `<p class="recipe-description">${recipe.description}</p>` : ''}
            
            <div class="recipe-info">
                ${recipe.prepTime ? `
                    <div class="info-item">
                        <div class="info-label">Prep Time</div>
                        <div class="info-value">${recipe.prepTime}m</div>
                    </div>
                ` : ''}
                ${recipe.cookTime ? `
                    <div class="info-item">
                        <div class="info-label">Cook Time</div>
                        <div class="info-value">${recipe.cookTime}m</div>
                    </div>
                ` : ''}
                ${totalTime > 0 ? `
                    <div class="info-item">
                        <div class="info-label">Total Time</div>
                        <div class="info-value">${totalTime}m</div>
                    </div>
                ` : ''}
                ${recipe.servings ? `
                    <div class="info-item">
                        <div class="info-label">Servings</div>
                        <div class="info-value">${recipe.servings}</div>
                    </div>
                ` : ''}
            </div>

            <div class="recipe-section">
                <h2 class="section-title">🛒 Ingredients</h2>
                <ul class="ingredients-list">
                    ${recipe.ingredients.map(ingredient => `
                        <li class="ingredient-item">${ingredient}</li>
                    `).join('')}
                </ul>
            </div>

            <div class="recipe-section">
                <h2 class="section-title">👨‍🍳 Instructions</h2>
                <ol class="steps-list">
                    ${recipe.steps.map((step, index) => `
                        <li class="step-item">
                            <span class="step-number">${index + 1}</span>
                            <div class="step-text">${step}</div>
                        </li>
                    `).join('')}
                </ol>
            </div>
        `;
    }

    updateEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const grid = document.getElementById('recipe-grid');
        
        if (this.recipes.length === 0) {
            emptyState.style.display = 'block';
            grid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            grid.style.display = 'grid';
        }
    }

    // Search functionality
    searchRecipes(query) {
        if (!query.trim()) {
            this.renderRecipes();
            return;
        }

        const filtered = this.recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(query.toLowerCase()) ||
            recipe.description.toLowerCase().includes(query.toLowerCase()) ||
            recipe.ingredients.some(ingredient => 
                ingredient.toLowerCase().includes(query.toLowerCase())
            )
        );

        this.renderRecipes(filtered);
    }

    // Form management
    resetForm() {
        document.getElementById('recipe-form').reset();
        
        // Reset ingredients (keep one empty input)
        const ingredientsContainer = document.getElementById('ingredients-container');
        ingredientsContainer.innerHTML = `
            <div class="ingredient-item">
                <input type="text" placeholder="e.g., 2 cups flour" class="ingredient-input" required>
                <button type="button" class="remove-ingredient">×</button>
            </div>
        `;

        // Reset steps (keep one empty input)
        const stepsContainer = document.getElementById('steps-container');
        stepsContainer.innerHTML = `
            <div class="step-item">
                <span class="step-number">1</span>
                <textarea placeholder="Describe the step..." class="step-input" required></textarea>
                <button type="button" class="remove-step">×</button>
            </div>
        `;
    }

    populateForm(recipe) {
        document.getElementById('recipe-name').value = recipe.name;
        document.getElementById('recipe-description').value = recipe.description || '';
        document.getElementById('prep-time').value = recipe.prepTime || '';
        document.getElementById('cook-time').value = recipe.cookTime || '';
        document.getElementById('servings').value = recipe.servings || '';

        // Populate ingredients
        const ingredientsContainer = document.getElementById('ingredients-container');
        ingredientsContainer.innerHTML = recipe.ingredients.map(ingredient => `
            <div class="ingredient-item">
                <input type="text" value="${ingredient}" class="ingredient-input" required>
                <button type="button" class="remove-ingredient">×</button>
            </div>
        `).join('');

        // Populate steps
        const stepsContainer = document.getElementById('steps-container');
        stepsContainer.innerHTML = recipe.steps.map((step, index) => `
            <div class="step-item">
                <span class="step-number">${index + 1}</span>
                <textarea class="step-input" required>${step}</textarea>
                <button type="button" class="remove-step">×</button>
            </div>
        `).join('');
    }

    addIngredient() {
        const container = document.getElementById('ingredients-container');
        const ingredientItem = document.createElement('div');
        ingredientItem.className = 'ingredient-item';
        ingredientItem.innerHTML = `
            <input type="text" placeholder="e.g., 1 cup sugar" class="ingredient-input" required>
            <button type="button" class="remove-ingredient">×</button>
        `;
        container.appendChild(ingredientItem);
        ingredientItem.querySelector('.ingredient-input').focus();
    }

    addStep() {
        const container = document.getElementById('steps-container');
        const stepCount = container.children.length + 1;
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        stepItem.innerHTML = `
            <span class="step-number">${stepCount}</span>
            <textarea placeholder="Describe the step..." class="step-input" required></textarea>
            <button type="button" class="remove-step">×</button>
        `;
        container.appendChild(stepItem);
        stepItem.querySelector('.step-input').focus();
    }

    updateStepNumbers() {
        const stepItems = document.querySelectorAll('#steps-container .step-item');
        stepItems.forEach((item, index) => {
            item.querySelector('.step-number').textContent = index + 1;
        });
    }

    saveRecipe(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const ingredients = Array.from(document.querySelectorAll('.ingredient-input'))
            .map(input => input.value.trim())
            .filter(value => value);
        
        const steps = Array.from(document.querySelectorAll('.step-input'))
            .map(input => input.value.trim())
            .filter(value => value);

        if (ingredients.length === 0) {
            alert('Please add at least one ingredient.');
            return;
        }

        if (steps.length === 0) {
            alert('Please add at least one step.');
            return;
        }

        const recipe = {
            id: this.editingRecipe ? this.editingRecipe.id : this.generateId(),
            name: document.getElementById('recipe-name').value.trim(),
            description: document.getElementById('recipe-description').value.trim(),
            prepTime: parseInt(document.getElementById('prep-time').value) || null,
            cookTime: parseInt(document.getElementById('cook-time').value) || null,
            servings: parseInt(document.getElementById('servings').value) || null,
            ingredients,
            steps,
            createdAt: this.editingRecipe ? this.editingRecipe.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.editingRecipe) {
            const index = this.recipes.findIndex(r => r.id === this.editingRecipe.id);
            this.recipes[index] = recipe;
        } else {
            this.recipes.push(recipe);
        }

        this.saveRecipes();
        this.showRecipeList();
        
        // Show success message
        this.showToast(this.editingRecipe ? 'Recipe updated!' : 'Recipe saved!');
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Export for global access
let app;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new RecipeApp();
});

// Handle visibility change to maintain wake lock
document.addEventListener('visibilitychange', async () => {
    if (app && app.wakeLock !== null && document.visibilityState === 'visible') {
        try {
            app.wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.error('Failed to re-acquire wake lock:', err);
        }
    }
});
