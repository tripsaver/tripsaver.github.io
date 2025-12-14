import { Injectable } from '@angular/core';
import { BaseEngine, BaseEngineResult } from '../base.engine';

/**
 * DESTINATION SCORING ENGINE
 * 
 * Intelligent scoring and ranking system for destinations based on:
 * - User preferences (categories, travel type)
 * - Timing and seasonality (month of travel)
 * - Budget compatibility
 * - Travel ease requirements
 * - Climate preferences
 */

// ===========================
// INTERFACES & TYPES
// ===========================

export interface UserPreferences {
  categories: string[];           // ["Beach", "Nature"]
  travelType?: string;            // "Couples", "Family", "Solo", "Friends"
  month: number;                  // 1-12
  budget: 'budget' | 'moderate' | 'premium';
  easyTravel?: boolean;           // Prefer easily accessible destinations
  climate?: string;               // Preferred climate type
  duration?: number;              // Trip duration in days
  distance?: 'nearby' | 'moderate' | 'far'; // Travel distance preference
}

export interface DestinationData {
  id?: string;
  name?: string;
  state: string;
  categories: string[];
  bestMonths: number[];
  avoidMonths: number[];
  climate: string;
  budget: 'budget' | 'moderate' | 'premium';
  agoda: string;
  idealFor?: string[];            // ["Couples", "Family", "Solo"]
  travelEase?: 'easy' | 'moderate' | 'difficult';
  crowdLevel?: 'low' | 'moderate' | 'high';
  rating?: number;                // 0-5
  popularityScore?: number;       // Internal metric
}

export interface ScoredDestination extends DestinationData {
  finalScore: number;
  monthScore: number;
  categoryScore: number;
  budgetScore: number;
  scoreBreakdown: ScoreBreakdown;
  reasons: string[];              // Why this destination is recommended
  warnings: string[];             // Potential issues
}

export interface ScoreBreakdown {
  categoryMatch: number;          // 0-40 points
  monthSuitability: number;       // -40 to +30 points
  budgetCompatibility: number;    // 0-20 points
  travelEaseBonus: number;        // 0-10 points
  idealTravelerMatch: number;     // 0-20 points
  climateMatch: number;           // 0-10 points
  crowdPenalty: number;           // -10 to 0 points
  total: number;
}

export interface DestinationScoringInput {
  destinations: Record<string, DestinationData>;
  userPreferences: UserPreferences;
  filters?: {
    minScore?: number;            // Minimum score to include (default: 30)
    maxResults?: number;          // Maximum results to return
    excludeDestinations?: string[]; // IDs to exclude
    sortBy?: 'score' | 'name' | 'budget'; // Sort order
  };
}

export interface DestinationScoringResult extends BaseEngineResult {
  recommendations: ScoredDestination[];
  totalDestinations: number;
  filteredCount: number;
  topPick?: ScoredDestination;
  budgetOptions: {
    budget: ScoredDestination[];
    moderate: ScoredDestination[];
    premium: ScoredDestination[];
  };
  monthInsights: {
    bestDestinations: string[];
    destinationsToAvoid: string[];
    peakSeason: boolean;
  };
  statistics: {
    averageScore: number;
    scoreRange: { min: number; max: number };
    categoryDistribution: Record<string, number>;
  };
}

// ===========================
// SCORING ENGINE
// ===========================

@Injectable({
  providedIn: 'root'
})
export class DestinationScoringEngine extends BaseEngine<DestinationScoringInput, DestinationScoringResult> {
  
  protected config = {
    name: 'DestinationScoringEngine',
    version: '1.0.0',
    enabled: true
  };

