import { Injectable } from '@angular/core';
import { BaseEngine, BaseEngineResult } from '../base.engine';

/**
 * TRIP READINESS SCORING ENGINE
 * ==============================
 * 
 * Intelligent scoring system to determine how "ready" a destination is
 * for a specific travel date based on:
 * 
 * 1. Weather Readiness (28-30 points) - Historical climate data
 * 2. Crowd Level (14-20 points) - Rule-based crowd prediction
 * 3. Cost Comfort (16-20 points) - Relative budget positioning
 * 4. Experience Match (20-20 points) - Category alignment
 * 5. Travel Ease (10-10 points) - Accessibility factors
 * 
 * Total Score: 0-100
 * 
 * DATA SOURCES (All Legal & Static):
 * - Government tourism sites (Incredible India, State Tourism)
 * - Wikipedia climate tables
 * - Indian school holiday calendars
 * - Festival calendars
 * - Editorial content (our IP)
 */

// ===========================
// INTERFACES & TYPES
// ===========================

export interface TripReadinessInput {
  destinationId: string;
  travelMonth: number;               // 1-12
  travelYear?: number;               // Optional, for holiday detection
  userBudget?: 'budget' | 'moderate' | 'premium';
  userCategories?: string[];         // Preferred experience types
  travelDuration?: number;           // Days
  partySize?: number;                // Number of travelers
}

export interface TripReadinessScore {
  overall: number;                   // 0-100
  weather: number;                   // 0-30
  crowd: number;                     // 0-20
  costComfort: number;               // 0-20
  experienceMatch: number;           // 0-20
  travelEase: number;                // 0-10
}

export interface ReadinessFactors {
  weatherCondition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unfavorable';
  crowdLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  costLevel: 'Budget-Friendly' | 'Moderate' | 'Premium' | 'Luxury';
  experienceCategories: string[];
  accessibilityLevel: 'Easy' | 'Moderate' | 'Challenging';
}

export interface ReadinessInsights {
  verdict: 'Excellent Time' | 'Good Time' | 'Fair Time' | 'Consider Alternatives' | 'Not Recommended';
  bestAspects: string[];             // What's great about this time
  concerns: string[];                // What to be aware of
  tips: string[];                    // Actionable advice
  alternativeMonths?: number[];      // Better months if score is low
}

export interface TripReadinessScoringResult extends BaseEngineResult {
  destinationId: string;
  destinationName: string;
  travelMonth: number;
  score: TripReadinessScore;
  factors: ReadinessFactors;
  insights: ReadinessInsights;
  crowdCalendar: {
    holidays: string[];              // Holidays falling in travel month
    festivals: string[];             // Festivals in destination
    peakSeason: boolean;
  };
  weatherSummary: {
    temperature: string;
    rainfall: string;
    conditions: string;
  };
  bookingRecommendation: {
    urgency: 'Book Now' | 'Book Soon' | 'Monitor Prices' | 'No Rush';
    reason: string;
  };
}

// ===========================
// STATIC DATA STRUCTURES
// ===========================

interface SeasonData {
  bestMonths: number[];
  offSeason: number[];
  monsoon?: number[];
  peak?: number[];
}

interface WeatherData {
  excellent: number[];    // Perfect weather months
  good: number[];        // Pleasant weather
  fair: number[];        // Acceptable
  poor: number[];        // Hot/Cold but manageable
  avoid: number[];       // Extreme weather
}

interface CrowdRules {
  highCrowd: number[];   // Always crowded
  peakSeasons: number[]; // Peak tourist season
  lowCrowd: number[];    // Off-season
}

interface ExperienceTags {
  primary: string[];     // Main experiences
  secondary: string[];   // Additional experiences
  idealFor: string[];    // Solo/Couple/Family/Friends
}

// Indian National & School Holidays (Rule-based)
const INDIAN_HOLIDAYS = {
  schoolHolidays: [
    { months: [4, 5, 6], name: 'Summer Vacation' },      // April-June
    { months: [10], name: 'Diwali Break' },              // October
    { months: [12], name: 'Winter Vacation' }            // December
  ],
  longWeekends: [1, 8, 10, 11],  // Jan (Republic), Aug (Independence), Oct (Diwali), Nov (varied)
  festivals: {
    1: ['New Year', 'Makar Sankranti'],
    3: ['Holi'],
    4: ['Ram Navami'],
    8: ['Independence Day', 'Janmashtami'],
    9: ['Ganesh Chaturthi'],
    10: ['Dussehra', 'Diwali'],
    11: ['Diwali (sometimes)'],
    12: ['Christmas', 'New Year Eve']
  }
};

