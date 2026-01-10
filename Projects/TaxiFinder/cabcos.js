const cabData = [
//Taxi companies and their information including preferred pickup locations/areas, whether they have wheelchair accessible vehicles, stretcher capability, and how much they charge per their contract.
        { 
            name: "Yellow Cab", 
            pickupLocations: ["Downtown", "Airport", "Central Park"], 
            wheelchairAccessible: true,
            stretcherCapable: false,
            contractRate: 15,
            availability: 0.9, // 90% availability rate
            responseTime: 8, // average response time in minutes
            serviceAreas: ["Downtown", "Airport", "Central Park", "Uptown", "City Center"], // areas they service (pickup + dropoff)
            rating: 4.2,
            specialServices: ["wheelchair"]
        },
        { 
            name: "Blue Taxi", 
            pickupLocations: ["Uptown", "City Center", "Suburbs"], 
            wheelchairAccessible: false,
            stretcherCapable: false,
            contractRate: 12,
            availability: 0.85,
            responseTime: 12,
            serviceAreas: ["Uptown", "City Center", "Suburbs", "Downtown"],
            rating: 3.8,
            specialServices: []
        },
        { 
            name: "Green Cabs", 
            pickupLocations: ["Downtown", "City Center", "Suburbs"], 
            wheelchairAccessible: true,
            stretcherCapable: false,
            contractRate: 18,
            availability: 0.95,
            responseTime: 6,
            serviceAreas: ["Downtown", "City Center", "Suburbs", "Airport"],
            rating: 4.5,
            specialServices: ["wheelchair", "eco-friendly"]
        },
        { 
            name: "Red Taxi", 
            pickupLocations: ["Airport", "Downtown", "Central Park"], 
            wheelchairAccessible: false,
            stretcherCapable: false,
            contractRate: 10,
            availability: 0.8,
            responseTime: 15,
            serviceAreas: ["Airport", "Downtown", "Central Park", "City Center"],
            rating: 3.5,
            specialServices: []
        },
        { 
            name: "Black Cab", 
            pickupLocations: ["Uptown", "Airport", "City Center"], 
            wheelchairAccessible: true,
            stretcherCapable: false,
            contractRate: 20,
            availability: 0.75,
            responseTime: 10,
            serviceAreas: ["Uptown", "Airport", "City Center", "Downtown", "Central Park"],
            rating: 4.7,
            specialServices: ["wheelchair", "luxury", "executive"]
        },
        { 
            name: "Super Cab", 
            pickupLocations: ["Downtown", "Uptown", "Central Park"], 
            wheelchairAccessible: false,
            stretcherCapable: false,
            contractRate: 14,
            availability: 0.88,
            responseTime: 9,
            serviceAreas: ["Downtown", "Uptown", "Central Park", "City Center"],
            rating: 4.0,
            specialServices: ["24/7"]
        },
        { 
            name: "Metro Taxi", 
            pickupLocations: ["City Center", "Suburbs", "Downtown"], 
            wheelchairAccessible: true,
            stretcherCapable: false,
            contractRate: 16,
            availability: 0.92,
            responseTime: 7,
            serviceAreas: ["City Center", "Suburbs", "Downtown", "Airport"],
            rating: 4.3,
            specialServices: ["wheelchair", "child-seats"]
        },
        { 
            name: "City Cabs", 
            pickupLocations: ["Airport", "Uptown", "Downtown"], 
            wheelchairAccessible: false,
            stretcherCapable: false,
            contractRate: 11,
            availability: 0.82,
            responseTime: 11,
            serviceAreas: ["Airport", "Uptown", "Downtown", "City Center", "Central Park"],
            rating: 3.9,
            specialServices: ["airport-specialist"]
        },
        { 
            name: "Express Taxi", 
            pickupLocations: ["Central Park", "City Center", "Suburbs"], 
            wheelchairAccessible: true,
            stretcherCapable: false,
            contractRate: 19,
            availability: 0.87,
            responseTime: 5,
            serviceAreas: ["Central Park", "City Center", "Suburbs", "Downtown"],
            rating: 4.4,
            specialServices: ["wheelchair", "express", "premium"]
        },
        { 
            name: "MedTransport Solutions", 
            pickupLocations: ["Hospital", "Medical Centers", "All Areas"], 
            wheelchairAccessible: true,
            stretcherCapable: true,
            contractRate: 35,
            availability: 0.95,
            responseTime: 15,
            serviceAreas: ["All Areas"],
            rating: 4.8,
            specialServices: ["wheelchair", "stretcher", "medical-equipment", "trained-staff"]
        },
        { 
            name: "LifeLine Medical Transport", 
            pickupLocations: ["All Areas"], 
            wheelchairAccessible: true,
            stretcherCapable: true,
            contractRate: 40,
            availability: 0.90,
            responseTime: 20,
            serviceAreas: ["All Areas"],
            rating: 4.6,
            specialServices: ["wheelchair", "stretcher", "oxygen-equipped", "cardiac-monitoring"]
        }
    ];

