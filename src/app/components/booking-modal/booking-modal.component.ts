import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getActivePartners } from '../../core/config/partners.config';

export interface BookingPlatform {
  name: string;
  badge: string;
  icon: string;
  deepLink: string;
  description: string;
}

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="close()">&times;</button>
        
        <div class="modal-header">
          <h3 class="modal-title">Choose Where to Book</h3>
          <p class="modal-subtitle">{{ destinationName }}</p>
        </div>
        
        <div class="platforms-container">
          <a *ngFor="let platform of platforms"
             [href]="platform.deepLink"
             target="_blank"
             rel="noopener noreferrer"
             class="platform-card"
             (click)="trackClick(platform.name)">
            <div class="platform-icon">{{ platform.icon }}</div>
            <div class="platform-info">
              <h4 class="platform-name">{{ platform.name }}</h4>
              <p class="platform-description">{{ platform.description }}</p>
            </div>
            <div class="platform-badge">
              <span class="badge-text">{{ platform.badge }}</span>
            </div>
          </a>
        </div>
        
        <div class="disclosure-footer">
          <p class="disclosure-text">
            <span class="disclosure-icon">ℹ️</span>
            TripSaver may earn a commission when you book through partner links. 
            This does not affect our recommendations.
          </p>
        </div>
        
        <div class="control-message">
          <p>✓ You're in control — choose the platform that works best for you</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal-content {
      background: white;
      border-radius: 1rem;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.3s ease-out;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: #f3f4f6;
      border: none;
      border-radius: 50%;
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      z-index: 1;
    }
    
    .close-btn:hover {
      background: #e5e7eb;
      color: #1f2937;
      transform: rotate(90deg);
    }
    
    .modal-header {
      padding: 2rem 2rem 1rem 2rem;
      border-bottom: 2px solid #f3f4f6;
    }
    
    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }
    
    .modal-subtitle {
      font-size: 1rem;
      color: #6b7280;
      margin: 0;
    }
    
    .platforms-container {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .platform-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      text-decoration: none;
      transition: all 0.3s;
      cursor: pointer;
    }
    
    .platform-card:hover {
      border-color: #667eea;
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
    }
    
    .platform-icon {
      font-size: 2.5rem;
      min-width: 3rem;
      text-align: center;
    }
    
    .platform-info {
      flex: 1;
    }
    
    .platform-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.25rem 0;
    }
    
    .platform-description {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }
    
    .platform-badge {
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
    }
    
    .disclosure-footer {
      padding: 1rem 1.5rem;
      background: #fffbeb;
      border-top: 2px solid #fef3c7;
      border-bottom: 2px solid #fef3c7;
    }
    
    .disclosure-text {
      font-size: 0.8125rem;
      color: #78350f;
      margin: 0;
      line-height: 1.6;
      display: flex;
      gap: 0.5rem;
    }
    
    .disclosure-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }
    
    .control-message {
      padding: 1rem 1.5rem;
      text-align: center;
    }
    
    .control-message p {
      font-size: 0.875rem;
      color: #059669;
      font-weight: 600;
      margin: 0;
    }
    
    @media (max-width: 640px) {
      .modal-content {
        margin: 0.5rem;
        max-height: 95vh;
      }
      
      .modal-header {
        padding: 1.5rem 1rem 1rem 1rem;
      }
      
      .platforms-container {
        padding: 1rem;
      }
      
      .platform-card {
        flex-direction: column;
        text-align: center;
      }
      
      .platform-badge {
        width: 100%;
      }
    }
  `]
})
export class BookingModalComponent {
  @Input() isOpen = false;
  @Input() destinationName = '';
  @Input() agodaCode = '';
  @Output() closed = new EventEmitter<void>();

  get platforms(): BookingPlatform[] {
    const activePartners = getActivePartners();
    
    return activePartners.map(partner => {
      let deepLink = '';
      let badge = '';
      let icon = '🏨';
      let description = '';
      
      if (partner.id === 'agoda') {
        deepLink = partner.urls.hotels({ 
          city: this.agodaCode || this.destinationName 
        });
        badge = 'Best Price Today';
        description = 'Strong seasonal deals & largest inventory in Asia';
      } else if (partner.id === 'makemytrip') {
        deepLink = partner.urls.hotels({ 
          destination: this.destinationName 
        });
        badge = 'Domestic Expert';
        description = 'Best rates for India travel & exclusive offers';
        icon = '🇮🇳';
      } else if (partner.id === 'bookingcom') {
        deepLink = partner.urls.hotels({ 
          destination: this.destinationName 
        });
        badge = 'Free Cancellation';
        description = 'Flexible cancellation options & verified reviews';
        icon = '🌐';
      }
      
      return {
        name: partner.displayName,
        badge,
        icon,
        deepLink,
        description
      };
    });
  }

  close(): void {
    this.closed.emit();
  }

  trackClick(platformName: string): void {
    // 📊 LOG BOOKING PLATFORM CLICK - For analytics (console for now)
    const bookingLog = {
      timestamp: new Date().toISOString(),
      event: 'booking_platform_click',
      platform: platformName,
      destination: this.destinationName,
      agodaCode: this.agodaCode || 'N/A'
    };
    
    console.log('🎯 BOOKING CLICK:', bookingLog);
    // TODO: Send to analytics service
    // this.analyticsService.track('booking_platform_click', bookingLog);
    
    this.close();
  }
}