// ===========================
// DESTINATION DATA REGISTRY
// ===========================

const DESTINATION_READINESS_DATA: Record<string, {
  season: SeasonData;
  weather: WeatherData;
  crowd: CrowdRules;
  experience: ExperienceTags;
  accessibility: 'Easy' | 'Moderate' | 'Challenging';
  costLevel: 'budget' | 'moderate' | 'premium';
}> = {
  goa: {
    season: {
      bestMonths: [11, 12, 1, 2],
      offSeason: [6, 7, 8],
      monsoon: [6, 7, 8, 9],
      peak: [12, 1]
    },
    weather: {
      excellent: [12, 1, 2],
      good: [11, 3],
      fair: [10, 4],
      poor: [5],
      avoid: [6, 7, 8, 9]
    },
    crowd: {
      highCrowd: [12, 1],
      peakSeasons: [11, 12, 1, 2],
      lowCrowd: [6, 7, 8, 9]
    },
    experience: {
      primary: ['Beach', 'Party', 'Nightlife'],
      secondary: ['Water Sports', 'Portuguese Heritage', 'Seafood'],
      idealFor: ['Couples', 'Friends', 'Solo']
    },
    accessibility: 'Easy',
    costLevel: 'moderate'
  },
  manali: {
    season: {
      bestMonths: [3, 4, 5, 10],
      offSeason: [7, 8],
      monsoon: [7, 8],
      peak: [5, 6, 12]
    },
    weather: {
      excellent: [4, 5, 10],
      good: [3, 6, 9],
      fair: [11],
      poor: [7, 8],
      avoid: [1, 2, 12]
    },
    crowd: {
      highCrowd: [5, 6, 12],
      peakSeasons: [4, 5, 6, 10, 12],
      lowCrowd: [1, 2, 7, 8, 11]
    },
    experience: {
      primary: ['Mountain', 'Adventure', 'Snow'],
      secondary: ['Trekking', 'Skiing', 'Himalayas'],
      idealFor: ['Couples', 'Friends', 'Adventure Seekers']
    },
    accessibility: 'Moderate',
    costLevel: 'budget'
  },
  jaipur: {
    season: {
      bestMonths: [10, 11, 12, 1, 2, 3],
      offSeason: [5, 6, 7],
      monsoon: [7, 8],
      peak: [10, 11, 12]
    },
    weather: {
      excellent: [11, 12, 1, 2],
      good: [10, 3],
      fair: [9, 4],
      poor: [8],
      avoid: [5, 6, 7]
    },
    crowd: {
      highCrowd: [10, 11, 12],
      peakSeasons: [10, 11, 12, 1, 2],
      lowCrowd: [5, 6, 7, 8]
    },
    experience: {
      primary: ['Heritage', 'Royal Palaces', 'Culture'],
      secondary: ['Forts', 'Shopping', 'Rajasthani Cuisine'],
      idealFor: ['Family', 'Couples', 'Culture Lovers']
    },
    accessibility: 'Easy',
    costLevel: 'budget'
  },
  udaipur: {
    season: {
      bestMonths: [10, 11, 12, 1, 2, 3],
      offSeason: [5, 6, 7],
      monsoon: [7, 8, 9],
      peak: [10, 11, 12]
    },
    weather: {
      excellent: [11, 12, 1, 2],
      good: [10, 3],
      fair: [9, 4],
      poor: [8],
      avoid: [5, 6, 7]
    },
    crowd: {
      highCrowd: [12, 1],
      peakSeasons: [10, 11, 12, 1, 2],
      lowCrowd: [5, 6, 7, 8]
    },
    experience: {
      primary: ['Romantic', 'Lakes', 'Royal Heritage'],
      secondary: ['Palaces', 'Boat Rides', 'Sunset Views'],
      idealFor: ['Couples', 'Honeymooners']
    },
    accessibility: 'Easy',
    costLevel: 'moderate'
  },
  varanasi: {
    season: {
      bestMonths: [10, 11, 12, 1, 2, 3],
      offSeason: [5, 6, 7],
      monsoon: [7, 8],
      peak: [11, 12, 1]
    },
    weather: {
      excellent: [11, 12, 1, 2],
      good: [10, 3],
      fair: [9, 4],
      poor: [8],
      avoid: [5, 6, 7]
    },
    crowd: {
      highCrowd: [11, 12, 1, 3],
      peakSeasons: [10, 11, 12, 1, 2],
      lowCrowd: [5, 6, 7, 8]
    },
    experience: {
      primary: ['Spiritual', 'Temples', 'Ganges'],
      secondary: ['Rituals', 'Ancient City', 'Philosophy'],
      idealFor: ['Solo', 'Spiritual Seekers', 'Culture Lovers']
    },
    accessibility: 'Moderate',
    costLevel: 'budget'
  },
  leh: {
    season: {
      bestMonths: [6, 7, 8, 9],
      offSeason: [11, 12, 1, 2, 3, 4],
      monsoon: [],
      peak: [7, 8]
    },
    weather: {
      excellent: [7, 8],
      good: [6, 9],
      fair: [5, 10],
      poor: [4, 11],
      avoid: [12, 1, 2, 3]
    },
    crowd: {
      highCrowd: [7, 8],
      peakSeasons: [6, 7, 8, 9],
      lowCrowd: [1, 2, 3, 4, 11, 12]
    },
    experience: {
      primary: ['Adventure', 'High Altitude', 'Buddhism'],
      secondary: ['Monasteries', 'Trekking', 'Landscapes'],
      idealFor: ['Adventure Seekers', 'Bikers', 'Solo']
    },
    accessibility: 'Challenging',
    costLevel: 'premium'
  },
  munnar: {
    season: {
      bestMonths: [9, 10, 11, 12, 1, 2, 3],
      offSeason: [6, 7],
      monsoon: [6, 7, 8],
      peak: [12, 1]
    },
    weather: {
      excellent: [12, 1, 2],
      good: [10, 11, 3],
      fair: [9, 4],
      poor: [5, 8],
      avoid: [6, 7]
    },
    crowd: {
      highCrowd: [12, 1, 4, 5],
      peakSeasons: [10, 11, 12, 1, 2],
      lowCrowd: [6, 7, 8]
    },
    experience: {
      primary: ['Hill Station', 'Tea Gardens', 'Nature'],
      secondary: ['Cool Climate', 'Trekking', 'Wildlife'],
      idealFor: ['Couples', 'Family', 'Nature Lovers']
    },
    accessibility: 'Moderate',
    costLevel: 'moderate'
  },
  andaman: {
    season: {
      bestMonths: [11, 12, 1, 2, 3, 4],
      offSeason: [6, 7, 8],
      monsoon: [6, 7, 8, 9],
      peak: [12, 1]
    },
    weather: {
      excellent: [12, 1, 2, 3],
      good: [11, 4],
      fair: [10, 5],
      poor: [9],
      avoid: [6, 7, 8]
    },
    crowd: {
      highCrowd: [12, 1],
      peakSeasons: [11, 12, 1, 2, 3],
      lowCrowd: [6, 7, 8, 9]
    },
    experience: {
      primary: ['Island', 'Beach', 'Scuba Diving'],
      secondary: ['Snorkeling', 'Water Sports', 'Pristine Nature'],
      idealFor: ['Honeymooners', 'Couples', 'Adventure Seekers']
    },
    accessibility: 'Moderate',
    costLevel: 'premium'
  }
};

