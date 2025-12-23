/**
 * RECOMMENDATION ENGINE
 * ======================
 * 
 * Core logic for platform recommendations based on user preferences.
 * Self-contained, testable, and easy to extend.
 * 
 * Architecture:
 * - Scoring algorithm (preference-based, not price-based)
 * - Reason generation (affiliate-safe language)
 * - Partner selection (primary + secondary)
 * - Scalable for any number of partners
 */

import { Injectable } from '@angular/core';
import { getActivePartners, getPartner, buildPartnerUrl, PartnerConfig } from '../../config/partners.config';

export interface UserPreferences {
  destination: string;
  travelType: 'solo' | 'couple' | 'family' | 'business' | null;
  budgetRange: 'budget' | 'mid' | 'luxury' | null;
  preferences: {
    internationalBrands: boolean;
    indianChains: boolean;
    payAtHotel: boolean;
    freeCancellation: boolean;
    mobileDeal: boolean;
    couponsCashback: boolean;
  };
}

export interface RecommendationResult {
  partnerId: string;
  partnerName: string;
  partnerColor: string;
  partnerLogo?: string;
  affiliateUrl: string;
  reasons: string[];
  score: number; // Internal only, not shown to user
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationEngine {
  
  /**
   * Generate recommendations based on user preferences
   * Returns primary and optional secondary recommendation
   */
  generateRecommendations(prefs: UserPreferences): {
    primary: RecommendationResult | null;
    secondary: RecommendationResult | null;
  } {
    const activePartners = getActivePartners();
    
    if (activePartners.length === 0) {
      return { primary: null, secondary: null };
    }
    
    // Score all partners
    const scored = activePartners.map((partner: PartnerConfig) => ({
      partner,
      score: this.calculateScore(partner.id, prefs)
    }));
    
    // Sort by score (highest first)
    scored.sort((a: any, b: any) => b.score - a.score);
    
    // Build recommendation results
    const primary = scored[0]?.score > 0 
      ? this.buildRecommendation(scored[0].partner, prefs, scored[0].score)
      : null;
      
    const secondary = scored[1]?.score > 0
      ? this.buildRecommendation(scored[1].partner, prefs, scored[1].score)
      : null;
    
    return { primary, secondary };
  }
  
  /**
   * Calculate score for a partner based on preferences
   * Returns score (higher = better match)
   */
  private calculateScore(partnerId: string, prefs: UserPreferences): number {
    let score = 0;
    const { travelType, budgetRange, preferences, destination } = prefs;
    
    // AGODA SCORING
    if (partnerId === 'agoda') {
      if (budgetRange === 'luxury') score += 3;
      if (preferences.internationalBrands) score += 3;
      if (travelType === 'couple') score += 2;
      if (travelType === 'solo') score += 2;
      if (preferences.payAtHotel) score += 3;
      if (preferences.freeCancellation) score += 2;
      if (preferences.mobileDeal) score += 2;
    }
    
    // // MAKEMYTRIP SCORING (DISABLED)
    // if (partnerId === 'makemytrip') {
    //   if (budgetRange === 'budget') score += 3;
    //   if (preferences.indianChains) score += 3;
    //   if (travelType === 'family') score += 2;
    //   if (travelType === 'business') score += 2;
    //   if (preferences.couponsCashback) score += 3;
    //   
    //   // Domestic destination boost
    //   const domesticDestinations = [
    //     'goa', 'mumbai', 'delhi', 'bangalore', 'jaipur', 
    //     'chennai', 'kolkata', 'hyderabad', 'pune', 'udaipur', 
    //     'kerala', 'manali', 'shimla', 'agra'
    //   ];
    //   if (domesticDestinations.some(d => destination.toLowerCase().includes(d))) {
    //     score += 2;
    //   }
    // }
    
    // GOIBIBO SCORING (when active)
    if (partnerId === 'goibibo') {
      if (budgetRange === 'budget') score += 3;
      if (preferences.indianChains) score += 2;
      if (travelType === 'family' || travelType === 'business') score += 2;
      
      // Domestic boost
      const domesticDestinations = [
        'goa', 'mumbai', 'delhi', 'bangalore', 'jaipur'
      ];
      if (domesticDestinations.some(d => destination.toLowerCase().includes(d))) {
        score += 2;
      }
    }
    
    // BOOKING.COM SCORING (when active)
    if (partnerId === 'bookingcom') {
      if (preferences.freeCancellation) score += 3;
      if (preferences.internationalBrands) score += 2;
      if (travelType === 'business') score += 2;
      if (budgetRange === 'mid' || budgetRange === 'luxury') score += 2;
    }
    
    return score;
  }
  
  /**
   * Build recommendation result with reasons
   */
  private buildRecommendation(
    partner: PartnerConfig, 
    prefs: UserPreferences, 
    score: number
  ): RecommendationResult {
    return {
      partnerId: partner.id,
      partnerName: partner.displayName,
      partnerColor: partner.color,
      partnerLogo: partner.logo,
      affiliateUrl: buildPartnerUrl(partner.id, 'hotels', { destination: prefs.destination }),
      reasons: this.generateReasons(partner.id, prefs),
      score
    };
  }
  
  /**
   * Generate affiliate-safe reasons for recommendation
   */
  private generateReasons(partnerId: string, prefs: UserPreferences): string[] {
    const reasons: string[] = [];
    const { travelType, budgetRange, preferences } = prefs;
    
    // AGODA REASONS
    if (partnerId === 'agoda') {
      if (budgetRange === 'luxury' || preferences.internationalBrands) {
        reasons.push('Strong selection of international & luxury hotels');
      }
      if (preferences.payAtHotel) {
        reasons.push('Better suited for pay-at-hotel options');
      }
      if (travelType === 'couple' || travelType === 'solo') {
        reasons.push('Popular among couples & leisure travelers');
      }
      if (preferences.freeCancellation) {
        reasons.push('Flexible cancellation policies available');
      }
      if (preferences.mobileDeal) {
        reasons.push('Exclusive mobile app deals');
      }
      
      // Defaults if no match
      if (reasons.length === 0) {
        reasons.push('Wide selection of hotels worldwide');
        reasons.push('User-friendly booking experience');
      }
    }
    
    // // MAKEMYTRIP REASONS (DISABLED)
    // if (partnerId === 'makemytrip') {
    //   if (preferences.indianChains) {
    //     reasons.push('Best suited for Indian hotel chains');
    //   }
    //   if (budgetRange === 'budget') {
    //     reasons.push('Strong selection of budget-friendly options');
    //   }
    //   if (preferences.couponsCashback) {
    //     reasons.push('Exclusive coupons & cashback offers');
    //   }
    //   if (travelType === 'family' || travelType === 'business') {
    //     reasons.push('Popular among families & business travelers');
    //   }
    //   
    //   // Defaults
    //   if (reasons.length === 0) {
    //     reasons.push('Great for domestic travel in India');
    //     reasons.push('Local payment options available');
    //   }
    // }
    
    // GOIBIBO REASONS
    if (partnerId === 'goibibo') {
      if (budgetRange === 'budget') {
        reasons.push('Strong domestic inventory');
      }
      if (preferences.indianChains) {
        reasons.push('Good for Indian hotel chains');
      }
      if (travelType === 'family' || travelType === 'business') {
        reasons.push('Fast refunds available');
      }
      reasons.push('Good for short trips');
    }
    
    // BOOKING.COM REASONS
    if (partnerId === 'bookingcom') {
      if (preferences.freeCancellation) {
        reasons.push('Free cancellation options');
      }
      if (preferences.internationalBrands) {
        reasons.push('Wide selection of international hotels');
      }
      if (travelType === 'business') {
        reasons.push('Business-friendly stays');
      }
      if (reasons.length === 0) {
        reasons.push('No booking fees');
        reasons.push('Flexible payment options');
      }
    }
    
    return reasons;
  }
  
  /**
   * Get short reason for secondary recommendation
   */
  getSecondaryReason(partnerId: string, prefs: UserPreferences): string {
    if (partnerId === 'agoda') {
      return 'better suited for international hotels';
    }
    if (partnerId === 'makemytrip') {
      return 'better suited for Indian hotels & coupons';
    }
    if (partnerId === 'goibibo') {
      return 'good for domestic budget travel';
    }
    if (partnerId === 'bookingcom') {
      return 'better suited for flexible cancellation';
    }
    return 'alternative option';
  }
}

/**
 * USAGE EXAMPLE
 * =============
 * 
 * constructor(private recommendationEngine: RecommendationEngine) {}
 * 
 * const prefs: UserPreferences = {
 *   destination: 'Goa',
 *   travelType: 'couple',
 *   budgetRange: 'luxury',
 *   preferences: {
 *     internationalBrands: true,
 *     indianChains: false,
 *     payAtHotel: true,
 *     freeCancellation: true,
 *     mobileDeal: false,
 *     couponsCashback: false
 *   }
 * };
 * 
 * const { primary, secondary } = this.recommendationEngine.generateRecommendations(prefs);
 * 
 * console.log('Primary:', primary.partnerName, primary.reasons);
 * if (secondary) {
 *   console.log('Secondary:', secondary.partnerName);
 * }
 */
