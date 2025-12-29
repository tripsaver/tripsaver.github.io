import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EnhancedRecommendation } from '../../core/engines/recommendation/recommendation.engine';

@Component({
  selector: 'app-destination-card-compact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './destination-card-compact.component.html',
  styleUrls: ['./destination-card-compact.component.scss']
})
export class DestinationCardCompactComponent implements OnInit {
  @Input() recommendation!: EnhancedRecommendation;
  @Output() bookingClicked = new EventEmitter<EnhancedRecommendation>();

  private router = inject(Router);

  // Expansion state
  isExpanded = false;
  selectedDays: number | null = null;
  readonly dayOptions = [2, 3, 4, 5];

  ngOnInit(): void {
    console.log(`🎴 [DestinationCard] Card rendered for: ${this.recommendation?.destination?.state}`);
    console.log(`🎴 [DestinationCard] Ready for user interaction (click to expand)`);
  }

  /**
   * Get top 2 categories from destination
   */
  get topBadges(): string[] {
    if (!this.recommendation?.destination?.categories || this.recommendation.destination.categories.length === 0) {
      return [];
    }
    return this.recommendation.destination.categories.slice(0, 2);
  }

  /**
   * Get badge class for styling
   */
  getBadgeClass(badge: string): string {
    const badgeMap: Record<string, string> = {
      'Beach': 'badge-beach',
      'Mountain': 'badge-mountain',
      'Heritage': 'badge-heritage',
      'City': 'badge-city',
      'Spiritual': 'badge-spiritual',
      'Wildlife': 'badge-wildlife',
      'Island': 'badge-island',
      'Adventure': 'badge-adventure'
    };
    return badgeMap[badge] || 'badge-default';
  }

  /**
   * Determine score color based on value
   */
  getScoreColor(): string {
    const score = this.recommendation?.overallRecommendationScore || 0;
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-low';
  }

  /**
   * Toggle expanded view
   */
  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
    const city = this.recommendation?.destination?.state;
    console.log(`🎴 [Card] ${city} - Expansion: ${this.isExpanded}`);
    console.log(`🎴 [Card] ${city} - isExpanded=${this.isExpanded}, selectedDays=${this.selectedDays}`);
    // Reset days selection when collapsing
    if (!this.isExpanded) {
      this.selectedDays = null;
      console.log(`🎴 [Card] ${city} - Days reset to null`);
    } else {
      // Auto-select 3 days when expanding
      this.selectedDays = 3;
      console.log(`🎴 [Card] ${city} - Auto-selected 3 days`);
    }
  }

  /**
   * Select number of days
   */
  selectDays(days: number): void {
    this.selectedDays = this.selectedDays === days ? null : days;
    const city = this.recommendation?.destination?.state;
    console.log(`🎴 [Card] ${city} - Days toggled: ${days} → ${this.selectedDays}`);
    console.log(`🎴 [Card] ${city} - Button will now say: "${this.getCtaLabel()}"`);
  }

  /**
   * Get CTA button label based on expansion state
   */
  getCtaLabel(): string {
    if (!this.isExpanded) {
      return 'Plan This Trip';
    }
    if (!this.selectedDays) {
      return 'Select Days Above';
    }
    return `View ${this.selectedDays}-Day Itinerary →`;
  }

  /**
   * Check if CTA button should be disabled
   */
  isCtaDisabled(): boolean {
    if (!this.isExpanded) {
      return false;
    }
    return !this.selectedDays;
  }

  /**
   * Handle CTA button click - navigates to planner with context
   */
  onCtaClick(): void {
    const city = this.recommendation?.destination?.state;
    console.log(`🎴 [Card] CTA button clicked on ${city}`);
    console.log(`🎴 [Card] State: isExpanded=${this.isExpanded}, selectedDays=${this.selectedDays}`);
    
    if (!this.isExpanded) {
      // First click: expand the card
      console.log(`🎴 [Card] ACTION: Expanding card for ${city}...`);
      this.toggleExpanded();
    } else if (this.selectedDays) {
      // Second click: navigate to planner with destination and days
      const destination = this.recommendation.destination.state.toLowerCase();
      console.log(`🎴 [Card] ACTION: Navigating to planner`);
      console.log(`🎴 [Card] → destination=${destination}, days=${this.selectedDays}, source=smart`);
      this.router.navigate(['/planner'], {
        queryParams: {
          destination: destination,
          days: this.selectedDays,
          source: 'smart'
        }
      });
    }
  }

  /**
   * Handle booking button click (Essentials modal)
   */
  onEssentialsClick(): void {
    this.bookingClicked.emit(this.recommendation);
  }
}
