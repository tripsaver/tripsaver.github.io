import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecommendationEngine } from '../../core/engines/recommendation/recommendation.engine';
import { DestinationScoringEngine } from '../../core/engines/destination-scoring/destination-scoring.engine';
import { TripReadinessEngine } from '../../core/engines/trip-readiness/trip-readiness.engine';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';
import { getDestinationCategories, type ProductCategory } from '../../core/config/destination-categories.config';
import { AffiliateLinkBuilderService } from '../../core/services/affiliate-link-builder.service';
import { AffiliateConfigService } from '../../core/services/affiliate-config.service';
import type { AffiliatePartnerType } from '../../core/config/affiliate-partners.config';

// Declare gtag globally
declare const gtag: Function;

@Component({
  selector: 'app-trip-stepper',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingModalComponent],
  templateUrl: './trip-stepper.component.html',
  styleUrls: ['./trip-stepper.component.scss'],
  providers: [DestinationScoringEngine, TripReadinessEngine, RecommendationEngine]
})
export class TripStepperComponent implements OnInit {
  private recommendationEngine = inject(RecommendationEngine);
  private cdr = inject(ChangeDetectorRef);
  private affiliateLinkBuilder = inject(AffiliateLinkBuilderService);
  private affiliateConfigService = inject(AffiliateConfigService);

  // ✅ Affiliate Shopping Partners (Agoda, Amazon, etc)
  availableShoppingPartners = getShoppingPartners();
  selectedShoppingPartner: string = 'amazon'; // Default to Amazon for product exploration

  // ✅ Stepper State
  currentStep = 1;
  totalSteps = 4;

  // ✅ Form Data (Persisted across steps)
  preferences = {
    interests: [] as string[],
    budget: 'moderate' as 'budget' | 'moderate' | 'premium',
    duration: '3-5' as '1' | '3-5' | '6-10',
    month: new Date().getMonth() + 1,
    climate: 'doesnt-matter' as 'warm' | 'cool' | 'doesnt-matter',
    budgetReady: true,
    docsReady: true,
    flexibleDates: true
  };

  // ✅ UI State
  uiState = {
    loading: false,
    hasResults: false,
    error: null as string | null
  };

  recommendations: any[] = [];
  isBookingModalOpen = false;
  selectedDestination: any = null;

  // ✅ Step Data
  interestOptions = [
    { icon: '🏖', label: 'Beach' },
    { icon: '🏔', label: 'Hill / Nature' },
    { icon: '🏛', label: 'Heritage' },
    { icon: '🎒', label: 'Adventure' },
    { icon: '🍽', label: 'Food & Culture' },
    { icon: '🧘', label: 'Relaxation' }
  ];

  budgetOptions = [
    { value: 'budget', label: '₹5k–₹10k' },
    { value: 'moderate', label: '₹10k–₹20k' },
    { value: 'premium', label: '₹20k+' }
  ];

  durationOptions = [
    { value: '1', label: 'Weekend' },
    { value: '3-5', label: '3–5 Days' },
    { value: '6-10', label: '6–10 Days' }
  ];

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  climateOptions = [
    { icon: '☀️', label: 'Warm', value: 'warm' },
    { icon: '❄️', label: 'Cool', value: 'cool' },
    { icon: '🌦', label: "Doesn't matter", value: 'doesnt-matter' }
  ];

  ngOnInit(): void {
    // Initialize affiliate config first (auto-seeds MongoDB if needed)
    this.affiliateConfigService.initConfig().subscribe(
      (initResult) => {
        console.log('✅ Affiliate config initialized:', initResult);
        // Then load the config
        this.loadAffiliateConfig();
      },
      (error) => {
        console.warn('⚠️ Init endpoint may not exist, loading config directly:', error);
        // If init fails, just load config directly
        this.loadAffiliateConfig();
      }
    );
  }

  private loadAffiliateConfig(): void {
    this.affiliateConfigService.loadConfig().subscribe(
      (config) => {
        console.log('✅ Affiliate config loaded in component:', config);
        this.cdr.markForCheck();
      },
      (error) => {
        console.warn('⚠️ Using default affiliate config:', error);
      }
    );
  }