// ===========================
// SCORING ENGINE
// ===========================

@Injectable({
  providedIn: 'root'
})
export class TripReadinessScoringEngine extends BaseEngine<TripReadinessInput, TripReadinessScoringResult> {
  
  protected config = {
    name: 'TripReadinessScoringEngine',
    version: '1.0.0',
    enabled: true
  };

  /**
   * Main processing method
   */
  async process(input: TripReadinessInput): Promise<TripReadinessScoringResult> {
    this.log('Starting trip readiness scoring', { input });

    try {
      this.validateInput(input);

      const destData = DESTINATION_READINESS_DATA[input.destinationId.toLowerCase()];
      if (!destData) {
        throw new Error(`No readiness data available for destination: ${input.destinationId}`);
      }

      // Calculate individual scores
      const weatherScore = this.calculateWeatherScore(destData, input.travelMonth);
      const crowdScore = this.calculateCrowdScore(destData, input.travelMonth, input.travelYear);
      const costScore = this.calculateCostComfortScore(destData, input.userBudget);
      const experienceScore = this.calculateExperienceScore(destData, input.userCategories);
      const easeScore = this.calculateTravelEaseScore(destData);

      const score: TripReadinessScore = {
        overall: Math.round(weatherScore + crowdScore + costScore + experienceScore + easeScore),
        weather: Math.round(weatherScore),
        crowd: Math.round(crowdScore),
        costComfort: Math.round(costScore),
        experienceMatch: Math.round(experienceScore),
        travelEase: Math.round(easeScore)
      };

      // Generate factors
      const factors = this.generateFactors(destData, input.travelMonth, input.userBudget);

      // Generate insights
      const insights = this.generateInsights(score, destData, input.travelMonth);

      // Crowd calendar
      const crowdCalendar = this.generateCrowdCalendar(input.travelMonth, input.travelYear);

      // Weather summary
      const weatherSummary = this.generateWeatherSummary(destData, input.travelMonth);

      // Booking recommendation
      const bookingRecommendation = this.generateBookingRecommendation(score, destData, input.travelMonth);

      const result: TripReadinessScoringResult = {
        engineName: this.config.name,
        timestamp: new Date(),
        success: true,
        metadata: { version: this.config.version },
        destinationId: input.destinationId,
        destinationName: this.getDestinationName(input.destinationId),
        travelMonth: input.travelMonth,
        score,
        factors,
        insights,
        crowdCalendar,
        weatherSummary,
        bookingRecommendation
      };

      this.log('Scoring completed', { overall: score.overall });
      return result;

    } catch (error) {
      this.logError('Scoring failed', error);
      throw error;
    }
  }