// Distance matrix for calculating trip distances (in miles)
const distanceMatrix = {
    "Downtown": {
        "Downtown": 0,
        "Uptown": 4.2,
        "Airport": 8.5,
        "Central Park": 2.3,
        "City Center": 1.8,
        "Suburbs": 6.7,
        "Hospital": 3.9 // Main hospital location
    },
    "Uptown": {
        "Downtown": 4.2,
        "Uptown": 0,
        "Airport": 7.1,
        "Central Park": 3.6,
        "City Center": 2.9,
        "Suburbs": 5.4,
        "Hospital": 1.2
    },
    "Airport": {
        "Downtown": 8.5,
        "Uptown": 7.1,
        "Airport": 0,
        "Central Park": 6.8,
        "City Center": 7.3,
        "Suburbs": 12.1,
        "Hospital": 8.3
    },
    "Central Park": {
        "Downtown": 2.3,
        "Uptown": 3.6,
        "Airport": 6.8,
        "Central Park": 0,
        "City Center": 1.5,
        "Suburbs": 5.2,
        "Hospital": 2.7
    },
    "City Center": {
        "Downtown": 1.8,
        "Uptown": 2.9,
        "Airport": 7.3,
        "Central Park": 1.5,
        "City Center": 0,
        "Suburbs": 4.8,
        "Hospital": 2.1
    },
    "Suburbs": {
        "Downtown": 6.7,
        "Uptown": 5.4,
        "Airport": 12.1,
        "Central Park": 5.2,
        "City Center": 4.8,
        "Suburbs": 0,
        "Hospital": 4.6
    },
    "Hospital": {
        "Downtown": 3.9,
        "Uptown": 1.2,
        "Airport": 8.3,
        "Central Park": 2.7,
        "City Center": 2.1,
        "Suburbs": 4.6,
        "Hospital": 0
    }
};

/**
 * Taxi Ranking System
 * Ranks taxi companies based on multiple factors for a given trip
 */
class TaxiRankingSystem {
    constructor(cabData, distanceMatrix) {
        this.cabData = cabData;
        this.distanceMatrix = distanceMatrix;
    }

    /**
     * Calculate trip distance between two locations
     */
    getDistance(from, to) {
        if (this.distanceMatrix[from] && this.distanceMatrix[from][to]) {
            return this.distanceMatrix[from][to];
        }
        // Default fallback distance if not in matrix
        return 5.0;
    }

    /**
     * Calculate total trip cost including base rate and distance
     */
    calculateTripCost(company, distance) {
        const baseRate = company.contractRate;
        const perMileRate = 2.5; // $2.50 per mile
        return baseRate + (distance * perMileRate);
    }

    /**
     * Check if company can service the pickup location
     */
    canPickupFrom(company, location) {
        return company.pickupLocations.includes(location);
    }

