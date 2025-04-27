// Utility functions for conversions
const degreeSymbol = String.fromCharCode(176); // Unicode for degree symbol

// Convert Celsius to Fahrenheit
function convertCelsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

// Convert kilometers per hour to miles per hour
function convertKphToMph(kph) {
    return Math.floor(kph * 0.621371);
}

// Fix for the wind direction function - it was incorrectly using lat/long instead of windDirection
function getWindDirection(windDirection) {
    let windDirectionText = ""; // Initialize wind direction text

    if (windDirection >= 0 && windDirection < 23) {
        windDirectionText = "N";
    } else if (windDirection >= 23 && windDirection < 68) {
        windDirectionText = "NE";
    } else if (windDirection >= 68 && windDirection < 113) {
        windDirectionText = "E";
    } else if (windDirection >= 113 && windDirection < 158) {
        windDirectionText = "SE";
    } else if (windDirection >= 158 && windDirection < 203) {
        windDirectionText = "S";
    } else if (windDirection >= 203 && windDirection < 248) {
        windDirectionText = "SW";
    } else if (windDirection >= 248 && windDirection < 293) {
        windDirectionText = "W";
    } else if (windDirection >= 293 && windDirection < 338) {
        windDirectionText = "NW";
    } else {
        windDirectionText = "N"; // Default to North
    }
    return windDirectionText; // Return the wind direction text
}

// Determine if it's day or night based on current time and location
function isDayTime(weatherData) {
    const now = new Date();
    const hour = now.getHours();
    
    // Simple approach: day is between 6 AM and 6 PM
    return (hour >= 6 && hour < 18);
    // return false; //test night time features
}

// Function to create cloud elements with images - modified for better entry animation
function createClouds(cloudiness, isRainy) {
    const cloudsContainer = document.querySelector('.clouds');
    cloudsContainer.innerHTML = '';
    
    // Create clouds based on cloudiness (0-100%)
    const numClouds = Math.max(2, Math.floor(cloudiness / 10));
    
    // Use gray clouds ONLY for rainy conditions
    const useGrayClouds = isRainy;
    
    // Delay adding clouds to ensure they come in after everything loads
    setTimeout(() => {
        for (let i = 0; i < numClouds; i++) {
            const cloud = document.createElement('div');
            cloud.classList.add('cloud');
            
            // Increased cloud size for better presence
            const size = Math.random() * 300 + 200;
            const top = Math.random() * 60;
            
            // Stagger cloud entry by adding increasing delays
            const delay = Math.random() * 10 + (i * 2);
            const duration = Math.random() * 120 + 80;
            
            // Choose random cloud variation (1-4) but keep the type consistent
            const cloudNumber = Math.floor(Math.random() * 4) + 1;
            
            // Add appropriate cloud class based on weather condition
            if (useGrayClouds) {
                cloud.classList.add(`cloud-gray-${cloudNumber}`);
            } else {
                cloud.classList.add(`cloud-white-${cloudNumber}`);
            }
            
            cloud.style.width = `${size}px`;
            cloud.style.height = `${size * 0.75}px`;
            cloud.style.top = `${top}%`;
            
            // Position completely off-screen initially
            cloud.style.left = `-${size + 50}px`;
            
            // Adjust opacity based on cloud type and depth perception
            const depthFactor = Math.random();
            cloud.style.opacity = useGrayClouds 
                ? (Math.random() * 0.2 + 0.7)
                : (Math.random() * 0.4 + 0.5);
            
            // Add entry delay to animation properties
            cloud.style.animationDuration = `${duration}s`;
            cloud.style.animationDelay = `${delay}s`;
            
            // Add scale transform for better depth
            cloud.style.transform = `scale(${0.7 + depthFactor * 0.6})`;
            cloud.style.zIndex = Math.floor(depthFactor * 5) - 3;
            
            cloudsContainer.appendChild(cloud);
        }
    }, 1000); // Delay cloud creation by 1 second after weather data loads
}

