/**
 * RECOMMENDATION ENGINE
 * =====================
 * 
 * Master engine that combines destination scoring and trip readiness
 * to provide personalized travel recommendations
 */

import { Injectable, inject } from '@angular/core';
import { BaseEngine, BaseEngineConfig, BaseEngineResult } from '../base.engine';
import { 
  DestinationScoringEngine, 
  DestinationScoringInput,
  ScoredDestination 
} from '../destination-scoring/destination-scoring.engine';
import {
  TripReadinessEngine,
  TripReadinessInput,
  TripReadinessResult
} from '../trip-readiness/trip-readiness.engine';

export interface RecommendationInput {
  userPreferences: {
    categories: string[];
    month: number;
    budget: 'budget' | 'moderate' | 'premium';
    climate?: string[];
  };
  tripDetails?: {
    budget: {
      available: number;
      estimated: number;
    };
    timing: {
      departureDate: Date;
      returnDate: Date;
      flexibility: 'fixed' | 'flexible' | 'very-flexible';
    };
    destination: {
      type: 'domestic' | 'international';
      seasonality: 'peak' | 'off-peak' | 'shoulder';
    };
    documents?: {
      passport?: {
        valid: boolean;
        expiryDate?: Date;
      };
      visa?: {
        required: boolean;
        valid: boolean;
      };
    };
  };
}

export interface EnhancedRecommendation extends ScoredDestination {
  readinessScore?: number;
  overallRecommendationScore: number;
  recommendationType: 'highly-recommended' | 'recommended' | 'consider' | 'not-recommended';
  warnings: string[];
}

export interface RecommendationResult extends BaseEngineResult {
  recommendations: EnhancedRecommendation[];
  tripReadiness?: TripReadinessResult;
  summary: {
    totalDestinationsEvaluated: number;
    topRecommendation: string | null;
    averageScore: number;
  };
}

@Injectable()
export class RecommendationEngine extends BaseEngine<RecommendationInput, RecommendationResult> {
  private scoringEngine = inject(DestinationScoringEngine);
  private readinessEngine = inject(TripReadinessEngine);
  
  protected config: BaseEngineConfig = {
    name: 'RecommendationEngine',
    version: '1.0.0',
    enabled: true
  };

  async process(input: RecommendationInput): Promise<RecommendationResult> {
    this.log('Starting comprehensive recommendation analysis');

    if (!this.validateInput(input)) {
      throw new Error('Invalid input for recommendation engine');
    }

    // 1. Get destination scores
    const scoringInput: DestinationScoringInput = {
      userPreferences: input.userPreferences
    };

    const scoringResult = await this.scoringEngine.process(scoringInput);
    
    if (!scoringResult.success) {
      this.logError('Destination scoring failed');
      return {
        engineName: this.config.name,
        timestamp: new Date(),
        success: false,
        recommendations: [],
        summary: {
          totalDestinationsEvaluated: 0,
          topRecommendation: null,
          averageScore: 0
        }
      };
    }

    // 2. Get trip readiness (if trip details provided)
    let tripReadiness: TripReadinessResult | undefined;
    if (input.tripDetails) {
      const readinessInput: TripReadinessInput = {
        budget: input.tripDetails.budget,
        timing: input.tripDetails.timing,
        destination: input.tripDetails.destination,
        documents: input.tripDetails.documents || {}
      };

      tripReadiness = await this.readinessEngine.process(readinessInput);
    }

    // 3. Combine scores and create enhanced recommendations
    const enhancedRecommendations = this.enhanceRecommendations(
      scoringResult.recommendations,
      tripReadiness
    );

    // 4. Generate summary
    const summary = {
      totalDestinationsEvaluated: scoringResult.totalDestinationsScored || enhancedRecommendations.length,
      topRecommendation: enhancedRecommendations.length > 0 
        ? enhancedRecommendations[0].destination.state 
        : null,
      averageScore: enhancedRecommendations.length > 0
        ? enhancedRecommendations.reduce((sum, r) => sum + r.overallRecommendationScore, 0) / enhancedRecommendations.length
        : 0
    };

    this.log(`Generated ${enhancedRecommendations.length} recommendations`);

    return {
      engineName: this.config.name,
      timestamp: new Date(),
      success: true,
      recommendations: enhancedRecommendations,
      tripReadiness,
      summary
    };
  }

  protected validateInput(input: RecommendationInput): boolean {
    return !!input?.userPreferences && 
           typeof input.userPreferences.month === 'number';
  }

  private enhanceRecommendations(
    scoredDestinations: ScoredDestination[],
    tripReadiness?: TripReadinessResult
  ): EnhancedRecommendation[] {
    return scoredDestinations
      .map(dest => {
        let overallScore = dest.score;
        const warnings: string[] = [];
        let readinessScore: number | undefined;

        // Incorporate trip readiness if available
        if (tripReadiness) {
          readinessScore = tripReadiness.overallScore;
          
          // Weight: 70% destination score, 30% readiness score
          overallScore = (dest.score * 0.7) + (tripReadiness.overallScore * 0.3);

          // Add warnings based on readiness
          if (tripReadiness.overallStatus === 'not-ready') {
            warnings.push('⚠ Significant preparation needed before booking');
          } else if (tripReadiness.overallStatus === 'needs-preparation') {
            warnings.push('○ Some preparation steps required');
          }

          // Add critical action items as warnings
          const criticalActions = tripReadiness.actionItems.filter(a => a.includes('URGENT'));
          warnings.push(...criticalActions);
        }

        // ✅ FIXED: Recommendation labels based on score percentage
        // Percentages are clearer and more honest
        let recommendationType: EnhancedRecommendation['recommendationType'];
        const scorePercent = Math.round((overallScore / 100) * 100);
        
        if (scorePercent >= 70) {
          recommendationType = 'highly-recommended';
        } else if (scorePercent >= 55) {
          recommendationType = 'recommended';
        } else if (scorePercent >= 40) {
          recommendationType = 'consider';
        } else {
          // ✅ LOW QUALITY: Filter out later
          recommendationType = 'consider';
        }

        // ✅ Add soft warning for low scores
        if (scorePercent < 50) {
          warnings.unshift('⚠️ This destination partially matches your preferences');
        }

        return {
          ...dest,
          readinessScore,
          overallRecommendationScore: Math.round(overallScore),
          recommendationType,
          warnings
        };
      })
      // ✅ CRITICAL: Filter out any destination with score < 40%
      .filter(rec => {
        const keep = rec.overallRecommendationScore >= 40;
        if (!keep) {
          console.log(`🚫 Filtering out ${rec.destination.state}: Score ${rec.overallRecommendationScore}% < 40%`);
        }
        return keep;
      });
  }
}