  /**
   * Main processing method
   */
  async process(input: DestinationScoringInput): Promise<DestinationScoringResult> {
    this.log('Starting destination scoring', { 
      destinationCount: Object.keys(input.destinations).length,
      userPreferences: input.userPreferences 
    });

    try {
      // Validate input
      this.validateInput(input);

      // Score all destinations
      const scoredDestinations = this.scoreAllDestinations(
        input.destinations, 
        input.userPreferences
      );

      // Apply filters
      const filteredDestinations = this.applyFilters(
        scoredDestinations,
        input.filters
      );

      // Sort destinations
      const sortedDestinations = this.sortDestinations(
        filteredDestinations,
        input.filters?.sortBy || 'score'
      );

      // Group by budget
      const budgetOptions = this.groupByBudget(sortedDestinations);

      // Generate month insights
      const monthInsights = this.generateMonthInsights(
        input.destinations,
        input.userPreferences.month
      );

      // Calculate statistics
      const statistics = this.calculateStatistics(sortedDestinations);

      const result: DestinationScoringResult = {
        engineName: this.config.name,
        timestamp: new Date(),
        success: true,
        metadata: {
          version: this.config.version,
          processingTime: Date.now()
        },
        recommendations: sortedDestinations,
        totalDestinations: Object.keys(input.destinations).length,
        filteredCount: sortedDestinations.length,
        topPick: sortedDestinations[0],
        budgetOptions,
        monthInsights,
        statistics
      };

      this.log('Scoring completed successfully', { 
        recommendationsCount: result.recommendations.length 
      });

      return result;

    } catch (error) {
      this.logError('Scoring failed', error);
      throw error;
    }
  }

  /**
   * Score a single destination based on user preferences
   */
  private scoreDestination(destination: DestinationData, userPref: UserPreferences): ScoredDestination {
    const breakdown: ScoreBreakdown = {
      categoryMatch: 0,
      monthSuitability: 0,
      budgetCompatibility: 0,
      travelEaseBonus: 0,
      idealTravelerMatch: 0,
      climateMatch: 0,
      crowdPenalty: 0,
      total: 0
    };

    const reasons: string[] = [];
    const warnings: string[] = [];

    // 1️⃣ Category Match (0-40 points) - Strong signal
    const categoryMatches = destination.categories.filter(cat =>
      userPref.categories.includes(cat)
    );
    breakdown.categoryMatch = Math.min(categoryMatches.length * 15, 40);
    
    if (categoryMatches.length > 0) {
      reasons.push(`Perfect for ${categoryMatches.join(', ')} lovers`);
    }

    // 2️⃣ Ideal Traveler Match (0-20 points)
    if (userPref.travelType && destination.idealFor?.includes(userPref.travelType)) {
      breakdown.idealTravelerMatch = 20;
      reasons.push(`Ideal for ${userPref.travelType}`);
    }

    // 3️⃣ Month Suitability (-40 to +30 points) - Critical factor
    if (destination.bestMonths.includes(userPref.month)) {
      breakdown.monthSuitability = 30;
      reasons.push(`Best time to visit in ${this.getMonthName(userPref.month)}`);
    } else if (destination.avoidMonths.includes(userPref.month)) {
      breakdown.monthSuitability = -40;
      warnings.push(`Not recommended in ${this.getMonthName(userPref.month)} - ${this.getAvoidReason(destination, userPref.month)}`);
    } else {
      breakdown.monthSuitability = 10; // Neutral month
      reasons.push(`Acceptable time to visit`);
    }

    // 4️⃣ Budget Compatibility (0-20 points)
    const budgetMap = { budget: 1, moderate: 2, premium: 3 };
    const budgetDiff = Math.abs(
      budgetMap[destination.budget] - budgetMap[userPref.budget]
    );
    breakdown.budgetCompatibility = Math.max(0, 20 - budgetDiff * 10);
    
    if (budgetDiff === 0) {
      reasons.push(`Matches your ${userPref.budget} budget`);
    } else if (budgetDiff === 1) {
      reasons.push(`Slightly ${destination.budget === 'premium' ? 'above' : 'below'} your budget`);
    }

    // 5️⃣ Travel Ease Bonus (0-10 points)
    if (userPref.easyTravel && destination.travelEase === 'easy') {
      breakdown.travelEaseBonus = 10;
      reasons.push(`Easy to reach and navigate`);
    } else if (userPref.easyTravel && destination.travelEase === 'difficult') {
      warnings.push(`Requires careful planning and travel preparation`);
    }

    // 6️⃣ Climate Match (0-10 points)
    if (userPref.climate && destination.climate === userPref.climate) {
      breakdown.climateMatch = 10;
      reasons.push(`${destination.climate} climate as preferred`);
    }

    // 7️⃣ Crowd Penalty (-10 to 0 points)
    if (destination.crowdLevel === 'high' && 
        destination.bestMonths.includes(userPref.month)) {
      breakdown.crowdPenalty = -10;
      warnings.push(`Peak season - expect crowds`);
    }

    // Calculate total score
    breakdown.total = 
      breakdown.categoryMatch +
      breakdown.monthSuitability +
      breakdown.budgetCompatibility +
      breakdown.travelEaseBonus +
      breakdown.idealTravelerMatch +
      breakdown.climateMatch +
      breakdown.crowdPenalty;

    return {
      ...destination,
      finalScore: breakdown.total,
      monthScore: breakdown.monthSuitability,
      categoryScore: breakdown.categoryMatch,
      budgetScore: breakdown.budgetCompatibility,
      scoreBreakdown: breakdown,
      reasons,
      warnings
    };
  }

