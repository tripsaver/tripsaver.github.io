/**
 * DESTINATION SCORING ENGINE
 * ==========================
 * 
 * Comprehensive scoring engine for destinations based on multiple factors
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseEngine, BaseEngineConfig, BaseEngineResult } from '../base.engine';
import { Destination } from '../destination/destinations.data';
import { FALLBACK_DESTINATIONS } from '../../data/fallback-destinations';
import { environment } from '../../../../environments/environment';

export interface UserPreferences {
  categories: string[];
  month: number;
  budget: 'budget' | 'moderate' | 'premium';
  climate?: string[];
}

export interface ScoredDestination {
  destinationId: string;
  destination: Destination;
  score: number; // Internal /110 score (hidden from UI)
  displayScore: number; // Display /100 score (shown to users)
  reasons: string[];
  badges: string[];
  interestMatchScore?: number; // ✅ NEW: Explicit interest score
  interestMatchMessage?: string; // ✅ Match type: primary, secondary, weak
}

export interface DestinationScoringInput {
  userPreferences: UserPreferences;
}

export interface DestinationScoringResult extends BaseEngineResult {
  recommendations: ScoredDestination[];
  totalDestinationsScored: number;
}

// ✅ Helper function to normalize month strings to numbers
function normalizeMonth(month: number | string): number {
  if (typeof month === 'number') return month;
  
  const monthMap: Record<string, number> = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12,
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'June': 6, 'July': 7, 'August': 8, 'September': 9,
    'October': 10, 'November': 11, 'December': 12
  };
  
  return monthMap[month] || (typeof month === 'number' ? month : 0);
}

@Injectable()
export class DestinationScoringEngine extends BaseEngine<DestinationScoringInput, DestinationScoringResult> {
  private http = inject(HttpClient);
  
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

    // 🚀 LOAD DATA FROM MONGODB BACKEND
    let destinations: Destination[] = [];
    let usingFallback = false;
    
    try {
      const response = await this.http.get<Destination[]>(
        `${environment.apiBaseUrl}/api/destinations`
      ).toPromise();
      
      if (response && response.length > 0) {
        destinations = response;
        console.log(`✅ [Scoring] Loaded ${destinations.length} destinations from MongoDB backend`);
      } else {
        throw new Error('Empty response from backend - no destinations available');
      }
    } catch (err: any) {
      console.warn('⚠️ [Scoring] MongoDB backend failed:', err.message);
      console.log('⚠️ [Scoring] Using fallback destinations for recommendations');
      this.log(`Failed to load from backend: ${err.message}. Using fallback destinations.`);
      destinations = FALLBACK_DESTINATIONS;
      usingFallback = true;
    }

    const scored: ScoredDestination[] = [];
    
    // � SOFT MATCHING: Score ALL destinations, let scoring determine relevance
    const userCategories = (input.userPreferences.categories || []).map(cat => cat.toLowerCase());
    const hasInterests = (input.userPreferences.categories && input.userPreferences.categories.length > 0);
    
    for (const destination of destinations) {
      const { score, displayScore, reasons, badges, interestMatchScore, interestMatchMessage } = this.scoreDestination(destination, input.userPreferences);
      
      // ✅ SOFT FILTER: 
      // - If user provided interests: only show destinations >= 50 or 'primary' match
      // - If no interests provided: show all destinations (will be sorted by score)
      if (!hasInterests || displayScore >= 50 || interestMatchMessage === 'primary') {
        scored.push({
          destinationId: destination.id,
          destination,
          score,
          displayScore,
          reasons,
          badges,
          interestMatchScore,
          interestMatchMessage
        });
      }
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    this.log(`Scored ${scored.length} destinations (showing top 10)`);

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
  ): { score: number; displayScore: number; reasons: string[]; badges: string[]; interestMatchScore: number; interestMatchMessage: string } {
    let score = 0; // Base /100 scale
    let interestMatchScore = 0;
    let interestMatchMessage = 'secondary';
    const reasons: string[] = [];
    const badges: string[] = [];
    
    // Destination scoring in progress
    
    // 1. EXPERIENCE SCORE (40 points max) - ✅ PRIMARY SCORING
    // Match user interests against destination's experience scores
    if (prefs.categories && prefs.categories.length > 0) {
      let totalExperienceScore = 0;
      let matchCount = 0;
      
      for (const category of prefs.categories) {
        const categoryKey = category.toLowerCase();
        const destScore = (dest.scores as any)[categoryKey] || 0;
        
        if (destScore > 0) {
          totalExperienceScore += destScore;
          matchCount++;
        }
      }
      
      if (matchCount > 0) {
        // Average the matching scores
        const avgScore = totalExperienceScore / matchCount;
        interestMatchScore = Math.round((avgScore / 100) * 40);
        score += interestMatchScore;
        
        if (matchCount === prefs.categories.length) {
          interestMatchMessage = 'primary';
          reasons.push(`✅ Perfect match: ${matchCount}/${prefs.categories.length} interests (avg: ${Math.round(avgScore)}/100)`);
          badges.push('Perfect Match');
        } else {
          interestMatchMessage = 'secondary';
          reasons.push(`✓ ${matchCount}/${prefs.categories.length} interests match (avg: ${Math.round(avgScore)}/100)`);
        }
      }
    }
    
    // 2. TIMING MATCH (30 points max)
    // Normalize bestMonths array to handle both string and number formats
    const normalizedBestMonths = (dest.bestMonths && dest.bestMonths.length > 0) 
      ? dest.bestMonths.map(m => normalizeMonth(m)) 
      : [];
    
    if (normalizedBestMonths.includes(prefs.month)) {
      score += 30;
      reasons.push('✓ Perfect season');
      badges.push('Perfect Season');
    } else if (dest.avoidMonths && dest.avoidMonths.length > 0 && dest.avoidMonths.includes(prefs.month)) {
      score -= 15;
      reasons.push('⚠ Not ideal season');
    } else {
      score += 10;
      reasons.push('○ Acceptable season');
    }
    
    // 3. BUDGET MATCH (20 points max)
    if (dest.budget && dest.budget === prefs.budget) {
      score += 20;
      reasons.push('✓ Matches your budget');
      badges.push('Budget Match');
    } else if (dest.budget) {
      const budgetOrder = ['budget', 'moderate', 'premium', 'low', 'medium', 'high'];
      const destIndex = budgetOrder.indexOf(dest.budget);
      const prefIndex = budgetOrder.indexOf(prefs.budget);
      const diff = Math.abs(destIndex - prefIndex);
      
      if (diff === 1) {
        score += 10;
        reasons.push('○ Close to your budget');
      } else {
        score += 3;
        reasons.push('⚠ Different budget range');
      }
    }
    
    // 4. CLIMATE PREFERENCE (10 points max)
    if (prefs.climate && prefs.climate.length > 0 && dest.climate) {
      const climateKey = dest.climate.toLowerCase();
      if (prefs.climate.includes(climateKey) || climateKey === prefs.climate[0].toLowerCase()) {
        score += 10;
        reasons.push('✓ Ideal climate');
        badges.push('Great Weather');
      }
    }
    
    // Ensure score is within bounds (0-100)
    score = Math.max(0, Math.min(100, score));
    const displayScore = Math.round(score);
    
    return { score, displayScore, reasons, badges, interestMatchScore, interestMatchMessage };
  }
}