  // ===========================
  // SCORING CALCULATIONS
  // ===========================

  /**
   * Calculate Weather Score (0-30 points)
   */
  private calculateWeatherScore(destData: any, month: number): number {
    if (destData.weather.excellent.includes(month)) return 30;
    if (destData.weather.good.includes(month)) return 25;
    if (destData.weather.fair.includes(month)) return 18;
    if (destData.weather.poor.includes(month)) return 10;
    if (destData.weather.avoid.includes(month)) return 3;
    return 15; // Default
  }

  /**
   * Calculate Crowd Score (0-20 points)
   * Lower crowd = Higher score
   */
  private calculateCrowdScore(destData: any, month: number, year?: number): number {
    let baseScore = 20;

    // High crowd months
    if (destData.crowd.highCrowd.includes(month)) {
      baseScore -= 6;
    }

    // Peak season
    if (destData.crowd.peakSeasons.includes(month)) {
      baseScore -= 3;
    }

    // School holidays bonus for low crowd
    const isSchoolHoliday = INDIAN_HOLIDAYS.schoolHolidays.some(h => h.months.includes(month));
    if (isSchoolHoliday && !destData.crowd.lowCrowd.includes(month)) {
      baseScore -= 3;
    }

    // Low crowd bonus
    if (destData.crowd.lowCrowd.includes(month)) {
      baseScore += 0; // Already at max or keep current
    }

    return Math.max(14, Math.min(20, baseScore));
  }

  /**
   * Calculate Cost Comfort Score (0-20 points)
   */
  private calculateCostComfortScore(destData: any, userBudget?: string): number {
    if (!userBudget) return 16; // Default neutral score

    const budgetMap: Record<string, number> = {
      budget: 1,
      moderate: 2,
      premium: 3
    };

    const destBudgetLevel = budgetMap[destData.costLevel];
    const userBudgetLevel = budgetMap[userBudget];

    const diff = Math.abs(destBudgetLevel - userBudgetLevel);

    if (diff === 0) return 20;  // Perfect match
    if (diff === 1) return 18;  // Close match
    return 14;                  // Mismatch
  }

