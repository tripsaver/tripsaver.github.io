/**
 * DESTINATION SCORING ENGINE
 * ==========================
 * 
 * Comprehensive scoring engine for destinations based on multiple factors
 */

import { Injectable, inject } from '@angular/core';
import { BaseEngine, BaseEngineConfig, BaseEngineResult } from '../base.engine';
import { Destination, DESTINATIONS_DATA } from '../destination/destinations.data';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { firstValueFrom } from 'rxjs';

export interface UserPreferences {
  categories: string[];
  month: number;
  budget: 'budget' | 'moderate' | 'premium';
  climate?: string[];
}

export interface ScoredDestination {
  destinationId: string;
  destination: Destination;
  score: number;
  reasons: string[];
  badges: string[];
}

export interface DestinationScoringInput {
  userPreferences: UserPreferences;
}

export interface DestinationScoringResult extends BaseEngineResult {
  recommendations: ScoredDestination[];
  totalDestinationsScored: number;
}

@Injectable()
export class DestinationScoringEngine extends BaseEngine<DestinationScoringInput, DestinationScoringResult> {
  private mongoService = inject(MongoDBService);
  
  protected config: BaseEngineConfig = {
    name: 'DestinationScoringEngine',
    version: '2.0.0',
    enabled: true
  };

  async process(input: DestinationScoringInput): Promise<DestinationScoringResult> {
    this.log('Starting destination scoring with enhanced algorithm');

    if (!this.validateInput(input)) {
      throw new Error('Invalid input');
    }

    // Fetch destinations from MongoDB
    let destinations = await firstValueFrom(this.mongoService.getAllDestinations());
    
    console.log(`📊 Destinations fetched from MongoDB: ${destinations.length}`);
    
    // If MongoDB returns empty, use static fallback data
    if (destinations.length === 0) {
      console.warn('⚠️ MongoDB empty or unreachable');
      console.log('✅ Using static destination data fallback');
      destinations = Object.values(DESTINATIONS_DATA) as Destination[];
      console.log(`📊 Loaded ${destinations.length} destinations from static data`);
    }

    const scored: ScoredDestination[] = [];
    
    for (const destination of destinations) {
      const { score, reasons, badges } = this.scoreDestination(destination, input.userPreferences);
      scored.push({
        destinationId: (destination as any)._id || '',
        destination,
        score,
        reasons,
        badges
      });
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    this.log(`Scored ${scored.length} destinations`);

    return {
      engineName: this.config.name,
      timestamp: new Date(),
      success: true,
      recommendations: scored.slice(0, 10),
      totalDestinationsScored: scored.length
    };
  }

  protected validateInput(input: DestinationScoringInput): boolean {
    return !!input?.userPreferences && 
           typeof input.userPreferences.month === 'number';
  }

  private scoreDestination(
    dest: Destination, 
    prefs: UserPreferences
  ): { score: number; reasons: string[]; badges: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const badges: string[] = [];
    
    // 1. Perfect Timing (40 points max)
    if (dest.bestMonths.includes(prefs.month)) {
      score += 40;
      reasons.push('✓ Perfect time to visit');
      badges.push('Perfect Season');
    } else if (dest.avoidMonths.includes(prefs.month)) {
      score -= 30;
      reasons.push('⚠ Not ideal season');
    } else {
      score += 10;
      reasons.push('○ Acceptable season');
    }
    
    // 2. Budget Match (30 points max)
    if (dest.budget === prefs.budget) {
      score += 30;
      reasons.push('✓ Matches your budget');
      badges.push('Budget Match');
    } else {
      const budgetOrder = ['budget', 'moderate', 'premium'];
      const destIndex = budgetOrder.indexOf(dest.budget);
      const prefIndex = budgetOrder.indexOf(prefs.budget);
      const diff = Math.abs(destIndex - prefIndex);
      
      if (diff === 1) {
        score += 15;
        reasons.push('○ Close to your budget');
      } else {
        score += 5;
        reasons.push('⚠ Different budget range');
      }
    }
    
    // 3. Category Match (25 points max)
    if (prefs.categories && prefs.categories.length > 0) {
      const matchingCategories = dest.categories.filter(cat => 
        prefs.categories.includes(cat)
      );
      
      if (matchingCategories.length > 0) {
        const categoryScore = Math.min(25, matchingCategories.length * 12);
        score += categoryScore;
        reasons.push(`✓ ${matchingCategories.length} matching interest${matchingCategories.length > 1 ? 's' : ''}`);
        
        if (matchingCategories.length >= 2) {
          badges.push('Perfect Match');
        }
      }
    }
    
    // 4. Climate Preference (15 points max)
    if (prefs.climate && prefs.climate.length > 0) {
      if (prefs.climate.includes(dest.climate)) {
        score += 15;
        reasons.push('✓ Ideal climate for you');
        badges.push('Great Weather');
      }
    }
    
    // 5. Bonus Points for Special Cases
    // Popular destinations bonus
    const popularDestinations = ['goa', 'manali', 'jaipur', 'kerala', 'leh', 'andaman'];
    const destId = (dest as any)._id || '';
    if (popularDestinations.includes(destId)) {
      score += 5;
      badges.push('Popular Choice');
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));
    
    return { score, reasons, badges };
  }
}

