/**
 * DESTINATION DATA ENGINE
 * =======================
 * 
 * Intelligent destination recommendation and information system.
 * Provides seasonal advice, budget info, and smart filtering.
 * 
 * Features:
 * - Best time to visit recommendations
 * - Climate-based filtering
 * - Budget classification
 * - Category-based search
 * - Crowd pattern prediction
 * - Agoda integration links
 */

import { Injectable } from '@angular/core';
import { BaseEngine, BaseEngineConfig, BaseEngineResult } from '../base.engine';
import { DESTINATIONS_DATA, Destination, DestinationCategory, ClimateType, BudgetType } from './destinations.data';

/**
 * Input for Destination Engine
 */
export interface DestinationQuery {
  // Filters
  categories?: DestinationCategory[];
  budgetRange?: BudgetType[];
  climate?: ClimateType[];
  states?: string[];
  
  // Travel dates
  travelMonth?: number; // 1-12
  avoidCrowds?: boolean;
  
  // Search
  searchTerm?: string;
  
  // Sorting
  sortBy?: 'alphabetical' | 'budget' | 'popularity';
  limit?: number;
}

/**
 * Destination Recommendation
 */
export interface DestinationRecommendation {
  destination: Destination;
  destinationKey: string;
  score: number;
  reasons: string[];
  warnings: string[];
  agodaUrl: string;
  seasonalAdvice: {
    isBestTime: boolean;
    shouldAvoid: boolean;
    alternativeMonths: number[];
    crowdLevel: 'low' | 'moderate' | 'high';
  };
}

/**
 * Destination Engine Result
 */
export interface DestinationEngineResult extends BaseEngineResult {
  query: DestinationQuery;
  recommendations: DestinationRecommendation[];
  totalFound: number;
  filters: {
    categories: DestinationCategory[];
    budgets: BudgetType[];
    climates: ClimateType[];
    states: string[];
  };
}

/**
 * Destination Engine Implementation
 */
@Injectable({
  providedIn: 'root'
})
export class DestinationEngine extends BaseEngine<DestinationQuery, DestinationEngineResult> {
  
  protected config: BaseEngineConfig = {
    name: 'Destination Engine',
    version: '1.0.0',
    enabled: true
  };

  private readonly AGODA_BASE_URL = 'https://www.agoda.com/search';
  private readonly AFFILIATE_ID = '1955073';

  /**
   * Process destination query
   */
  process(input: DestinationQuery): DestinationEngineResult {
    this.log('Processing destination query', input);

    if (!this.validateInput(input)) {
      return this.createErrorResult(input);
    }

    // Get all destinations
    let destinations = this.getAllDestinations();

    // Apply filters
    destinations = this.applyFilters(destinations, input);

    // Generate recommendations with scoring
    const recommendations = destinations.map(({ key, destination }) => 
      this.createRecommendation(key, destination, input)
    );

    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);

    // Apply limit
    const limited = input.limit 
      ? recommendations.slice(0, input.limit)
      : recommendations;

