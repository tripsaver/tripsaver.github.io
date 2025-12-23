import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRequirements } from '../requirement-form/requirement-form.component';

export interface PlatformRecommendation {
  platform: 'Agoda' | 'Booking.com' | 'Goibibo'; // | 'MakeMyTrip'; // DISABLED
  isPrimary: boolean;
  affiliateUrl: string;
  affiliateId: string;
  reasons: string[];
  logo?: string;
  color: string;
}

@Component({
  selector: 'app-recommendation-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendation-result.component.html',
  styleUrls: ['./recommendation-result.component.scss']
})
export class RecommendationResultComponent {
  @Input() requirements!: UserRequirements;
  @Output() closeResult = new EventEmitter<void>();
  @Output() viewPlatform = new EventEmitter<PlatformRecommendation>();

  primaryRecommendation: PlatformRecommendation | null = null;
  secondaryRecommendation: PlatformRecommendation | null = null;

  ngOnInit() {
    this.generateRecommendations();
  }

  private generateRecommendations(): void {
    // Smart scoring algorithm based on user requirements
    // MAKEMYTRIP DISABLED - Only Agoda is enabled
    const scores = { agoda: 10 }; // Agoda always wins now
    const { travelType, budgetRange, preferences, destination } = this.requirements;

    // Agoda scoring
    if (budgetRange === 'luxury') scores.agoda += 3;
    if (preferences.internationalBrands) scores.agoda += 3;
    if (travelType === 'couple') scores.agoda += 2;
    if (travelType === 'solo') scores.agoda += 2; // Leisure travel
    if (preferences.payAtHotel) scores.agoda += 3;
    if (preferences.freeCancellation) scores.agoda += 2;
    if (preferences.mobileDeal) scores.agoda += 2;

    // // MAKEMYTRIP SCORING (DISABLED)
    // if (budgetRange === 'budget') scores.mmt += 3;
    // if (preferences.indianChains) scores.mmt += 3;
    // if (travelType === 'family') scores.mmt += 2;
    // if (travelType === 'business') scores.mmt += 2;
    // if (preferences.couponsCashback) scores.mmt += 3;
    // // Domestic destination boost for MMT
    // const domesticDestinations = ['goa', 'mumbai', 'delhi', 'bangalore', 'jaipur', 'chennai', 'kolkata', 'hyderabad', 'pune', 'udaipur', 'kerala', 'manali', 'shimla', 'agra'];
    // if (domesticDestinations.some(d => destination.toLowerCase().includes(d))) {
    //   scores.mmt += 2;
    // }

    // 🆕 TO ADD GOIBIBO (when ready):
    // if (budgetRange === 'budget') scores.goibibo += 3;
    // if (domesticDestinations.some(d => destination.toLowerCase().includes(d))) scores.goibibo += 2;
    // if (preferences.indianChains) scores.goibibo += 2;
    // Then add: getGooibiBoReasons() method below

    // Agoda is now primary (MMT disabled)
    this.primaryRecommendation = {
      platform: 'Agoda',
      isPrimary: true,
      affiliateUrl: this.buildAgodaUrl(),
      affiliateId: '1955073',
      reasons: this.getAgodaReasons(budgetRange, travelType, preferences),
      color: '#FF6600',
      logo: 'https://cdn6.agoda.net/images/kite-js/logo/agoda/color-default.svg'
    };

    // No secondary recommendation anymore (MMT is disabled)
    this.secondaryRecommendation = null;

    // // OLD CODE (DISABLED - Always Agoda now)
    // const primaryPlatform = scores.agoda >= scores.mmt ? 'agoda' : 'mmt';
    // const secondaryPlatform = primaryPlatform === 'agoda' ? 'mmt' : 'agoda';
    // if (primaryPlatform === 'agoda') {
    //   this.primaryRecommendation = {
    //     platform: 'Agoda',
    //     isPrimary: true,
    //     affiliateUrl: this.buildAgodaUrl(),
    //     affiliateId: '1955073',
    //     reasons: this.getAgodaReasons(budgetRange, travelType, preferences),
    //     color: '#FF6600',
    //     logo: 'https://cdn6.agoda.net/images/kite-js/logo/agoda/color-default.svg'
    //   };
    //   if (scores.mmt > 0) {
    //     this.secondaryRecommendation = {
    //       platform: 'MakeMyTrip',
    //       isPrimary: false,
    //       affiliateUrl: this.buildMMTUrl(),
    //       affiliateId: '',
    //       reasons: this.getMMTSecondaryReasons(preferences),
    //       color: '#E73C34',
    //       logo: ''
    //     };
    //   }
    // } else {
    //   this.primaryRecommendation = {
    //     platform: 'MakeMyTrip',
    //     isPrimary: true,
    //     affiliateUrl: this.buildMMTUrl(),
    //     affiliateId: '',
    //     reasons: this.getMMTReasons(budgetRange, travelType, preferences),
    //     color: '#E73C34',
    //     logo: ''
    //   };
    //   if (scores.agoda > 0) {
    //     this.secondaryRecommendation = {
    //       platform: 'Agoda',
    //       isPrimary: false,
    //       affiliateUrl: this.buildAgodaUrl(),
    //       affiliateId: '1955073',
    //       reasons: this.getAgodaSecondaryReasons(preferences),
    //       color: '#FF6600',
    //       logo: 'https://cdn6.agoda.net/images/kite-js/logo/agoda/color-default.svg'
    //     };
    //   }
    // }
  }