    /**
     * Check if company can service the destination
     */
    canDropoffAt(company, location) {
        return company.serviceAreas.includes(location);
    }

    /**
     * Calculate ranking score for a company based on multiple factors
     */
    calculateScore(company, tripRequest) {
        let score = 0;
        let factors = {};

        const distance = this.getDistance(tripRequest.from, tripRequest.to);
        const tripCost = this.calculateTripCost(company, distance);

        // Factor 1: Pickup capability (30 points max)
        if (this.canPickupFrom(company, tripRequest.from)) {
            score += 30;
            factors.pickupCapability = 30;
        } else {
            // Penalty for not being in preferred pickup area
            score += 10;
            factors.pickupCapability = 10;
        }

        // Factor 2: Service area coverage (20 points max)
        if (this.canDropoffAt(company, tripRequest.to)) {
            score += 20;
            factors.serviceArea = 20;
        } else {
            score += 5; // Minimal points if they don't typically service the area
            factors.serviceArea = 5;
        }

        // Factor 3: Cost efficiency (25 points max, inverse relationship)
        const maxCost = 100; // Assume max reasonable cost
        const costScore = Math.max(0, 25 - (tripCost / maxCost) * 25);
        score += costScore;
        factors.costEfficiency = costScore;

        // Factor 4: Availability (15 points max)
        const availabilityScore = company.availability * 15;
        score += availabilityScore;
        factors.availability = availabilityScore;

        // Factor 5: Response time (10 points max, inverse relationship)
        const maxResponseTime = 20; // 20 minutes max
        const responseScore = Math.max(0, 10 - (company.responseTime / maxResponseTime) * 10);
        score += responseScore;
        factors.responseTime = responseScore;

        // Factor 6: Customer rating (15 points max)
        const ratingScore = (company.rating / 5) * 15;
        score += ratingScore;
        factors.rating = ratingScore;

        // Factor 7: Special requirements (bonus points)
        let specialScore = 0;
        if (tripRequest.transportType === 'wheelchair' && company.wheelchairAccessible) {
            specialScore += 15; // Higher bonus for wheelchair requirement
        }
        if (tripRequest.transportType === 'stretcher' && company.stretcherCapable) {
            specialScore += 20; // Even higher bonus for stretcher requirement
        }
        // Penalty if they can't meet transport requirements
        if (tripRequest.transportType === 'wheelchair' && !company.wheelchairAccessible) {
            specialScore -= 30; // Heavy penalty for not meeting accessibility needs
        }
        if (tripRequest.transportType === 'stretcher' && !company.stretcherCapable) {
            specialScore -= 40; // Heavy penalty for not meeting medical transport needs
        }
        
        score += specialScore;
        factors.specialServices = specialScore;

        return {
            totalScore: Math.round(score * 100) / 100,
            factors: factors,
            estimatedCost: Math.round(tripCost * 100) / 100,
            distance: distance
        };
    }

    /**
     * Main function to rank taxi companies for a trip request
     */
    rankTaxisForTrip(tripRequest) {
        // Validate trip request
        if (!tripRequest.from || !tripRequest.to) {
            throw new Error("Trip request must include 'from' and 'to' locations");
        }

        const rankings = [];

        this.cabData.forEach(company => {
            const scoring = this.calculateScore(company, tripRequest);
            
            rankings.push({
                company: company.name,
                score: scoring.totalScore,
                estimatedCost: scoring.estimatedCost,
                distance: scoring.distance,
                factors: scoring.factors,
                canPickup: this.canPickupFrom(company, tripRequest.from),
                canDropoff: this.canDropoffAt(company, tripRequest.to),
                wheelchairAccessible: company.wheelchairAccessible,
                stretcherCapable: company.stretcherCapable,
                responseTime: company.responseTime,
                rating: company.rating,
                availability: company.availability,
                specialServices: company.specialServices
            });
        });

        // Sort by score (highest first)
        rankings.sort((a, b) => b.score - a.score);

        return {
            tripDetails: {
                from: tripRequest.from,
                to: tripRequest.to,
                fromAddress: tripRequest.fromAddress,
                toAddress: tripRequest.toAddress,
                transportType: tripRequest.transportType,
                distance: this.getDistance(tripRequest.from, tripRequest.to)
            },
            rankings: rankings,
            recommendations: this.generateRecommendations(rankings, tripRequest)
        };
    }

