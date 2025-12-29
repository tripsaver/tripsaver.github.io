import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ItineraryService } from '../../core/services/itinerary/itinerary.service';
import { ItineraryPlan, PlannerPreferences } from '../../core/models/itinerary.model';
import { ItineraryDayCardComponent } from './itinerary-day-card.component';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, ItineraryDayCardComponent],
  template: `
    <div class="planner-container">
      <h1>✨ Trip Planner</h1>

      <div class="planner-layout">
        <!-- Left: Input Section -->
        <div class="input-section">
          <div class="input-card">
            <h2>Plan Your Trip</h2>

            <!-- Destination Input -->
            <div class="form-group">
              <label for="destination">Where are you going?</label>
              <select
                id="destination"
                [(ngModel)]="selectedDestination"
                (change)="onDestinationChange()"
                class="form-control"
              >
                <option value="">Select a destination</option>
                <option *ngFor="let dest of destinations" [value]="dest.value">
                  {{ dest.name }}
                </option>
              </select>
            </div>

            <!-- Days Input -->
            <div class="form-group">
              <label for="days">How many days?</label>
              <select
                id="days"
                [(ngModel)]="selectedDays"
                [disabled]="!selectedDestination"
                class="form-control"
              >
                <option value="">Select duration</option>
                <option *ngFor="let day of availableDurations" [value]="day">
                  {{ day }} day{{ day !== 1 ? 's' : '' }}
                </option>
              </select>
            </div>

            <!-- Travel Type Preferences -->
            <div class="form-group">
              <label>Travel Style (Optional)</label>
              <div class="checkbox-group">
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="relaxed"
                    (change)="onPreferenceChange('relaxed', $event)"
                  />
                  <label for="relaxed">🌴 Relaxed</label>
                </div>
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="family"
                    (change)="onPreferenceChange('family', $event)"
                  />
                  <label for="family">👨‍👩‍👧‍👦 Family</label>
                </div>
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="adventure"
                    (change)="onPreferenceChange('adventure', $event)"
                  />
                  <label for="adventure">🏔️ Adventure</label>
                </div>
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="budget"
                    (change)="onPreferenceChange('budget', $event)"
                  />
                  <label for="budget">💰 Budget</label>
                </div>
              </div>
            </div>

            <!-- Advanced Filters (Collapsible) -->
            <div class="form-group">
              <button
                (click)="toggleAdvancedFilters()"
                class="filter-toggle"
                type="button"
              >
                ⚙️ {{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced Filters
              </button>

              <div *ngIf="showAdvancedFilters" class="advanced-filters">
                <!-- Budget Filter -->
                <div class="filter-item">
                  <label for="budget-filter">💰 Budget Level</label>
                  <select
                    id="budget-filter"
                    [(ngModel)]="filters.budget"
                    (change)="applyFilters()"
                    class="form-control filter-select"
                  >
                    <option value="">All budgets</option>
                    <option value="budget">Budget (₹5k-15k)</option>
                    <option value="moderate">Moderate (₹15k-30k)</option>
                    <option value="premium">Premium (₹30k+)</option>
                  </select>
                </div>

                <!-- Pace Filter -->
                <div class="filter-item">
                  <label for="pace-filter">⚡ Travel Pace</label>
                  <select
                    id="pace-filter"
                    [(ngModel)]="filters.pace"
                    (change)="applyFilters()"
                    class="form-control filter-select"
                  >
                    <option value="">All paces</option>
                    <option value="relaxed">🌴 Relaxed (2-3 activities/day)</option>
                    <option value="balanced">⚖️ Balanced (4-5 activities/day)</option>
                    <option value="fast">⚡ Fast (6+ activities/day)</option>
                  </select>
                </div>

                <!-- Accommodation Filter -->
                <div class="filter-item">
                  <label for="accommodation-filter">🏨 Accommodation</label>
                  <select
                    id="accommodation-filter"
                    [(ngModel)]="filters.accommodation"
                    (change)="applyFilters()"
                    class="form-control filter-select"
                  >
                    <option value="">Any accommodation</option>
                    <option value="budget">Budget hotels</option>
                    <option value="comfort">Comfort hotels</option>
                    <option value="luxury">Luxury hotels</option>
                    <option value="heritage">Heritage properties</option>
                    <option value="hostel">Hostels/Ashrams</option>
                  </select>
                </div>

                <!-- Travel Type Filter -->
                <div class="filter-item">
                  <label for="travel-type-filter">🎯 Travel Type</label>
                  <select
                    id="travel-type-filter"
                    [(ngModel)]="filters.travelType"
                    (change)="applyFilters()"
                    class="form-control filter-select"
                  >
                    <option value="">All travel types</option>
                    <option value="solo">Solo traveler</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Generate Button -->
            <button
              (click)="generatePlan()"
              [disabled]="!selectedDestination || !selectedDays"
              class="generate-btn"
            >
              {{ loading ? '⏳ Generating...' : '🚀 Generate Plan' }}
            </button>
          </div>
        </div>

        <!-- Right: Output Section -->
        <div class="output-section">
          <div class="output-card" *ngIf="!currentPlan">
            <div class="empty-state">
              <p>👈 Select a destination and duration</p>
              <p class="subtitle">Your personalized itinerary will appear here</p>
            </div>
          </div>

          <div class="output-card" *ngIf="currentPlan">
            <div class="plan-header">
              <h2>
                <span class="emoji">{{ currentPlan.destinationEmoji || '🌍' }}</span>
                {{ currentPlan.title }}
              </h2>
              <p class="plan-meta">
                <span *ngIf="currentPlan.bestTime">🗓️ Best time: {{ currentPlan.bestTime }} | </span>
                <span *ngIf="currentPlan.budget">💵 Budget: {{ currentPlan.budget }}</span>
              </p>
              <p class="plan-description">{{ currentPlan.description }}</p>
            </div>

            <!-- Day Cards -->
            <div class="itinerary-list">
              <app-itinerary-day-card
                *ngFor="let day of currentPlan.itinerary"
                [day]="day"
              ></app-itinerary-day-card>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button (click)="resetPlan()" class="reset-btn">← Back to Input</button>
              <button (click)="sharePlan()" class="share-btn">📤 Share Plan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .planner-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .planner-container h1 {
      text-align: center;
      font-size: 32px;
      margin-bottom: 30px;
      color: #333;
    }

    .planner-layout {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .planner-layout {
        grid-template-columns: 1fr;
      }
    }

    /* Input Section */
    .input-section {
      position: sticky;
      top: 20px;
      height: fit-content;
    }

    .input-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e0e0e0;
    }

    .input-card h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control:disabled {
      background: #f5f5f5;
      color: #999;
      cursor: not-allowed;
    }

    /* Checkbox Group */
    .checkbox-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .checkbox-item input[type="checkbox"] {
      cursor: pointer;
      width: 18px;
      height: 18px;
    }

    .checkbox-item label {
      margin: 0;
      cursor: pointer;
      font-size: 13px;
      color: #666;
      user-select: none;
    }

    /* Advanced Filters */
    .filter-toggle {
      width: 100%;
      padding: 10px 12px;
      background: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #555;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .filter-toggle:hover {
      background: #f0f0f0;
      border-color: #bbb;
    }

    .advanced-filters {
      margin-top: 12px;
      padding: 16px;
      background: #f9f9f9;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .filter-item {
      margin-bottom: 16px;
    }

    .filter-item:last-child {
      margin-bottom: 0;
    }

    .filter-item label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #555;
      font-size: 13px;
    }

    .filter-select {
      font-size: 13px;
    }

    /* Buttons */
    .generate-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .generate-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .generate-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Output Section */
    .output-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e0e0e0;
      min-height: 400px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      text-align: center;
      color: #999;
    }

    .empty-state p {
      font-size: 16px;
      margin: 8px 0;
    }

    .empty-state .subtitle {
      font-size: 14px;
      color: #bbb;
    }

    /* Plan Header */
    .plan-header {
      margin-bottom: 24px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 16px;
    }

    .plan-header h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .plan-header .emoji {
      font-size: 28px;
    }

    .plan-meta {
      margin: 8px 0;
      font-size: 13px;
      color: #999;
    }

    .plan-description {
      margin: 8px 0 0 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    /* Itinerary List */
    .itinerary-list {
      margin-bottom: 24px;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .reset-btn,
    .share-btn {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .reset-btn:hover {
      background: #f5f5f5;
      border-color: #bbb;
    }

    .share-btn {
      background: #f0f0f0;
      border-color: #ddd;
    }

    .share-btn:hover {
      background: #e0e0e0;
    }
  `]
})
export class TripPlannerComponent implements OnInit, OnDestroy {
  selectedDestination = '';
  selectedDays: number | null = null;
  selectedPreferences: PlannerPreferences = { travelType: [] };