  private getAgodaReasons(budgetRange: string | null, travelType: string | null, preferences: any): string[] {
    const reasons: string[] = [];
    
    if (budgetRange === 'luxury' || preferences.internationalBrands) {
      reasons.push('Strong selection of international & luxury hotels');
    }
    if (preferences.payAtHotel) {
      reasons.push('Better suited for pay-at-hotel options');
    }
    if (travelType === 'couple' || travelType === 'solo') {
      reasons.push('Popular among couples & leisure travellers');
    }
    if (preferences.freeCancellation) {
      reasons.push('Flexible cancellation policies available');
    }
    if (preferences.mobileDeal) {
      reasons.push('Exclusive mobile app deals');
    }
    
    // Default reasons if none match
    if (reasons.length === 0) {
      reasons.push('Wide selection of hotels worldwide');
      reasons.push('User-friendly booking experience');
    }
    
    return reasons;
  }

  private getMMTReasons(budgetRange: string | null, travelType: string | null, preferences: any): string[] {
    const reasons: string[] = [];
    
    // // MAKEMYTRIP DISABLED
    // if (preferences.indianChains) {
    //   reasons.push('Best suited for Indian hotel chains');
    // }
    // if (budgetRange === 'budget') {
    //   reasons.push('Strong selection of budget-friendly options');
    // }
    // if (preferences.couponsCashback) {
    //   reasons.push('Exclusive coupons & cashback offers');
    // }
    // if (travelType === 'family' || travelType === 'business') {
    //   reasons.push('Popular among families & business travellers');
    // }
    // if (preferences.mobileDeal) {
    //   reasons.push('Special mobile app deals available');
    // }
    // 
    // // Default reasons if none match
    // if (reasons.length === 0) {
    //   reasons.push('Great for domestic travel in India');
    //   reasons.push('Local payment options available');
    // }
    
    return reasons;
  }

  private getAgodaSecondaryReasons(preferences: any): string[] {
    if (preferences.internationalBrands) {
      return ['better suited for international hotels'];
    }
    return ['alternative for international hotel selection'];
  }

  private getMMTSecondaryReasons(preferences: any): string[] {
    // // MAKEMYTRIP DISABLED
    // if (preferences.indianChains || preferences.couponsCashback) {
    //   return ['better suited for Indian hotels & coupons'];
    // }
    // return ['alternative for domestic travel options'];
    return [];
  }

  // 🆕 TO ADD GOIBIBO (when ready - just uncomment):
  // private getGooibiBoReasons(budgetRange: string | null, travelType: string | null, preferences: any): string[] {
  //   const reasons: string[] = [];
  //   
  //   if (budgetRange === 'budget') {
  //     reasons.push('Strong domestic inventory');
  //   }
  //   if (preferences.indianChains) {
  //     reasons.push('Good for Indian hotel chains');
  //   }
  //   if (travelType === 'family' || travelType === 'business') {
  //     reasons.push('Fast refunds available');
  //   }
  //   reasons.push('Good for short trips');
  //   
  //   return reasons;
  // }

  private buildAgodaUrl(): string {
    const { destination } = this.requirements;
    const baseUrl = 'https://www.agoda.com/search';
    const params = new URLSearchParams({
      cid: '1955073',
      city: destination || '',
      hl: 'en-us'
    });
    return `${baseUrl}?${params.toString()}`;
  }

  private buildMMTUrl(): string {
    const { destination } = this.requirements;
    // // MAKEMYTRIP DISABLED - This method is no longer used
    // return `https://www.makemytrip.com/hotels/hotels-in-${destination?.toLowerCase().replace(/\s+/g, '-') || 'india'}.html`;
    return '';
  }

  onViewPlatform(recommendation: PlatformRecommendation): void {
    this.viewPlatform.emit(recommendation);
    window.open(recommendation.affiliateUrl, '_blank');
  }

  close(): void {
    this.closeResult.emit();
  }
}