  // ✅ Navigation
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.cdr.detectChanges();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.cdr.detectChanges();
    }
  }

  isFirstStep(): boolean {
    return this.currentStep === 1;
  }

  isLastStep(): boolean {
    return this.currentStep === this.totalSteps;
  }

  // ✅ Step Validation
  isStep1Valid(): boolean {
    return this.preferences.interests.length > 0;
  }

  isStep2Valid(): boolean {
    return !!this.preferences.budget && !!this.preferences.duration;
  }

  isStep3Valid(): boolean {
    return !!this.preferences.month && !!this.preferences.climate;
  }

  isStep4Valid(): boolean {
    return true; // All toggles have defaults
  }

  // ✅ Interest Toggle
  toggleInterest(interest: string): void {
    const index = this.preferences.interests.indexOf(interest);
    if (index > -1) {
      this.preferences.interests.splice(index, 1);
    } else {
      this.preferences.interests.push(interest);
    }
  }

  isInterestSelected(interest: string): boolean {
    return this.preferences.interests.includes(interest);
  }

  // ✅ Readiness Toggle
  toggleReadiness(field: 'budgetReady' | 'docsReady' | 'flexibleDates'): void {
    this.preferences[field] = !this.preferences[field];
  }

  // ✅ Submit & Get Recommendations
  async submitPreferences(): Promise<void> {
    if (!this.isStep4Valid()) return;

    this.uiState.loading = true;
    this.uiState.error = null;

    try {
      // Convert preferences to recommendation input format
      const input = {
        userPreferences: {
          categories: this.preferences.interests,
          month: this.preferences.month,
          budget: this.preferences.budget,
          climate: this.preferences.climate === 'doesnt-matter' ? undefined : [this.preferences.climate]
        }
      };

      const result = await this.recommendationEngine.process(input);

      if (result && result.recommendations) {
        this.recommendations = result.recommendations;
        this.uiState.hasResults = true;
        this.currentStep = this.totalSteps + 1; // Move to results view
      }
    } catch (error) {
      this.uiState.error = 'Failed to get recommendations. Please try again.';
      console.error('Recommendation error:', error);
    } finally {
      this.uiState.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ✅ Result Display
  getScoreBadgeClass(score: number): string {
    if (score >= 80) return 'badge-excellent';
    if (score >= 60) return 'badge-good';
    if (score >= 40) return 'badge-fair';
    return 'badge-low';
  }

  getScoreBadgeText(score: number): string {
    if (score >= 80) return 'Highly Recommended';
    if (score >= 60) return 'Recommended';
    if (score >= 40) return 'Consider';
    return 'Lower Match';
  }

  getDestinationTypeBadge(type: string): string {
    const badges: Record<string, string> = {
      'beach': '🏖️',
      'hill': '⛰️',
      'city': '🏙️',
      'heritage': '🏛️',
      'adventure': '🎒',
      'island': '🏝️',
      'wildlife': '🦁',
      'spiritual': '🙏'
    };
    return badges[type.toLowerCase()] || '📍';
  }

  // ✅ Helper Methods for Template Binding
  getBudgetLabel(value: 'budget' | 'moderate' | 'premium'): string {
    const option = this.budgetOptions.find(b => b.value === value);
    return option ? option.label : '';
  }

  getClimateLabel(value: string): string {
    const option = this.climateOptions.find(c => c.value === value);
    return option ? option.label : '';
  }

  setBudget(value: string): void {
    this.preferences.budget = value as 'budget' | 'moderate' | 'premium';
  }

  setDuration(value: string): void {
    this.preferences.duration = value as '1' | '3-5' | '6-10';
  }

  setClimate(value: string): void {
    this.preferences.climate = value as 'warm' | 'cool' | 'doesnt-matter';
  }

  // ✅ Expand Panel State
  expandedDestinationId: string | null = null;

  // ✅ Booking Modal
  openBookingModal(destination: any): void {
    this.selectedDestination = destination;
    this.isBookingModalOpen = true;
  }

  closeBookingModal(): void {
    this.isBookingModalOpen = false;
    this.selectedDestination = null;
  }

  // ✅ Contextual Explore Panel (NEW)
  toggleExplorePanel(destinationId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.expandedDestinationId =
      this.expandedDestinationId === destinationId ? null : destinationId;
  }

  // ✅ Quick Essentials Drawer (Power User)
  expandedEssentialsId: string | null = null;

  toggleEssentialsQuick(destinationId: string): void {
    // Track quick action
    if (typeof gtag !== 'undefined') {
      (window as any).gtag('event', 'essentials_quick_action', {
        event_category: 'Quick Action',
        event_label: 'Essentials Mini Drawer',
        source: 'quick_action_button'
      });
    }
    this.expandedEssentialsId =
      this.expandedEssentialsId === destinationId ? null : destinationId;
    this.cdr.markForCheck();
  }

  getDestinationCategories(destinationType?: string): Array<{
    name: string;
    icon: string;
    url: string;
    partner?: string;
  }> {
    // Get partner-agnostic categories
    const categories = getDestinationCategories(destinationType);
    const partner = this.availableShoppingPartners.find((p: any) => p.id === this.selectedShoppingPartner);
    
    // Build affiliate links dynamically based on selected partner
    return categories.map((category: ProductCategory) => ({
      name: category.name,
      icon: category.icon,
      url: this.buildShoppingLink(category.searchQuery),
      partner: this.selectedShoppingPartner
    }));
  }

  /**
   * Build shopping link for current selected partner
   * Supports both Agoda and Amazon with different link formats
   */
  buildShoppingLink(searchQuery: string): string {
    const partner = this.availableShoppingPartners.find((p: any) => p.id === this.selectedShoppingPartner);
    
    if (!partner) {
      return '';
    }

    let url = '';

    // Build partner-specific links
    if (partner.id === 'amazon') {
      // Amazon: search products
      url = `${partner.baseUrl}/s?k=${encodeURIComponent(searchQuery)}&tag=${partner.affiliateId}`;
    } else if (partner.id === 'agoda') {
      // Agoda: redirect to search with affiliate ID
      url = `${partner.baseUrl}/search?ss=${encodeURIComponent(searchQuery)}&affid=${partner.affiliateId}`;
    } else {
      // Generic format
      url = `${partner.baseUrl}?search=${encodeURIComponent(searchQuery)}&affid=${partner.affiliateId}`;
    }

    return url;
  }

  /**
   * Get the name of the currently selected shopping partner
   * Helper method for template binding (templates can't use find with arrow functions)
   */
  getSelectedPartnerName(): string {
    for (const partner of this.availableShoppingPartners) {
      if (partner.id === this.selectedShoppingPartner) {
        return partner.name;
      }
    }
    return 'our partners';
  }

  /**
   * Switch shopping partner
   */
  switchShoppingPartner(partnerId: string): void {
    this.selectedShoppingPartner = partnerId;
    this.cdr.markForCheck();
  }

  trackAffiliateClick(itemName: string): void {
    // Track with GA4
    if (typeof gtag !== 'undefined') {
      const partner = this.availableShoppingPartners.find((p: any) => p.id === this.selectedShoppingPartner);
      (window as any).gtag('event', 'shopping_affiliate_click', {
        event_category: partner?.name.toUpperCase() || 'SHOPPING',
        event_label: itemName,
        source: 'destination_explore_panel',
        partner: this.selectedShoppingPartner
      });
    }
    console.log('🛍️ Shopping Affiliate Click:', {
      partner: this.selectedShoppingPartner,
      item: itemName,
    });
  }

  // ✅ Track Bus Booking Click
  trackBusBookingClick(): void {
    if (typeof gtag !== 'undefined') {
      (window as any).gtag('event', 'abhibus_click', {
        event_category: 'Affiliate',
        event_label: 'Bus Tickets - AbhiBus',
        source: 'quick_action_button'
      });
    }
    console.log('🚌 Bus Booking Click: AbhiBus affiliate (Quick Action)');
    // Navigate to AbhiBus
    window.open('https://inr.deals/kQK6mx', '_blank', 'noopener');
  }

  // ✅ Restart
  restartStepper(): void {
    this.currentStep = 1;
    this.preferences = {
      interests: [],
      budget: 'moderate',
      duration: '3-5',
      month: new Date().getMonth() + 1,
      climate: 'doesnt-matter',
      budgetReady: true,
      docsReady: true,
      flexibleDates: true
    };
    this.recommendations = [];
    this.uiState = { loading: false, hasResults: false, error: null };
  }
}