    /**
     * Generate human-readable recommendations
     */
    generateRecommendations(rankings, tripRequest) {
        const top3 = rankings.slice(0, 3);
        const cheapest = rankings.reduce((min, current) => 
            current.estimatedCost < min.estimatedCost ? current : min
        );
        const fastest = rankings.reduce((min, current) => 
            current.responseTime < min.responseTime ? current : min
        );

        return {
            topChoice: top3[0],
            budgetOption: cheapest,
            fastestResponse: fastest,
            summary: `For your trip from ${tripRequest.from} to ${tripRequest.to}, we recommend ${top3[0].company} (Score: ${top3[0].score}) with an estimated cost of $${top3[0].estimatedCost}.`
        };
    }
}

// Initialize the ranking system
const taxiRanker = new TaxiRankingSystem(cabData, distanceMatrix);

/**
 * Example function to handle a client call
 */
function handleClientCall(from, to, wheelchairRequired = false, specialNeeds = []) {
    const tripRequest = {
        from: from,
        to: to,
        wheelchairRequired: wheelchairRequired,
        specialNeeds: specialNeeds
    };

    try {
        const results = taxiRanker.rankTaxisForTrip(tripRequest);
        
        console.log(`\n=== TAXI RANKING RESULTS ===`);
        console.log(`Trip: ${from} → ${to} (${results.tripDetails.distance} miles)`);
        console.log(`Special Requirements: ${tripRequest.wheelchairRequired ? 'Wheelchair Access' : 'None'}`);
        console.log(`\n--- TOP RECOMMENDATIONS ---`);
        
        results.rankings.slice(0, 5).forEach((ranking, index) => {
            console.log(`${index + 1}. ${ranking.company}`);
            console.log(`   Score: ${ranking.score}/100`);
            console.log(`   Cost: $${ranking.estimatedCost}`);
            console.log(`   Response Time: ${ranking.responseTime} min`);
            console.log(`   Rating: ${ranking.rating}/5`);
            console.log(`   Can Pickup: ${ranking.canPickup ? 'Yes' : 'No'}`);
            console.log(`   Wheelchair: ${ranking.wheelchairAccessible ? 'Yes' : 'No'}`);
            console.log(`   Special Services: ${ranking.specialServices.join(', ') || 'None'}`);
            console.log('');
        });

        console.log(`--- QUICK RECOMMENDATIONS ---`);
        console.log(`Best Overall: ${results.recommendations.topChoice.company} ($${results.recommendations.topChoice.estimatedCost})`);
        console.log(`Most Affordable: ${results.recommendations.budgetOption.company} ($${results.recommendations.budgetOption.estimatedCost})`);
        console.log(`Fastest Response: ${results.recommendations.fastestResponse.company} (${results.recommendations.fastestResponse.responseTime} min)`);

        return results;
    } catch (error) {
        console.error("Error processing trip request:", error.message);
        return null;
    }
}

// Example usage for the scenario you mentioned
console.log("=== EXAMPLE: Client needs ride from City Limits to Main Hospital ===");
handleClientCall("Suburbs", "Hospital", true); // Wheelchair required

console.log("\n=== EXAMPLE: Airport pickup to Downtown ===");
handleClientCall("Airport", "Downtown");

console.log("\n=== EXAMPLE: Downtown to Central Park (luxury service needed) ===");
handleClientCall("Downtown", "Central Park", false, ["luxury"]);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        cabData,
        distanceMatrix,
        TaxiRankingSystem,
        taxiRanker,
        handleClientCall
    };
}