  /**
   * Score all destinations
   */
  private scoreAllDestinations(
    destinations: Record<string, DestinationData>,
    userPref: UserPreferences
  ): ScoredDestination[] {
    return Object.entries(destinations).map(([id, dest]) => {
      const scored = this.scoreDestination(dest, userPref);
      return {
        ...scored,
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1)
      };
    });
  }

  /**
   * Apply filters to destinations
   */
  private applyFilters(
    destinations: ScoredDestination[],
    filters?: DestinationScoringInput['filters']
  ): ScoredDestination[] {
    let filtered = [...destinations];

    // Minimum score filter
    const minScore = filters?.minScore ?? 30;
    filtered = filtered.filter(d => d.finalScore >= minScore);

    // Exclude destinations
    if (filters?.excludeDestinations?.length) {
      filtered = filtered.filter(d => !filters.excludeDestinations!.includes(d.id!));
    }

    // Limit results
    if (filters?.maxResults) {
      filtered = filtered.slice(0, filters.maxResults);
    }

    return filtered;
  }

  /**
   * Sort destinations
   */
  private sortDestinations(
    destinations: ScoredDestination[],
    sortBy: 'score' | 'name' | 'budget'
  ): ScoredDestination[] {
    const sorted = [...destinations];

    switch (sortBy) {
      case 'score':
        return sorted.sort((a, b) => b.finalScore - a.finalScore);
      case 'name':
        return sorted.sort((a, b) => (a.name || a.id || '').localeCompare(b.name || b.id || ''));
      case 'budget':
        const budgetOrder = { budget: 1, moderate: 2, premium: 3 };
        return sorted.sort((a, b) => budgetOrder[a.budget] - budgetOrder[b.budget]);
      default:
        return sorted;
    }
  }

  /**
   * Group destinations by budget
   */
  private groupByBudget(destinations: ScoredDestination[]) {
    return {
      budget: destinations.filter(d => d.budget === 'budget').slice(0, 5),
      moderate: destinations.filter(d => d.budget === 'moderate').slice(0, 5),
      premium: destinations.filter(d => d.budget === 'premium').slice(0, 5)
    };
  }

  /**
   * Generate month-specific insights
   */
  private generateMonthInsights(
    destinations: Record<string, DestinationData>,
    month: number
  ) {
    const bestDestinations: string[] = [];
    const destinationsToAvoid: string[] = [];
    let peakSeasonCount = 0;

    Object.entries(destinations).forEach(([id, dest]) => {
      if (dest.bestMonths.includes(month)) {
        bestDestinations.push(id);
        peakSeasonCount++;
      }
      if (dest.avoidMonths.includes(month)) {
        destinationsToAvoid.push(id);
      }
    });

    return {
      bestDestinations: bestDestinations.slice(0, 10),
      destinationsToAvoid: destinationsToAvoid.slice(0, 10),
      peakSeason: peakSeasonCount > Object.keys(destinations).length * 0.3
    };
  }

  /**
   * Calculate statistics
   */
  private calculateStatistics(destinations: ScoredDestination[]) {
    if (destinations.length === 0) {
      return {
        averageScore: 0,
        scoreRange: { min: 0, max: 0 },
        categoryDistribution: {}
      };
    }

    const scores = destinations.map(d => d.finalScore);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const categoryDistribution: Record<string, number> = {};
    destinations.forEach(dest => {
      dest.categories.forEach(cat => {
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
      });
    });

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      scoreRange: {
        min: Math.min(...scores),
        max: Math.max(...scores)
      },
      categoryDistribution
    };
  }

  /**
   * Validate input
   */
  protected validateInput(input: DestinationScoringInput): boolean {
    if (!input.destinations || Object.keys(input.destinations).length === 0) {
      throw new Error('Destinations data is required');
    }

    if (!input.userPreferences) {
      throw new Error('User preferences are required');
    }

    const { month, categories, budget } = input.userPreferences;

    if (!month || month < 1 || month > 12) {
      throw new Error('Valid month (1-12) is required');
    }
    return true;

    if (!categories || categories.length === 0) {
      throw new Error('At least one category preference is required');
    }

    if (!budget || !['budget', 'moderate', 'premium'].includes(budget)) {
      throw new Error('Valid budget (budget/moderate/premium) is required');
    }
  }

  // ===========================
  // UTILITY METHODS
  // ===========================

  /**
   * Get month name
   */
  private getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  }

  /**
   * Get reason why month should be avoided
   */
  private getAvoidReason(destination: DestinationData, month: number): string {
    // Monsoon months (June-August)
    if ([6, 7, 8].includes(month) && destination.avoidMonths.includes(month)) {
      if (destination.categories.includes('Beach') || 
          destination.categories.includes('Island')) {
        return 'Monsoon season, rough seas';
      }
      if (destination.categories.includes('Mountain') || 
          destination.categories.includes('Hill')) {
        return 'Heavy rainfall, landslide risk';
      }
      return 'Monsoon season';
    }

    // Summer months (May-June)
    if ([5, 6].includes(month) && destination.climate === 'hot') {
      return 'Extreme heat';
    }

    // Winter months (December-February)
    if ([12, 1, 2].includes(month) && destination.climate === 'cold') {
      return 'Extreme cold, possible road closures';
    }

    return 'Unfavorable weather conditions';
  }

  // ===========================
  // PUBLIC HELPER METHODS
  // ===========================

  /**
   * Quick recommendation by month only
   */
  async recommendByMonth(
    destinations: Record<string, DestinationData>,
    month: number
  ): Promise<ScoredDestination[]> {
    const monthOnlyPreferences: UserPreferences = {
      categories: [], // Will match all
      month,
      budget: 'moderate'
    };

    return Object.entries(destinations)
      .map(([id, dest]) => {
        let monthScore = 0;
        if (dest.bestMonths.includes(month)) monthScore = 30;
        if (dest.avoidMonths.includes(month)) monthScore = -50;

        return {
          ...dest,
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          finalScore: monthScore,
          monthScore,
          categoryScore: 0,
          budgetScore: 0,
          scoreBreakdown: {
            categoryMatch: 0,
            monthSuitability: monthScore,
            budgetCompatibility: 0,
            travelEaseBonus: 0,
            idealTravelerMatch: 0,
            climateMatch: 0,
            crowdPenalty: 0,
            total: monthScore
          },
          reasons: monthScore > 0 ? [`Best time to visit in ${this.getMonthName(month)}`] : [],
          warnings: monthScore < 0 ? [`Avoid in ${this.getMonthName(month)}`] : []
        };
      })
      .filter(d => d.monthScore > 0)
      .sort((a, b) => b.monthScore - a.monthScore);
  }

  /**
   * Get budget-friendly options
   */
  getBudgetOptions(destinations: ScoredDestination[]): ScoredDestination[] {
    return destinations
      .filter(d => d.budget === 'budget')
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  /**
   * Get premium luxury options
   */
  getPremiumOptions(destinations: ScoredDestination[]): ScoredDestination[] {
    return destinations
      .filter(d => d.budget === 'premium')
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  /**
   * Compare two destinations
   */
  compareDestinations(dest1: ScoredDestination, dest2: ScoredDestination): {
    winner: ScoredDestination;
    comparison: {
      scoreGap: number;
      betterCategories: string[];
      summary: string;
    };
  } {
    const winner = dest1.finalScore >= dest2.finalScore ? dest1 : dest2;
    const loser = winner === dest1 ? dest2 : dest1;
    
    const betterCategories: string[] = [];
    if (winner.categoryScore > loser.categoryScore) betterCategories.push('Category Match');
    if (winner.monthScore > loser.monthScore) betterCategories.push('Timing');
    if (winner.budgetScore > loser.budgetScore) betterCategories.push('Budget');

    return {
      winner,
      comparison: {
        scoreGap: Math.abs(dest1.finalScore - dest2.finalScore),
        betterCategories,
        summary: `${winner.name} scores ${winner.finalScore} vs ${loser.name}'s ${loser.finalScore}`
      }
    };
  }
}
