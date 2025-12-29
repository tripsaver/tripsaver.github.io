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
                (ctaClick)="onRecommendationCtaClick($event, day.day)"
              ></app-itinerary-day-card>
            </div>

            <!-- Smart Recommendations Widget (Phase 1) -->
            <div class="recommendations-panel-section">
              <!-- Recommendation Selector -->
              <div class="recommendation-filter">
                <span class="filter-label">Show recommendations for:</span>
                <div class="filter-buttons">
                  <button
                    *ngFor="let option of [
                      {mode: 'hotels', label: 'Hotels', emoji: '🏨'},
                      {mode: 'activities', label: 'Activities', emoji: '🎫'},
                      {mode: 'transport', label: 'Transport', emoji: '🚕'},
                      {mode: 'essentials', label: 'Essentials', emoji: '🧳'}
                    ]"
                    [class.active]="recommendationMode === option.mode"
                    (click)="onRecommendationModeChange(option.mode)"
                    class="filter-btn"
                  >
                    <span class="emoji">{{ option.emoji }}</span>
                    <span class="label">{{ option.label }}</span>
                  </button>
                  <button
                    *ngIf="recommendationMode !== 'none'"
                    (click)="onRecommendationModeChange('none')"
                    class="filter-btn clear-btn"
                  >
                    <span class="emoji">✕</span>
                  </button>
                </div>
              </div>

              <!-- Recommendation Panel (Dynamic) -->
              <div *ngIf="recommendationMode !== 'none'" class="recommendations-panel">
                <div class="panel-header">
                  <h3>
                    <span class="emoji">
                      {{ recommendationMode === 'hotels' ? '🏨' : recommendationMode === 'activities' ? '🎫' : recommendationMode === 'transport' ? '🚕' : '🧳' }}
                    </span>
                    {{ 
                      recommendationMode === 'hotels' ? 'Recommended Hotels' :
                      recommendationMode === 'activities' ? 'Top Activities' :
                      recommendationMode === 'transport' ? 'Transport Options' :
                      'Travel Essentials'
                    }}
                  </h3>
                  <p class="context-hint">
                    {{ 
                      recommendationMode === 'hotels' ? 'Best hotels near ' + selectedDestination + ' for your stay' :
                      recommendationMode === 'activities' ? 'Top activities to explore on your ' + selectedDestination + ' trip' :
                      recommendationMode === 'transport' ? 'Transport options to reach and explore ' + selectedDestination :
                      'Must-have travel essentials for your trip'
                    }}
                  </p>
                </div>

                <!-- Recommendation Cards Grid -->
                <div class="recommendations-grid">
                  <ng-container *ngIf="recommendationMode === 'hotels'">
                    <div *ngFor="let rec of getHotelRecommendations()" class="recommendation-card">
                      <div class="card-header">
                        <span class="rec-emoji">🏨</span>
                        <div class="rec-title-section">
                          <h4>{{ rec.title }}</h4>
                          <span class="context-badge">{{ rec.context }}</span>
                        </div>
                      </div>
                      <p class="rec-description">{{ rec.description }}</p>
                      <div class="rec-meta">
                        <span *ngIf="rec.rating" class="rating">⭐ {{ rec.rating }}/5</span>
                        <span *ngIf="rec.price" class="price">💰 {{ rec.price }}</span>
                      </div>
                      <button (click)="window.open('https://www.agoda.com', '_blank')" class="rec-cta">
                        View on Agoda →
                      </button>
                    </div>
                  </ng-container>

                  <ng-container *ngIf="recommendationMode === 'activities'">
                    <div *ngFor="let rec of getActivityRecommendations()" class="recommendation-card">
                      <div class="card-header">
                        <span class="rec-emoji">🎫</span>
                        <div class="rec-title-section">
                          <h4>{{ rec.title }}</h4>
                          <span class="context-badge">{{ rec.context }}</span>
                        </div>
                      </div>
                      <p class="rec-description">{{ rec.description }}</p>
                      <div class="rec-meta">
                        <span *ngIf="rec.rating" class="rating">⭐ {{ rec.rating }}/5</span>
                        <span *ngIf="rec.price" class="price">💰 {{ rec.price }}</span>
                      </div>
                      <button (click)="window.open('https://www.getyourguide.com', '_blank')" class="rec-cta">
                        Book Activity →
                      </button>
                    </div>
                  </ng-container>

                  <ng-container *ngIf="recommendationMode === 'transport'">
                    <div *ngFor="let rec of getTransportRecommendations()" class="recommendation-card">
                      <div class="card-header">
                        <span class="rec-emoji">🚕</span>
                        <div class="rec-title-section">
                          <h4>{{ rec.title }}</h4>
                          <span class="context-badge">{{ rec.context }}</span>
                        </div>
                      </div>
                      <p class="rec-description">{{ rec.description }}</p>
                      <div class="rec-meta">
                        <span *ngIf="rec.price" class="price">💰 {{ rec.price }}</span>
                      </div>
                      <button (click)="window.open('https://www.abhibus.com', '_blank')" class="rec-cta">
                        Book Transport →
                      </button>
                    </div>
                  </ng-container>

                  <ng-container *ngIf="recommendationMode === 'essentials'">
                    <div *ngFor="let rec of getEssentialRecommendations()" class="recommendation-card">
                      <div class="card-header">
                        <span class="rec-emoji">🧳</span>
                        <div class="rec-title-section">
                          <h4>{{ rec.title }}</h4>
                          <span class="context-badge">{{ rec.context }}</span>
                        </div>
                      </div>
                      <p class="rec-description">{{ rec.description }}</p>
                      <div class="rec-meta">
                        <span *ngIf="rec.price" class="price">💰 {{ rec.price }}</span>
                      </div>
                      <button (click)="window.open('https://www.amazon.in', '_blank')" class="rec-cta">
                        Buy on Amazon →
                      </button>
                    </div>
                  </ng-container>
                </div>
              </div>
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

    /* Recommendations Widget */
    .recommendations-panel-section {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 2px solid #f0f0f0;
    }

    .recommendation-filter {
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .filter-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .filter-btn:hover {
      border-color: #667eea;
      color: #667eea;
      background: #f8f8ff;
    }

    .filter-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .filter-btn .emoji {
      font-size: 18px;
    }

    .filter-btn.clear-btn {
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      background: white;
      color: #999;
    }

    .filter-btn.clear-btn:hover {
      border-color: #ddd;
      background: #f5f5f5;
    }

    /* Recommendation Panel */
    .recommendations-panel {
      background: linear-gradient(135deg, #fafafa 0%, #f5f7ff 100%);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e8ecf1;
      animation: slideDown 0.3s ease-out;
    }

    .panel-header {
      margin-bottom: 24px;
    }

    .panel-header h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .panel-header .emoji {
      font-size: 24px;
    }

    .context-hint {
      margin: 0;
      font-size: 13px;
      color: #999;
      line-height: 1.5;
    }

    /* Recommendation Grid */
    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    @media (max-width: 768px) {
      .recommendations-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }
    }

    /* Recommendation Card */
    .recommendation-card {
      background: white;
      border-radius: 10px;
      padding: 16px;
      border: 1px solid #e8ecf1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recommendation-card:hover {
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .rec-emoji {
      font-size: 24px;
      min-width: 30px;
    }

    .rec-title-section {
      flex: 1;
    }

    .rec-title-section h4 {
      margin: 0 0 6px 0;
      font-size: 15px;
      font-weight: 600;
      color: #333;
      line-height: 1.3;
    }

    .context-badge {
      display: inline-block;
      font-size: 11px;
      padding: 4px 8px;
      background: #e8ecf1;
      color: #667eea;
      border-radius: 4px;
      font-weight: 500;
    }

    .rec-description {
      margin: 0;
      font-size: 13px;
      color: #666;
      line-height: 1.5;
    }

    .rec-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      flex-wrap: wrap;
    }

    .rating {
      color: #f39c12;
      font-weight: 500;
    }

    .price {
      color: #27ae60;
      font-weight: 500;
    }

    .rec-cta {
      padding: 10px 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .rec-cta:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }

    .rec-cta:active {
      transform: translateY(0);
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

  // Recommendation widget state (Phase 1: Smart Recommendations)
  recommendationMode: 'none' | 'hotels' | 'activities' | 'transport' | 'essentials' = 'none';
  activeRecommendationDay: number | null = null;

  // Make window accessible in template
  window = window;

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
    this.recommendationMode = 'none'; // Clear recommendations when resetting
    this.updateQueryParams();
  }

  // Smart Recommendations Widget Methods
  onRecommendationModeChange(mode: 'none' | 'hotels' | 'activities' | 'transport' | 'essentials'): void {
    this.recommendationMode = mode;
    // Scroll to recommendations panel if enabled
    if (mode !== 'none') {
      setTimeout(() => {
        const panel = document.querySelector('.recommendations-panel-section');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }

  onRecommendationCtaClick(ctaType: 'hotel' | 'activity' | 'transport' | 'essential', dayNumber?: number): void {
    // Store active recommendation day for context
    if (dayNumber) {
      this.activeRecommendationDay = dayNumber;
    }
    // Switch to appropriate recommendation mode
    const modeMap: Record<string, any> = {
      'hotel': 'hotels',
      'activity': 'activities',
      'transport': 'transport',
      'essential': 'essentials'
    };
    this.onRecommendationModeChange(modeMap[ctaType]);
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

  // Recommendation Data Methods (Phase 1 - Static Data)
  getHotelRecommendations(): any[] {
    return [
      {
        title: 'Taj View Hotel',
        description: 'Luxury 5-star hotel with rooftop views',
        context: 'Near Taj Mahal',
        rating: 4.8,
        price: '₹8,999/night'
      },
      {
        title: 'Budget Stays',
        description: 'Affordable 3-star hotel, great value',
        context: 'City Center',
        rating: 4.2,
        price: '₹2,499/night'
      },
      {
        title: 'Heritage Palace',
        description: 'Boutique heritage property with charm',
        context: 'Old City',
        rating: 4.6,
        price: '₹5,999/night'
      }
    ];
  }

  getActivityRecommendations(): any[] {
    return [
      {
        title: 'Taj Mahal Guided Tour',
        description: 'Expert guide, skip-the-line access, 4-hour tour',
        context: 'Best for Day 1',
        rating: 4.9,
        price: '₹1,299/person'
      },
      {
        title: 'Agra Fort Exploration',
        description: 'Self-guided or audio tour through historic fort',
        context: 'Day 2 Morning',
        rating: 4.5,
        price: '₹799/person'
      },
      {
        title: 'Sunrise Photography Tour',
        description: 'Capture stunning sunrise photos at Taj Mahal',
        context: 'Ideal for Day 1',
        rating: 4.7,
        price: '₹2,499/person'
      }
    ];
  }

  getTransportRecommendations(): any[] {
    return [
      {
        title: 'Delhi to Destination AC Bus',
        description: '4-hour comfortable journey with WiFi',
        context: 'For Day 1 Arrival',
        price: '₹599/person'
      },
      {
        title: 'Taxi Service (Full Day)',
        description: 'Dedicated driver, avoid hassle of local transport',
        context: 'Best for Day 2-3',
        price: '₹2,999/day'
      },
      {
        title: 'Train Booking (Shatabdi)',
        description: 'Fast rail service, meals included',
        context: 'Return Journey',
        price: '₹899/person'
      }
    ];
  }

  getEssentialRecommendations(): any[] {
    return [
      {
        title: 'Travel First Aid Kit',
        description: 'Essential medicines and first aid supplies',
        context: 'Highly Recommended',
        price: '₹499'
      },
      {
        title: 'Travel Insurance',
        description: 'Full coverage for 3-5 day trips',
        context: 'For Peace of Mind',
        price: '₹299/person'
      },
      {
        title: 'Portable Phone Charger',
        description: '20000mAh, fast charging, compact',
        context: 'Must-Have',
        price: '₹899'
      }
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