  /**
   * Calculate Experience Match Score (0-20 points)
   */
  private calculateExperienceScore(destData: any, userCategories?: string[]): number {
    if (!userCategories || userCategories.length === 0) return 16; // Default

    const allDestCategories = [...destData.experience.primary, ...destData.experience.secondary];
    
    const matches = userCategories.filter(cat => 
      allDestCategories.some(destCat => 
        destCat.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(destCat.toLowerCase())
      )
    ).length;

    if (matches >= 2) return 20;
    if (matches === 1) return 16;
    return 12;
  }

  /**
   * Calculate Travel Ease Score (0-10 points)
   */
  private calculateTravelEaseScore(destData: any): number {
    switch (destData.accessibility) {
      case 'Easy': return 10;
      case 'Moderate': return 7;
      case 'Challenging': return 4;
      default: return 7;
    }
  }

  // ===========================
  // FACTOR GENERATION
  // ===========================

  private generateFactors(destData: any, month: number, userBudget?: string): ReadinessFactors {
    // Weather condition
    let weatherCondition: ReadinessFactors['weatherCondition'];
    if (destData.weather.excellent.includes(month)) weatherCondition = 'Excellent';
    else if (destData.weather.good.includes(month)) weatherCondition = 'Good';
    else if (destData.weather.fair.includes(month)) weatherCondition = 'Fair';
    else if (destData.weather.poor.includes(month)) weatherCondition = 'Poor';
    else weatherCondition = 'Unfavorable';

    // Crowd level
    let crowdLevel: ReadinessFactors['crowdLevel'];
    if (destData.crowd.highCrowd.includes(month)) crowdLevel = 'Very High';
    else if (destData.crowd.peakSeasons.includes(month)) crowdLevel = 'High';
    else if (destData.crowd.lowCrowd.includes(month)) crowdLevel = 'Low';
    else crowdLevel = 'Moderate';

    // Cost level
    const costLevelMap: Record<string, ReadinessFactors['costLevel']> = {
      budget: 'Budget-Friendly',
      moderate: 'Moderate',
      premium: 'Premium'
    };
    const costLevel = costLevelMap[destData.costLevel] || 'Moderate';

    return {
      weatherCondition,
      crowdLevel,
      costLevel,
      experienceCategories: [...destData.experience.primary, ...destData.experience.secondary],
      accessibilityLevel: destData.accessibility
    };
  }

  // ===========================
  // INSIGHTS GENERATION
  // ===========================

  private generateInsights(score: TripReadinessScore, destData: any, month: number): ReadinessInsights {
    const overall = score.overall;
    
    let verdict: ReadinessInsights['verdict'];
    if (overall >= 85) verdict = 'Excellent Time';
    else if (overall >= 70) verdict = 'Good Time';
    else if (overall >= 55) verdict = 'Fair Time';
    else if (overall >= 40) verdict = 'Consider Alternatives';
    else verdict = 'Not Recommended';

    const bestAspects: string[] = [];
    const concerns: string[] = [];
    const tips: string[] = [];

    // Weather insights
    if (score.weather >= 25) {
      bestAspects.push('Perfect weather conditions');
    } else if (score.weather < 15) {
      concerns.push('Unfavorable weather conditions');
      tips.push('Pack appropriate clothing and rain gear');
    }

    // Crowd insights
    if (score.crowd >= 18) {
      bestAspects.push('Lower tourist crowds');
      tips.push('Enjoy peaceful exploration and better deals');
    } else if (score.crowd < 16) {
      concerns.push('High tourist crowds expected');
      tips.push('Book accommodations and activities in advance');
    }

    // Cost insights
    if (score.costComfort >= 18) {
      bestAspects.push('Matches your budget preferences');
    }

    // Experience insights
    if (score.experienceMatch >= 18) {
      bestAspects.push('Perfect for your interests');
    }

    // Accessibility insights
    if (score.travelEase >= 9) {
      bestAspects.push('Easy to reach and navigate');
    } else if (score.travelEase < 7) {
      concerns.push('Requires careful travel planning');
      tips.push('Allow extra time for travel and acclimatization');
    }

    // Alternative months
    let alternativeMonths: number[] | undefined;
    if (overall < 60) {
      alternativeMonths = destData.season.bestMonths.filter((m: number) => m !== month);
    }

    return {
      verdict,
      bestAspects,
      concerns,
      tips: tips.length > 0 ? tips : ['Check latest travel advisories', 'Book in advance for better rates'],
      alternativeMonths
    };
  }