    return {
      engineName: this.config.name,
      timestamp: new Date(),
      success: true,
      query: input,
      recommendations: limited,
      totalFound: recommendations.length,
      filters: this.getAvailableFilters()
    };
  }

  /**
   * Validate input
   */
  protected validateInput(input: DestinationQuery): boolean {
    // Empty query is valid (returns all)
    return true;
  }

  /**
   * Get all destinations as array
   */
  private getAllDestinations(): { key: string; destination: Destination }[] {
    return Object.entries(DESTINATIONS_DATA).map(([key, destination]) => ({
      key,
      destination
    }));
  }

  /**
   * Apply filters to destinations
   */
  private applyFilters(
    destinations: { key: string; destination: Destination }[],
    query: DestinationQuery
  ): { key: string; destination: Destination }[] {
    let filtered = destinations;

    // Category filter
    if (query.categories && query.categories.length > 0) {
      filtered = filtered.filter(({ destination }) =>
        destination.categories.some(cat => query.categories!.includes(cat))
      );
    }

    // Budget filter
    if (query.budgetRange && query.budgetRange.length > 0) {
      filtered = filtered.filter(({ destination }) =>
        query.budgetRange!.includes(destination.budget)
      );
    }

    // Climate filter
    if (query.climate && query.climate.length > 0) {
      filtered = filtered.filter(({ destination }) =>
        query.climate!.includes(destination.climate)
      );
    }

    // State filter
    if (query.states && query.states.length > 0) {
      filtered = filtered.filter(({ destination }) =>
        query.states!.includes(destination.state)
      );
    }

    // Travel month filter (best time)
    if (query.travelMonth) {
      filtered = filtered.filter(({ destination }) =>
        destination.bestMonths.includes(query.travelMonth!)
      );
    }

    // Search term
    if (query.searchTerm) {
      const term = query.searchTerm.toLowerCase();
      filtered = filtered.filter(({ key, destination }) =>
        key.includes(term) ||
        destination.state.toLowerCase().includes(term) ||
        destination.categories.some(cat => cat.toLowerCase().includes(term))
      );
    }

    return filtered;
  }

  /**
   * Create recommendation with scoring
   */
  private createRecommendation(
    key: string,
    destination: Destination,
    query: DestinationQuery
  ): DestinationRecommendation {
    let score = 100; // Base score
    const reasons: string[] = [];
    const warnings: string[] = [];

    // Seasonal scoring
    if (query.travelMonth) {
      const seasonalInfo = this.analyzeSeasonality(destination, query.travelMonth);
      
      if (seasonalInfo.isBestTime) {
        score += 20;
        reasons.push(`Perfect time to visit (${this.getMonthName(query.travelMonth)})`);
      }
      
      if (seasonalInfo.shouldAvoid) {
        score -= 30;
        warnings.push(`Not recommended in ${this.getMonthName(query.travelMonth)} (${this.getAvoidReason(destination, query.travelMonth)})`);
      }
    }

    // Category match scoring
    if (query.categories && query.categories.length > 0) {
      const matches = destination.categories.filter(cat => 
        query.categories!.includes(cat)
      );
      score += matches.length * 10;
      matches.forEach(cat => reasons.push(`Great for ${cat.toLowerCase()}`));
    }

    // Budget match scoring
    if (query.budgetRange && query.budgetRange.includes(destination.budget)) {
      score += 15;
      reasons.push(`${this.getBudgetLabel(destination.budget)} option`);
    }

    // Climate preference
    if (query.climate && query.climate.includes(destination.climate)) {
      score += 10;
      reasons.push(`${this.getClimateLabel(destination.climate)} climate`);
    }

    // Generate Agoda URL
    const agodaUrl = this.buildAgodaUrl(destination.agoda);

    return {
      destination,
      destinationKey: key,
      score,
      reasons,
      warnings,
      agodaUrl,
      seasonalAdvice: this.analyzeSeasonality(destination, query.travelMonth || new Date().getMonth() + 1)
    };
  }

  /**
   * Analyze seasonality
   */
  private analyzeSeasonality(destination: Destination, month: number): {
    isBestTime: boolean;
    shouldAvoid: boolean;
    alternativeMonths: number[];
    crowdLevel: 'low' | 'moderate' | 'high';
  } {
    const isBestTime = destination.bestMonths.includes(month);
    const shouldAvoid = destination.avoidMonths.includes(month);
    
    // Alternative months (best months excluding current)
    const alternativeMonths = destination.bestMonths.filter(m => m !== month);

    // Crowd level estimation
    let crowdLevel: 'low' | 'moderate' | 'high' = 'moderate';
    if (isBestTime) {
      crowdLevel = 'high'; // Best time = more crowds
    } else if (shouldAvoid) {
      crowdLevel = 'low'; // Avoid months = fewer tourists
    }

    return {
      isBestTime,
      shouldAvoid,
      alternativeMonths,
      crowdLevel
    };
  }

  /**
   * Get avoid reason based on climate and month
   */
  private getAvoidReason(destination: Destination, month: number): string {
    // Monsoon months (June-August)
    if ([6, 7, 8].includes(month)) {
      return 'monsoon season';
    }
    
    // Summer months (May-June)
    if ([5, 6].includes(month) && ['hot', 'extreme'].includes(destination.climate)) {
      return 'extreme heat';
    }
    
    // Winter months for cold destinations
    if ([12, 1, 2].includes(month) && destination.climate === 'cold') {
      return 'extreme cold';
    }

    return 'unfavorable weather';
  }

  /**
   * Build Agoda affiliate URL
   */
  private buildAgodaUrl(agodaSlug: string): string {
    return `${this.AGODA_BASE_URL}?cid=${this.AFFILIATE_ID}&city=${agodaSlug}&hl=en-us`;
  }

  /**
   * Get available filters
   */
  private getAvailableFilters() {
    const allDestinations = this.getAllDestinations();
    
    const categories = new Set<DestinationCategory>();
    const budgets = new Set<BudgetType>();
    const climates = new Set<ClimateType>();
    const states = new Set<string>();

    allDestinations.forEach(({ destination }) => {
      destination.categories.forEach(cat => categories.add(cat));
      budgets.add(destination.budget);
      climates.add(destination.climate);
      states.add(destination.state);
    });

    return {
      categories: Array.from(categories),
      budgets: Array.from(budgets),
      climates: Array.from(climates),
      states: Array.from(states).sort()
    };
  }

  /**
   * Helper: Get month name
   */
  private getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  }

  /**
   * Helper: Get budget label
   */
  private getBudgetLabel(budget: BudgetType): string {
    const labels: Record<BudgetType, string> = {
      budget: 'Budget-friendly',
      moderate: 'Moderately priced',
      premium: 'Premium'
    };
    return labels[budget];
  }

  /**
   * Helper: Get climate label
   */
  private getClimateLabel(climate: ClimateType): string {
    const labels: Record<ClimateType, string> = {
      tropical: 'Tropical',
      cold: 'Cold',
      hot: 'Hot',
      moderate: 'Moderate',
      humid: 'Humid',
      cool: 'Cool',
      extreme: 'Extreme',
      cold_desert: 'Cold desert'
    };
    return labels[climate];
  }

  /**
   * Create error result
   */
  private createErrorResult(query: DestinationQuery): DestinationEngineResult {
    return {
      engineName: this.config.name,
      timestamp: new Date(),
      success: false,
      query,
      recommendations: [],
      totalFound: 0,
      filters: {
        categories: [],
        budgets: [],
        climates: [],
        states: []
      }
    };
  }

  /**
   * PUBLIC HELPER METHODS
   */

  /**
   * Get destination by key
   */
  getDestination(key: string): Destination | null {
    return DESTINATIONS_DATA[key] || null;
  }

  /**
   * Get popular destinations (top 10)
   */
  getPopularDestinations(): DestinationRecommendation[] {
    const popular = ['goa', 'manali', 'jaipur', 'udaipur', 'mumbai', 
                     'kochi', 'leh', 'darjeeling', 'andaman', 'shimla'];
    
    const currentMonth = new Date().getMonth() + 1;
    
    return popular
      .map(key => {
        const destination = this.getDestination(key);
        if (!destination) return null;
        return this.createRecommendation(key, destination, { travelMonth: currentMonth });
      })
      .filter(Boolean) as DestinationRecommendation[];
  }

  /**
   * Get destinations by category
   */
  getByCategory(category: DestinationCategory, limit?: number): DestinationRecommendation[] {
    const result = this.process({
      categories: [category],
      limit: limit || 10
    });
    return result.recommendations;
  }

  /**
   * Get beach destinations
   */
  getBeachDestinations(): DestinationRecommendation[] {
    return this.getByCategory('Beach');
  }

  /**
   * Get hill stations
   */
  getHillStations(): DestinationRecommendation[] {
    return this.getByCategory('Hill');
  }

  /**
   * Get best destinations for current month
   */
  getBestForCurrentMonth(limit?: number): DestinationRecommendation[] {
    const currentMonth = new Date().getMonth() + 1;
    const result = this.process({
      travelMonth: currentMonth,
      limit: limit || 10,
      sortBy: 'popularity'
    });
    return result.recommendations;
  }
}
