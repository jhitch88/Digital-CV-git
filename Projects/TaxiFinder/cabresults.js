// Handle location dropdown changes
document.getElementById('fromLocationSelect').addEventListener('change', function() {
    const customInput = document.getElementById('fromLocationCustom');
    if (this.value === 'custom') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
});

document.getElementById('toLocationSelect').addEventListener('change', function() {
    const customInput = document.getElementById('toLocationCustom');
    if (this.value === 'custom') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
});

// Handle transport option selection visual feedback
document.querySelectorAll('.transport-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove selected class from all options
        document.querySelectorAll('.transport-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        this.classList.add('selected');
        
        // Check the radio button in this option
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
        }
    });
});

// Also handle direct radio button changes (for accessibility)
document.querySelectorAll('input[name="transportType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        document.querySelectorAll('.transport-option').forEach(option => {
            option.classList.remove('selected');
        });
        this.closest('.transport-option').classList.add('selected');
    });
});

// Initialize the first option as selected
document.querySelector('.transport-option').classList.add('selected');

document.getElementById('tripForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get location values
    const fromLocationSelect = document.getElementById('fromLocationSelect');
    const fromLocationCustom = document.getElementById('fromLocationCustom');
    const toLocationSelect = document.getElementById('toLocationSelect');
    const toLocationCustom = document.getElementById('toLocationCustom');
    
    let fromLocation = fromLocationSelect.value === 'custom' ? fromLocationCustom.value : fromLocationSelect.value;
    let toLocation = toLocationSelect.value === 'custom' ? toLocationCustom.value : toLocationSelect.value;
    
    // Get transport type
    const transportType = document.querySelector('input[name="transportType"]:checked').value;

    if (!fromLocation || !toLocation) {
        alert('Please select both pickup and destination locations.');
        return;
    }

    // Extract area from full address for distance calculation
    const fromArea = extractAreaFromAddress(fromLocation);
    const toArea = extractAreaFromAddress(toLocation);

    const tripRequest = {
        from: fromArea,
        to: toArea,
        fromAddress: fromLocation,
        toAddress: toLocation,
        transportType: transportType
    };

    try {
        const results = taxiRanker.rankTaxisForTrip(tripRequest);
        displayResults(results);
    } catch (error) {
        alert('Error processing your request: ' + error.message);
    }
});

// Function to extract area from full address for distance calculation
function extractAreaFromAddress(address) {
    if (address.includes('Downtown')) return 'Downtown';
    if (address.includes('Uptown')) return 'Uptown';
    if (address.includes('Airport')) return 'Airport';
    if (address.includes('Central Park')) return 'Central Park';
    if (address.includes('City Center') || address.includes('City Hall')) return 'City Center';
    if (address.includes('Suburban') || address.includes('Suburbs')) return 'Suburbs';
    if (address.includes('Hospital') || address.includes('Medical')) return 'Hospital';
    
    // Default to City Center if area can't be determined
    return 'City Center';
}

// Helper function to format transport type display
function formatTransportType(type) {
    switch(type) {
        case 'standard': return 'Standard Transport';
        case 'wheelchair': return 'Wheelchair Accessible';
        case 'stretcher': return 'Stretcher Transport';
        default: return 'Standard Transport';
    }
}

function displayResults(results) {
            const resultsSection = document.getElementById('resultsSection');
            const tripSummary = document.getElementById('tripSummary');
            const recGrid = document.getElementById('recGrid');
            const rankingsGrid = document.getElementById('rankingsGrid');

            // Show results section
            resultsSection.classList.remove('hidden');

            // Populate trip summary
            tripSummary.innerHTML = `
                <div class="summary-item">
                    <div class="label">Route</div>
                    <div class="value">${results.tripDetails.fromAddress || results.tripDetails.from} → ${results.tripDetails.toAddress || results.tripDetails.to}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Distance</div>
                    <div class="value">${results.tripDetails.distance} miles</div>
                </div>
                <div class="summary-item">
                    <div class="label">Transport Type</div>
                    <div class="value">${formatTransportType(results.tripDetails.transportType)}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Companies Found</div>
                    <div class="value">${results.rankings.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Best Price</div>
                    <div class="value">$${results.recommendations.budgetOption.estimatedCost}</div>
                </div>
            `;

            // Populate recommendations
            recGrid.innerHTML = `
                <div class="rec-item">
                    <div class="rec-title">🏆 Best Overall</div>
                    <div class="rec-detail">${results.recommendations.topChoice.company} - $${results.recommendations.topChoice.estimatedCost}</div>
                </div>
                <div class="rec-item">
                    <div class="rec-title">💰 Most Affordable</div>
                    <div class="rec-detail">${results.recommendations.budgetOption.company} - $${results.recommendations.budgetOption.estimatedCost}</div>
                </div>
                <div class="rec-item">
                    <div class="rec-title">⚡ Fastest Response</div>
                    <div class="rec-detail">${results.recommendations.fastestResponse.company} - ${results.recommendations.fastestResponse.responseTime} min</div>
                </div>
            `;

            // Populate rankings
            rankingsGrid.innerHTML = results.rankings.map((ranking, index) => {
                const isTopChoice = index === 0;
                const rankClass = index === 0 ? 'gold' : '';
                const cardClass = isTopChoice ? 'cab-card top-choice' : 'cab-card';

                const servicesTags = ranking.specialServices.map(service => {
                    const tagClass = service === 'wheelchair' ? 'service-tag wheelchair' : 
                                   service === 'luxury' ? 'service-tag luxury' : 'service-tag';
                    return `<span class="${tagClass}">${service}</span>`;
                }).join('');

                return `
                    <div class="${cardClass}">
                        <div class="rank-badge ${rankClass}">#${index + 1}</div>
                        <div class="cab-header">
                            <div class="cab-name">${ranking.company}</div>
                            <div class="score">${ranking.score}/100</div>
                        </div>
                        <div class="cab-details">
                            <div class="detail-item">
                                <div class="detail-label">Estimated Cost</div>
                                <div class="detail-value">$${ranking.estimatedCost}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Response Time</div>
                                <div class="detail-value">${ranking.responseTime} min</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Rating</div>
                                <div class="detail-value">${ranking.rating}/5 ⭐</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Availability</div>
                                <div class="detail-value">${Math.round(ranking.availability * 100)}%</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Can Pickup</div>
                                <div class="detail-value">${ranking.canPickup ? '✅ Yes' : '⚠️ No'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Wheelchair</div>
                                <div class="detail-value">${ranking.wheelchairAccessible ? '♿ Yes' : '❌ No'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Stretcher</div>
                                <div class="detail-value">${ranking.stretcherCapable ? '🏥 Yes' : '❌ No'}</div>
                            </div>
                        </div>
                        ${servicesTags ? `<div class="services-tags">${servicesTags}</div>` : ''}
                    </div>
                `;
            }).join('');

            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }