# Recipe Keeper 🍳

A modern, mobile-friendly recipe management app designed for cooking enthusiasts. Features a clean ingredient and step-focused interface with the ability to keep your phone screen on while cooking.

## Features

### Core Functionality
- **Recipe Management**: Add, edit, delete, and view recipes
- **Ingredient Focus**: Clear, checklist-style ingredient display
- **Step-by-Step Instructions**: Large, numbered steps for easy following
- **Search**: Find recipes by name, description, or ingredients
- **Local Storage**: All recipes stored locally in your browser

### Mobile-Optimized
- **Screen Wake Lock**: Keep your phone screen on while cooking (supported browsers)
- **Touch-Friendly**: Large buttons and inputs designed for kitchen use
- **Responsive Design**: Works great on phones, tablets, and desktops
- **PWA Ready**: Can be installed as an app on your device

### User Experience
- **Clean Interface**: Minimalist design focused on readability
- **Easy Recipe Addition**: Simple form with dynamic ingredient/step fields
- **Quick Access**: Fast loading and navigation between recipes
- **Visual Feedback**: Clear indicators and smooth transitions

## Usage

### Adding a Recipe
1. Click the "+ Add Recipe" button in the header
2. Fill in the recipe details:
   - **Name** (required)
   - **Description** (optional)
   - **Prep Time** (optional, in minutes)
   - **Cook Time** (optional, in minutes)
   - **Servings** (optional)
3. Add ingredients using the "Add Ingredient" button
4. Add cooking steps using the "Add Step" button
5. Click "Save Recipe"

### Viewing a Recipe
1. Click on any recipe card from the main list
2. View ingredients in an easy-to-read checklist format
3. Follow numbered cooking steps
4. Use the "Keep Screen On" button to prevent your phone from sleeping

### Managing Recipes
- **Edit**: Click the "Edit" button when viewing a recipe
- **Delete**: Click the "Delete" button when viewing a recipe
- **Search**: Use the search bar to find specific recipes

### Screen Wake Lock
The screen wake lock feature helps keep your phone screen on while cooking:
- Click the ☀️ "Screen Lock" button in the header
- When active, your screen won't turn off automatically
- Especially useful when following recipes on mobile devices
- Note: This feature requires a compatible browser (most modern mobile browsers)

## Technical Details

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Wake Lock**: Supported in Chrome, Edge, and other Chromium-based browsers

### Data Storage
- All recipes are stored locally in your browser's localStorage
- No internet connection required after initial load
- Data persists between browser sessions
- Data is tied to the specific browser/device

### Installation as PWA
1. Open the site in a compatible mobile browser
2. Look for "Add to Home Screen" or "Install App" option
3. Follow the browser prompts to install
4. Access the app from your home screen like a native app

## File Structure
```
Recipe-Site/
├── index.html          # Main HTML structure
├── style.css           # Styles and responsive design
├── script.js           # Application logic and functionality
├── manifest.json       # PWA manifest for app installation
└── README.md          # This file
```

## Development

### Running Locally
1. Open `index.html` in any modern web browser
2. Or serve with a local server for best experience:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server
   
   # Using VS Code Live Server extension
   Right-click index.html → "Open with Live Server"
   ```

### Customization
The app is built with vanilla HTML, CSS, and JavaScript, making it easy to customize:

- **Colors**: Modify CSS custom properties in `style.css`
- **Features**: Add functionality in the `RecipeApp` class in `script.js`
- **Layout**: Adjust the HTML structure in `index.html`

## Browser Support Notes

### Wake Lock API
The screen wake lock feature uses the Screen Wake Lock API:
- ✅ **Supported**: Chrome 84+, Edge 84+, Opera 70+
- ❌ **Not Supported**: Firefox, Safari (as of current versions)
- 📱 **Mobile**: Works great on Android Chrome and Edge

### Fallbacks
- If wake lock isn't supported, the button is hidden automatically
- All other features work regardless of wake lock support
- Progressive enhancement ensures the app works everywhere

## Tips for Best Experience

1. **Install as PWA** on mobile devices for the best experience
2. **Use landscape mode** on tablets for better step visibility
3. **Enable wake lock** when actively cooking to keep screen on
4. **Use descriptive ingredient measurements** (e.g., "2 cups flour, sifted")
5. **Write clear, action-oriented steps** (e.g., "Preheat oven to 350°F")

## Future Enhancements

Potential features for future versions:
- Recipe sharing via URL/QR codes
- Import/export functionality
- Recipe categories and tags
- Cooking timers integration
- Unit conversion tools
- Nutritional information
- Recipe scaling (adjust serving sizes)
- Photo support for recipes

---

Happy cooking! 👨‍🍳👩‍🍳