  // ===========================
  // HELPER METHODS
  // ===========================

  private generateCrowdCalendar(month: number, year?: number) {
    const holidays = INDIAN_HOLIDAYS.schoolHolidays
      .filter(h => h.months.includes(month))
      .map(h => h.name);

    const festivals = INDIAN_HOLIDAYS.festivals[month] || [];

    const peakSeason = [12, 1, 4, 5, 10].includes(month);

    return { holidays, festivals, peakSeason };
  }

  private generateWeatherSummary(destData: any, month: number) {
    let temperature = '';
    let rainfall = '';
    let conditions = '';

    if (destData.weather.excellent.includes(month)) {
      temperature = 'Pleasant (15-30°C)';
      rainfall = 'Minimal';
      conditions = 'Sunny and clear';
    } else if (destData.weather.good.includes(month)) {
      temperature = 'Comfortable (18-32°C)';
      rainfall = 'Low';
      conditions = 'Mostly pleasant';
    } else if (destData.weather.fair.includes(month)) {
      temperature = 'Moderate (20-35°C)';
      rainfall = 'Occasional';
      conditions = 'Variable';
    } else if (destData.weather.poor.includes(month)) {
      temperature = 'Extreme (10-40°C)';
      rainfall = 'Moderate';
      conditions = 'Challenging';
    } else {
      temperature = 'Very Extreme (<5°C or >40°C)';
      rainfall = 'Heavy';
      conditions = 'Monsoon/Winter';
    }

    return { temperature, rainfall, conditions };
  }

  private generateBookingRecommendation(score: TripReadinessScore, destData: any, month: number) {
    const overall = score.overall;
    const isPeakSeason = destData.crowd.peakSeasons.includes(month);

    let urgency: 'Book Now' | 'Book Soon' | 'Monitor Prices' | 'No Rush';
    let reason: string;

    if (overall >= 85 && isPeakSeason) {
      urgency = 'Book Now';
      reason = 'Excellent time with high demand - prices will increase';
    } else if (overall >= 70 && isPeakSeason) {
      urgency = 'Book Soon';
      reason = 'Good time during peak season - book within 2-3 weeks';
    } else if (overall >= 70) {
      urgency = 'Monitor Prices';
      reason = 'Good time with moderate demand - watch for deals';
    } else if (overall >= 55) {
      urgency = 'No Rush';
      reason = 'Fair time with lower demand - flexible booking';
    } else {
      urgency = 'No Rush';
      reason = 'Consider alternative months for better experience';
    }

    return { urgency, reason };
  }

  private getDestinationName(id: string): string {
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  /**
   * Validate input
   */
  protected validateInput(input: TripReadinessInput): boolean {
    if (!input.destinationId) {
      throw new Error('Destination ID is required');
    }

    if (!input.travelMonth || input.travelMonth < 1 || input.travelMonth > 12) {
      throw new Error('Valid travel month (1-12) is required');
    }
    return true;
  }

  // ===========================
  // PUBLIC HELPER METHODS
  // ===========================

  /**
   * Get best months for a destination
   */
  getBestMonths(destinationId: string): number[] {
    const destData = DESTINATION_READINESS_DATA[destinationId.toLowerCase()];
    return destData?.season.bestMonths || [];
  }

  /**
   * Get months to avoid for a destination
   */
  getAvoidMonths(destinationId: string): number[] {
    const destData = DESTINATION_READINESS_DATA[destinationId.toLowerCase()];
    return destData?.season.offSeason || [];
  }

  /**
   * Check if destination has data
   */
  hasDestinationData(destinationId: string): boolean {
    return !!DESTINATION_READINESS_DATA[destinationId.toLowerCase()];
  }

  /**
   * Get all supported destinations
   */
  getSupportedDestinations(): string[] {
    return Object.keys(DESTINATION_READINESS_DATA);
  }
}
