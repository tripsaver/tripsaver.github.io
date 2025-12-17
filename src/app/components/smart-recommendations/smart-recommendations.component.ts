import { Component, OnInit, Input, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';
import { 
  RecommendationEngine, 
  RecommendationInput,
  EnhancedRecommendation 
} from '../../core/engines/recommendation/recommendation.engine';
import { DestinationScoringEngine } from '../../core/engines/destination-scoring/destination-scoring.engine';
import { TripReadinessEngine } from '../../core/engines/trip-readiness/trip-readiness.engine';
import { DESTINATIONS_DATA } from '../../core/engines/destination/destinations.data';

@Component({
  selector: 'app-smart-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingModalComponent],
  providers: [DestinationScoringEngine, TripReadinessEngine, RecommendationEngine],
  templateUrl: './smart-recommendations.component.html',
  styleUrls: ['./smart-recommendations.component.scss']
})
export class SmartRecommendationsComponent implements OnInit {
  private recommendationEngine = inject(RecommendationEngine);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  
  // ✅ Accept preferences from parent (home component)
  @Input() userPreferences: any = null;
  @Input() showForm: boolean = true;
  
  // ✅ Single source of truth for preferences (NEVER reset)
  preferences = {
    month: new Date().getMonth() + 1,
    budget: 'moderate' as 'budget' | 'moderate' | 'premium',
    categories: [] as string[]
  };
  
  // ✅ Separate UI state (can change independently)
  uiState = {
    loading: false,
    hasResults: false,
    error: null as string | null
  };
  
  availableCategories = [
    'Beach', 'Mountain', 'Heritage', 'Adventure', 'Spiritual',
    'Hill', 'Nature', 'City', 'Snow', 'Wildlife', 'Romantic',
    'Backwaters', 'Island', 'Colonial', 'Culture'
  ];
  
  recommendations: EnhancedRecommendation[] = [];
  expandedScores: Set<number> = new Set();
  
  // Booking modal state
  isBookingModalOpen = false;
  selectedDestination: any = null;

  ngOnInit(): void {
    // ✅ If preferences passed from parent, use them and auto-load
    if (this.userPreferences) {
      this.preferences = {
        month: this.userPreferences.month,
        budget: this.userPreferences.budget,
        categories: this.userPreferences.categories
      };
      // Auto-load recommendations with parent's preferences
      this.getRecommendations();
    }
    // Otherwise user will see empty state and click button manually
  }

  // ✅ Button label based on state (3 states)
  getButtonLabel(): string {
    if (this.uiState.loading) {
      return '⏳ Finding best destinations...';
    }
    return this.uiState.hasResults ? '🔄 Refine Recommendations' : '🔍 Get Recommendations';
  }

  // ✅ Button disabled only during loading
  isButtonDisabled(): boolean {
    return this.uiState.loading;
  }

  // ✅ Inputs disabled during loading (but NOT cleared)
  areInputsDisabled(): boolean {
    return this.uiState.loading;
  }

  toggleCategory(category: string): void {
    const index = this.preferences.categories.indexOf(category);
    if (index > -1) {
      this.preferences.categories.splice(index, 1);
    } else {
      this.preferences.categories.push(category);
    }
    // Don't auto-trigger - wait for explicit button click
  }

  toggleScoreDetails(index: number): void {
    if (this.expandedScores.has(index)) {
      this.expandedScores.delete(index);
    } else {
      this.expandedScores.add(index);
    }
  }

  isScoreExpanded(index: number): boolean {
    return this.expandedScores.has(index);
  }

  getScoreBreakdown(rec: EnhancedRecommendation) {
    const dest = rec.destination;
    const prefs = this.preferences;
    
    let timingScore = 0;
    let budgetScore = 0;
    let interestScore = 0;
    let climateScore = 0;
    let popularityScore = 0;

    // Timing (40 max)
    if (dest.bestMonths.includes(prefs.month)) {
      timingScore = 40;
    } else if (dest.avoidMonths.includes(prefs.month)) {
      timingScore = 10;
    } else {
      timingScore = 20;
    }

    // Budget (30 max)
    if (dest.budget === prefs.budget) {
      budgetScore = 30;
    } else {
      const budgetOrder = ['budget', 'moderate', 'premium'];
      const destIndex = budgetOrder.indexOf(dest.budget);
      const prefIndex = budgetOrder.indexOf(prefs.budget);
      const diff = Math.abs(destIndex - prefIndex);
      budgetScore = diff === 1 ? 15 : 5;
    }

    // Interest (25 max)
    if (prefs.categories.length > 0) {
      const matches = dest.categories.filter(cat => prefs.categories.includes(cat));
      interestScore = Math.min(25, matches.length * 12);
    }

    // Climate (15 max)
    climateScore = rec.overallRecommendationScore >= 80 ? 15 : (rec.overallRecommendationScore >= 65 ? 10 : 5);

    // Popularity (5 max)
    const popularDestinations = ['goa', 'manali', 'jaipur', 'kerala', 'leh', 'andaman'];
    const destId = (dest as any)._id || rec.destinationId;
    popularityScore = popularDestinations.includes(destId) ? 5 : 0;

    return {
      timing: { score: timingScore, max: 40 },
      budget: { score: budgetScore, max: 30 },
      interest: { score: interestScore, max: 25 },
      climate: { score: climateScore, max: 15 },
      popularity: { score: popularityScore, max: 5 },
      total: timingScore + budgetScore + interestScore + climateScore + popularityScore,
      totalMax: 110
    };
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  }

  formatBudget(budget: string): string {
    const budgetMap: { [key: string]: string } = {
      'budget': '₹10k-20k',
      'moderate': '₹15k-30k',
      'premium': '₹30k+'
    };
    return budgetMap[budget] || budget;
  }

  hasInterestMatch(categories: string[]): boolean {
    if (this.preferences.categories.length === 0) return false;
    return categories.some(cat => this.preferences.categories.includes(cat));
  }

  getMatchedInterests(categories: string[]): string[] {
    return categories.filter(cat => this.preferences.categories.includes(cat));
  }

  async getRecommendations(): Promise<void> {
    // ✅ Only change UI state, NEVER touch preferences
    console.log('🚀 [LOADER START] Getting recommendations...');
    this.uiState.loading = true;
    this.uiState.error = null;
    this.recommendations = [];
    this.expandedScores.clear();
    this.cdr.markForCheck();

    try {
      const input: RecommendationInput = {
        userPreferences: {
          month: this.preferences.month,
          budget: this.preferences.budget,
          categories: this.preferences.categories
        }
      };

      console.log('⏳ [LOADER] Processing with recommendation engine...');
      // ✅ No timeout needed - using instant static fallback (MongoDB service disabled for now)
      const result = await this.recommendationEngine.process(input);
      
      console.log('✅ [LOADER] Engine result:', result.recommendations.length, 'recommendations');
      
      // Run UI updates in Angular zone to ensure change detection
      this.ngZone.run(() => {
        if (result.success && result.recommendations.length > 0) {
          this.recommendations = result.recommendations.slice(0, 6); // Top 6
          this.uiState.hasResults = true;
          console.log('✅ [LOADER] Showing', this.recommendations.length, 'recommendations');
        } else {
          // Engine returned empty results, use fallback
          console.log('⚠️ [LOADER] Using fallback recommendations');
          this.useFallbackRecommendations();
          this.uiState.hasResults = true;
        }
        this.cdr.markForCheck();
      });
    } catch (err: any) {
      console.error('❌ [LOADER] Recommendation error:', err);
      // Run error handling in Angular zone
      this.ngZone.run(() => {
        // Don't show error - just use fallback silently
        this.useFallbackRecommendations();
        this.uiState.hasResults = true;
        this.cdr.markForCheck();
      });
    } finally {
      // ✅ Stop loading immediately (no artificial delays)
      this.ngZone.run(() => {
        this.uiState.loading = false;
        this.cdr.markForCheck();
        console.log('✅ [LOADER STOP] Complete!');
      });
    }
  }

  private useFallbackRecommendations(): void {
    // Use static data as fallback
    const destinations = Object.entries(DESTINATIONS_DATA);
    const scored = destinations.map(([id, dest]) => {
      let score = 50;
      const reasons: string[] = [];
      const badges: string[] = [];
      
      // Month scoring
      if (dest.bestMonths.includes(this.preferences.month)) {
        score += 30;
        reasons.push('Perfect weather and peak season timing');
        badges.push('Perfect Season');
      }
      
      // Budget scoring
      if (dest.budget === this.preferences.budget) {
        score += 25;
        reasons.push('Strong budget match for your trip');
        badges.push('Budget Match');
      }
      
      // Category scoring
      if (this.preferences.categories.length > 0) {
        const matches = dest.categories.filter(c => this.preferences.categories.includes(c));
        if (matches.length > 0) {
          score += matches.length * 10;
          reasons.push(`Strong match for ${matches.join(', ')} interests`);
          badges.push('Great Match');
        }
      }
      
      return {
        destinationId: id,
        destination: dest,
        score,
        reasons,
        badges,
        overallRecommendationScore: Math.min(100, score),
        recommendationType: score >= 80 ? 'highly-recommended' : 
                           score >= 65 ? 'recommended' : 'consider',
        warnings: []
      } as EnhancedRecommendation;
    });
    
    scored.sort((a, b) => b.score - a.score);
    this.recommendations = scored.slice(0, 6);
  }

  getRecommendationTypeClass(type: string): string {
    switch (type) {
      case 'highly-recommended':
        return 'badge-high';
      case 'recommended':
        return 'badge-medium';
      case 'consider':
        return 'badge-consider';
      default:
        return 'badge-low';
    }
  }

  getRecommendationTypeLabel(type: string): string {
    switch (type) {
      case 'highly-recommended':
        return '⭐ Highly Recommended';
      case 'recommended':
        return '👍 Recommended';
      case 'consider':
        return '💭 Worth Considering';
      default:
        return 'Not Recommended';
    }
  }

  openBookingModal(rec: EnhancedRecommendation): void {
    this.selectedDestination = rec.destination;
    this.isBookingModalOpen = true;
  }

  closeBookingModal(): void {
    this.isBookingModalOpen = false;
    this.selectedDestination = null;
  }
}
