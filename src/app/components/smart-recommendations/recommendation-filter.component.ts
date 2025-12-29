import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RecommendationMode = 'none' | 'hotels' | 'activities' | 'transport' | 'essentials';

@Component({
  selector: 'app-recommendation-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recommendation-filter">
      <span class="filter-label">Show recommendations for:</span>
      <div class="filter-buttons">
        <button
          *ngFor="let option of filterOptions"
          [class.active]="activeMode === option.mode"
          (click)="selectMode(option.mode)"
          class="filter-btn"
          [attr.aria-label]="'Show ' + option.label"
        >
          <span class="emoji">{{ option.emoji }}</span>
          <span class="label">{{ option.label }}</span>
        </button>
        <button
          *ngIf="activeMode !== 'none'"
          (click)="clearMode()"
          class="filter-btn clear-btn"
          aria-label="Clear recommendations"
        >
          <span class="emoji">✕</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .recommendation-filter {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
      margin: 16px 0;
      flex-wrap: wrap;
    }

    .filter-label {
      font-weight: 500;
      color: #333;
      font-size: 14px;
      white-space: nowrap;
    }

    .filter-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }

    .filter-btn:hover {
      background: #f9f9f9;
      border-color: #bbb;
      transform: translateY(-1px);
    }

    .filter-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .emoji {
      font-size: 16px;
    }

    .clear-btn {
      background: #fff3cd;
      border-color: #ffc107;
      color: #856404;
    }

    .clear-btn:hover {
      background: #ffe69c;
      border-color: #ff9800;
    }

    @media (max-width: 768px) {
      .recommendation-filter {
        flex-direction: column;
        align-items: flex-start;
      }

      .filter-label {
        width: 100%;
      }

      .filter-buttons {
        width: 100%;
      }

      .filter-btn {
        flex: 1;
        justify-content: center;
        min-width: 100px;
      }
    }
  `]
})
export class RecommendationFilterComponent {
  @Input() activeMode: RecommendationMode = 'none';
  @Output() modeChanged = new EventEmitter<RecommendationMode>();

  filterOptions = [
    { mode: 'hotels' as RecommendationMode, label: 'Hotels', emoji: '🏨' },
    { mode: 'activities' as RecommendationMode, label: 'Activities', emoji: '🎫' },
    { mode: 'transport' as RecommendationMode, label: 'Transport', emoji: '🚕' },
    { mode: 'essentials' as RecommendationMode, label: 'Essentials', emoji: '🧳' }
  ];

  selectMode(mode: RecommendationMode): void {
    this.modeChanged.emit(mode);
  }

  clearMode(): void {
    this.modeChanged.emit('none');
  }
}