  showAdvancedFilters = false;
  filters: any = {
    budget: '',
    pace: '',
    accommodation: '',
    travelType: ''
  };

  destinations: any[] = [];
  availableDurations: number[] = [];
  currentPlan: ItineraryPlan | null = null;
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private itineraryService: ItineraryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Load destinations asynchronously
    this.itineraryService.getDestinations().then(dests => {
      this.destinations = dests;
    });
  }

  ngOnInit(): void {
    // Check for query parameters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['destination']) {
        this.selectedDestination = params['destination'];
        this.onDestinationChange();
      }
      if (params['days']) {
        this.selectedDays = parseInt(params['days'], 10);
        this.generatePlan();
      }
    });
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  applyFilters(): void {
    // Apply filters to current plan if it exists
    if (this.currentPlan && this.selectedDestination && this.selectedDays) {
      this.itineraryService.setFilters({
        budget: this.filters.budget,
        pace: this.filters.pace,
        accommodation: this.filters.accommodation,
        travelType: this.filters.travelType
      });
      // Regenerate plan with filters
      this.generatePlan();
    }
  }

  onDestinationChange(): void {
    this.itineraryService.getDurations(this.selectedDestination).then(durations => {
      this.availableDurations = durations;
    });
    this.selectedDays = null;
    this.currentPlan = null;
    this.updateQueryParams();
  }

  onPreferenceChange(type: string, event: any): void {
    if (event.target.checked) {
      this.selectedPreferences.travelType.push(type as any);
    } else {
      this.selectedPreferences.travelType = this.selectedPreferences.travelType.filter(
        t => t !== type
      );
    }
  }

  generatePlan(): void {
    if (!this.selectedDestination || !this.selectedDays) {
      return;
    }

    this.loading = true;
    // Subscribe to observable from service
    this.itineraryService.generatePlan(
      this.selectedDestination,
      this.selectedDays!,
      this.selectedPreferences,
      this.filters
    ).pipe(takeUntil(this.destroy$)).subscribe(plan => {
      this.currentPlan = plan;
      this.loading = false;
      this.updateQueryParams();
    });
  }

  resetPlan(): void {
    this.currentPlan = null;
    this.selectedDays = null;
    this.updateQueryParams();
  }

  sharePlan(): void {
    const url = `${window.location.origin}${this.router.url}`;
    const text = `Check out my ${this.selectedDays}-day ${this.selectedDestination} itinerary on TripSaver!`;

    if (navigator.share) {
      navigator.share({
        title: 'Trip Plan',
        text: text,
        url: url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        alert('Plan link copied to clipboard!');
      });
    }
  }

  private updateQueryParams(): void {
    const queryParams: any = {};
    if (this.selectedDestination) {
      queryParams.destination = this.selectedDestination;
    }
    if (this.selectedDays) {
      queryParams.days = this.selectedDays;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: Object.keys(queryParams).length ? queryParams : null,
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
