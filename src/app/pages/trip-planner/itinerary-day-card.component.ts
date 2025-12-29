import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryDay } from '../../core/models/itinerary.model';

@Component({
  selector: 'app-itinerary-day-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="day-card" [class.expanded]="isExpanded">
      <div class="day-header" (click)="toggleExpanded()">
        <div class="day-number">
          <span class="emoji">{{ day.emoji || '📅' }}</span>
          <span class="number">Day {{ day.day }}</span>
        </div>
        <h3>{{ day.title }}</h3>
        <button class="toggle-btn" [class.rotated]="isExpanded">
          ▼
        </button>
      </div>

      <div class="day-content" *ngIf="isExpanded">
        <p class="description">{{ day.description }}</p>

        <!-- Places to Visit -->
        <div class="section">
          <h4>📍 Places to Visit</h4>
          <ul class="places-list">
            <li *ngFor="let place of day.places">{{ place }}</li>
          </ul>
        </div>

        <!-- Activities -->
        <div class="section" *ngIf="day.activities && day.activities.length">
          <h4>🎯 Activities</h4>
          <ul class="activities-list">
            <li *ngFor="let activity of day.activities">{{ activity }}</li>
          </ul>
        </div>

        <!-- CTAs (Affiliate Links) -->
        <div class="ctas-section" *ngIf="day.ctas && day.ctas.length">
          <h4>💡 Recommended</h4>
          <div class="ctas-grid">
            <a
              *ngFor="let cta of day.ctas"
              [href]="cta.link || '#'"
              target="_blank"
              rel="noopener"
              (click)="onCtaClick(cta.type)"
              class="cta-button"
              [class.cta-hotel]="cta.type === 'hotel'"
              [class.cta-activity]="cta.type === 'activity'"
              [class.cta-essential]="cta.type === 'essential'"
              [class.cta-transport]="cta.type === 'transport'"
              [class.cta-food]="cta.type === 'food'"
            >
              <span class="emoji">{{ cta.emoji || '🔗' }}</span>
              <span class="label">{{ cta.label }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .day-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .day-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .day-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      cursor: pointer;
      user-select: none;
    }

    .day-number {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 60px;
    }

    .emoji {
      font-size: 24px;
    }

    .number {
      font-weight: 600;
      font-size: 14px;
    }

    .day-header h3 {
      flex: 1;
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 14px;
      padding: 4px 8px;
      transition: transform 0.3s ease;
    }

    .toggle-btn.rotated {
      transform: rotate(180deg);
    }

    .day-content {
      padding: 16px;
      animation: slideDown 0.3s ease;
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

    .description {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    .section {
      margin-bottom: 16px;
    }

    .section h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .places-list,
    .activities-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
    }

    .places-list li,
    .activities-list li {
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 6px;
      font-size: 13px;
      color: #555;
    }

    .ctas-section {
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
      margin-top: 16px;
    }

    .ctas-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .ctas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
    }

    .cta-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 10px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .cta-button .emoji {
      font-size: 18px;
    }

    .cta-button .label {
      display: block;
      line-height: 1.2;
    }

    /* CTA Type Colors */
    .cta-hotel {
      background: #e3f2fd;
      color: #1565c0;
      border-color: #90caf9;
    }

    .cta-hotel:hover {
      background: #bbdefb;
    }

    .cta-activity {
      background: #f3e5f5;
      color: #6a1b9a;
      border-color: #ce93d8;
    }

    .cta-activity:hover {
      background: #e1bee7;
    }

    .cta-essential {
      background: #fff3e0;
      color: #e65100;
      border-color: #ffb74d;
    }

    .cta-essential:hover {
      background: #ffe0b2;
    }

    .cta-transport {
      background: #e0f2f1;
      color: #00695c;
      border-color: #80deea;
    }

    .cta-transport:hover {
      background: #b2dfdb;
    }

    .cta-food {
      background: #fce4ec;
      color: #c2185b;
      border-color: #f48fb1;
    }

    .cta-food:hover {
      background: #f8bbd0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItineraryDayCardComponent {
  @Input() day!: ItineraryDay;
  @Output() ctaClick = new EventEmitter<'hotel' | 'activity' | 'essential' | 'transport' | 'food'>();

  isExpanded = false;

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  onCtaClick(ctaType: 'hotel' | 'activity' | 'essential' | 'transport' | 'food'): void {
    this.ctaClick.emit(ctaType);
  }
}