// Update the UI with weather data - fix to avoid duplicate interval timers
function updateWeatherUI(weatherData, locationName) {
    // Clear any existing timer
    if (window.timeUpdateInterval) {
        clearInterval(window.timeUpdateInterval);
    }
    
    // Update location
    document.querySelector('.location').textContent = locationName;
    
    // Update temperature
    const tempF = convertCelsiusToFahrenheit(weatherData.temperature);
    document.querySelector('.temperature').textContent = tempF;
    
    // Update wind info
    const windSpeedMph = convertKphToMph(weatherData.windspeed);
    document.querySelector('.wind-speed').textContent = `${windSpeedMph} MPH`;
    
    const windDirectionText = getWindDirection(weatherData.winddirection);
    document.querySelector('.wind-direction').textContent = windDirectionText;
    
    // Update time 
    const now = new Date();
    document.querySelector('.time').textContent = now.toLocaleTimeString();
    
    // Determine day/night and update visual
    const isDaytime = isDayTime(weatherData);
    const sunMoon = document.querySelector('.sun-moon');
    
    // Clear previous classes
    sunMoon.classList.remove('sun', 'moon');
    document.body.className = ''; // Reset all classes
    
    // Set day/night class
    if (isDaytime) {
        document.body.classList.add('day');
        sunMoon.classList.add('sun');
    } else {
        document.body.classList.add('night');
        sunMoon.classList.add('moon');
    }
    
    // Use actual precipitation data instead of estimation
    const precipitation = weatherData.precipitation || 0;
    
    // Determine cloudiness for cloud display (still need some randomness for visual variety)
    let cloudiness = Math.random() * 100;
    if (precipitation > 0) {
        // More clouds when there's precipitation
        cloudiness = Math.max(cloudiness, 70);
    }
    
    // Weather condition determination based on actual data
    const isRainy = precipitation >= 0.1; // Light rain threshold is 0.1mm per hour
    const isWindy = weatherData.windspeed > 15;
    const isCloudy = !isRainy && (cloudiness > 70);
    
    // Update weather condition text and UI classes
    let weatherCondition = 'Clear';
    
    if (isRainy) {
        document.body.classList.add('rainy');
        
        // Determine rain intensity based on meteorological standards
        if (precipitation >= 7.6) {
            weatherCondition = 'Heavy Rain';
        } else if (precipitation >= 2.5) {
            weatherCondition = 'Moderate Rain';
        } else {
            weatherCondition = 'Light Rain';
        }
    } else if (isWindy) {
        document.body.classList.add('windy');
        weatherCondition = 'Windy';
    } else if (isCloudy) {
        document.body.classList.add('cloudy');
        weatherCondition = 'Cloudy';
    } else if (cloudiness > 30) {
        weatherCondition = 'Partly Cloudy';
    }
    
    document.querySelector('.weather-condition').textContent = weatherCondition;
    
    // Create clouds based on conditions - only use gray clouds for rain
    createClouds(cloudiness, isRainy);
    
    // Set up interval to update time (store reference to clear later)
    window.timeUpdateInterval = setInterval(() => {
        const now = new Date();
        document.querySelector('.time').textContent = now.toLocaleTimeString();
    }, 1000);
}

// Fetch weather data from OpenWeatherMap API
async function getWeatherData(latitude, longitude) {
    try {
        latitude = latitude || 40.7484; // Default latitude for New York City
        longitude = longitude || -73.9857; // Default longitude for New York City
        
        // Updated API call to include hourly precipitation data
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=precipitation&timezone=auto`);
        
        const weatherData = response.data.current_weather;
        
        // Get current hour's precipitation data
        const now = new Date();
        const currentHour = now.getHours();
        const currentDate = now.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        
        // Find index for current hour in the hourly data
        const hourlyTimeIndex = response.data.hourly.time.findIndex(time => 
            time.includes(`${currentDate}T${currentHour.toString().padStart(2, '0')}:00`));
        
        // Get precipitation for current hour if available
        let precipitation = 0;
        if (hourlyTimeIndex !== -1) {
            precipitation = response.data.hourly.precipitation[hourlyTimeIndex];
            console.log(`Current precipitation: ${precipitation}mm`);
        }
        
        // Add precipitation to the weather data object
        weatherData.precipitation = precipitation;
        
        // Get location name
        const locationName = await getLocationName(latitude, longitude);
        
        // Update UI with weather data
        updateWeatherUI(weatherData, locationName);
        
    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.querySelector('.location').textContent = "Error loading weather data";
    }
}

// Function to get location name from coordinates
async function getLocationName(latitude, longitude) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();
        
        let locationParts = [];
        
        if (data.address) {
            if (data.address.suburb) locationParts.push(data.address.suburb);
            if (data.address.city) locationParts.push(data.address.city);
            else if (data.address.town) locationParts.push(data.address.town);
            else if (data.address.village) locationParts.push(data.address.village);
            
            if (data.address.state) locationParts.push(data.address.state);
        }
        
        return locationParts.length > 0 ? locationParts.join(", ") : data.display_name || "Unknown location";
    } catch (error) {
        console.error("Error fetching location:", error);
        return "Location not found";
    }
}

// Function to get user's geolocation if available
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherData(latitude, longitude);
            },
            () => {
                // Use default location if geolocation is denied or unavailable
                getWeatherData();
            }
        );
    } else {
        // Geolocation not supported by the browser
        getWeatherData();
    }
}

// Initialize the app when loaded
document.addEventListener('DOMContentLoaded', getUserLocation);


