import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TripStepperComponent } from '../../components/trip-stepper/trip-stepper.component';
import { SmartRecommendationsComponent } from '../../components/smart-recommendations/smart-recommendations.component';
import { TrustConfigService } from '../../core/services/trust-config.service';
import { BookingService } from '../../core/services/booking.service';
import { AffiliateConfigService } from '../../core/services/affiliate-config.service';

declare const gtag: Function;

interface UserRequirements {
  month: number;
  budget: 'budget' | 'moderate' | 'premium';
  categories: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    TripStepperComponent,
    SmartRecommendationsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  /* =======================
     LIFECYCLE MANAGEMENT
  ======================== */
  private destroy$ = new Subject<void>();

  /* =======================
     UI STATE
  ======================== */
  isMenuOpen = false;
  showRequirementForm = false;
  showRecommendationResult = false;
  showSmartRecommendations = false;

  userRequirements: UserRequirements | null = null;
  userPreferences: any = null;

  /* =======================
     DESTINATION FINDER FORM
  ======================== */
  travelMonth = '';
  budgetRange = '';
  climatePreference = '';

  selectedInterests: Set<string> = new Set();
  readonly MAX_INTERESTS = 3;

  // Trust config
  heroSubtitle = 'Smart travel recommendations, ranked for you — not ads';

  monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  budgetOptions = [
    { label: '₹10K - 30K', value: '10000-30000' },
    { label: '₹30K - 50K', value: '30000-50000' },
    { label: '₹50K - 1L', value: '50000-100000' },
    { label: '₹1L+', value: '100000+' }
  ];

  interestOptions = [
    { label: 'Beach', value: 'beach', icon: '🏖️' },
    { label: 'Hill Station', value: 'hill', icon: '⛰️' },
    { label: 'Cultural Heritage', value: 'culture', icon: '🕌' },
    { label: 'Historical Sites', value: 'history', icon: '🏛️' },
    { label: 'Adventure', value: 'adventure', icon: '🎯' },
    { label: 'Religious', value: 'religious', icon: '🕉️' },
    { label: 'Nature', value: 'nature', icon: '🌲' },
    { label: 'City', value: 'city', icon: '🏙️' },
    { label: 'Snow', value: 'snow', icon: '❄️' }
  ];

  climateOptions = [
    { label: '☀️ Warm & Sunny', value: 'warm' },
    { label: '❄️ Cool & Crisp', value: 'cool' },
    { label: '🌧️ Monsoon', value: 'monsoon' },
    { label: '🔄 Any Climate', value: 'any' }
  ];

  constructor(
    private http: HttpClient,
    private titleService: Title,
    private metaService: Meta,
    private trustConfigService: TrustConfigService,
    private bookingService: BookingService,
    private affiliateConfigService: AffiliateConfigService
  ) {
    // Fetch trust config on init (non-blocking)
    this.trustConfigService.getConfig().subscribe(config => {
      this.heroSubtitle = config.heroSubtitle;
    });
  }

  /* =======================
     LIFECYCLE
  ======================== */
  ngOnInit(): void {
    this.setSeoTags();
    this.setupBookingServiceListeners();
    this.loadAffiliateConfig();
  }

  /**
   * Load affiliate configuration from centralized service
   */
  private loadAffiliateConfig(): void {
    this.affiliateConfigService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        if (config?.partners?.['agoda']?.affiliateId) {
          this.agodaAffiliateId = config.partners['agoda'].affiliateId;
          console.log('✅ Agoda CID loaded from MongoDB config:', this.agodaAffiliateId);
        }
      });

    // If config not loaded yet, trigger load
    this.affiliateConfigService.loadConfig().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Listen to booking service events from sticky bar
   * When sticky bar is clicked, open corresponding modal in this page
   */
  private setupBookingServiceListeners(): void {
    this.bookingService.hotelBooking$
      .pipe(takeUntil(this.destroy$))
      .subscribe(shouldOpen => {
        if (shouldOpen) {
          this.openHotelBooking();
        }
      });

    this.bookingService.busBooking$
      .pipe(takeUntil(this.destroy$))
      .subscribe(shouldOpen => {
        if (shouldOpen) {
          this.openBusBooking();
        }
      });

    this.bookingService.essentials$
      .pipe(takeUntil(this.destroy$))
      .subscribe(shouldOpen => {
        if (shouldOpen) {
          this.openEssentialsShopping();
        }
      });
  }

  /* =======================
     SEO
  ======================== */
  private setSeoTags(): void {
    this.titleService.setTitle(
      'TripSaver – Book Hotels, Bus Tickets & Travel Essentials | Best Deals in India'
    );

    this.metaService.updateTag({
      name: 'description',
      content:
        'Find the best hotel deals and travel offers on TripSaver. Compare prices across Agoda, Booking.com, MakeMyTrip & more.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content:
        'hotel deals, travel deals, cheap hotels, TripSaver, hotel booking India'
    });
  }

  /* =======================
     HEADER
  ======================== */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =======================
     INTEREST SELECTION
  ======================== */
  toggleInterest(value: string): void {
    const updated = new Set(this.selectedInterests);

    if (updated.has(value)) {
      updated.delete(value);
    } else {
      if (updated.size >= this.MAX_INTERESTS) {
        return;
      }
      updated.add(value);
    }

    this.selectedInterests = updated;
  }

  isInterestSelected(value: string): boolean {
    return this.selectedInterests.has(value);
  }

  /* =======================
     FORM SUBMISSION
  ======================== */
  submitDestinationPreferences(): void {
    if (!this.travelMonth || !this.budgetRange || !this.climatePreference) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.selectedInterests.size === 0) {
      alert('Please select at least one interest');
      return;
    }

    console.log('Destination Preferences:', {
      month: this.travelMonth,
      budget: this.budgetRange,
      climate: this.climatePreference,
      interests: Array.from(this.selectedInterests)
    });

    // ✅ Build preferences object to pass to SmartRecommendationsComponent
    // Convert month name to number (1-12)
    const monthIndex = this.monthOptions.indexOf(this.travelMonth);
    const monthValue = monthIndex >= 0 ? monthIndex + 1 : 2; // Default to February (2) if not selected
    this.userPreferences = {
      month: monthValue,
      budget: this.budgetRange,
      categories: Array.from(this.selectedInterests),
      climate: this.climatePreference
    };

    this.showSmartRecommendations = true;

    setTimeout(() => {
      document
        .querySelector('.smart-recommendations-section')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  resetForm(): void {
    this.travelMonth = '';
    this.budgetRange = '';
    this.climatePreference = '';
    this.selectedInterests = new Set();
  }

  /* =======================
     DATA
  ======================== */

  /* =======================
     MODALS
  ======================== */
  startSearch(): void {
    this.showRequirementForm = true;
  }

  closeRequirementForm(): void {
    this.showRequirementForm = false;
  }

  /* =======================
     BOOK INSTANTLY ACTIONS
  ======================== */

  // Modal state
  /* =======================
     MODAL STATE
  ======================== */
  isHotelModalOpen = false;
  isBusModalOpen = false;
  isEssentialsModalOpen = false;
  agodaAffiliateId = ''; // ✅ Loaded from centralized AffiliateConfigService

  /**
   * Open hotel booking modal
   */
  openHotelBooking(): void {
    if (typeof gtag !== 'undefined') {
      (window as any).gtag('event', 'instant_hotel_booking', {
        event_category: 'Intent User',
        event_label: 'Book Instantly - Hotels',
        source: 'homepage_cta'
      });
    }
    this.isHotelModalOpen = true;
  }

  closeHotelModal(): void {
    this.isHotelModalOpen = false;
    this.bookingService.closeHotelBooking();
  }

  /**
   * Open bus booking confirmation
   */
  openBusBooking(): void {
    if (typeof gtag !== 'undefined') {
      (window as any).gtag('event', 'instant_bus_booking', {
        event_category: 'Intent User',
        event_label: 'Book Instantly - Bus',
        source: 'homepage_cta'
      });
    }
    this.isBusModalOpen = true;
  }

  closeBusModal(): void {
    this.isBusModalOpen = false;
    this.bookingService.closeBusBooking();
  }

  confirmBusBooking(): void {
    if (typeof gtag !== 'undefined') {
      (window as any).gtag('event', 'abhibus_redirect', {
        event_category: 'Affiliate',
        event_label: 'Bus Tickets - AbhiBus',
        source: 'homepage_cta'
      });
    }
    window.open('https://inr.deals/kQK6mx', '_blank', 'noopener');
    this.closeBusModal();
  }

  /**
   * Open essentials shopping
   */
  openEssentialsShopping(): void {
    if (typeof gtag !== 'undefined') {
      (window as any).gtag('event', 'instant_essentials', {
        event_category: 'Intent User',
        event_label: 'Book Instantly - Essentials',
        source: 'homepage_cta'
      });
    }
    this.isEssentialsModalOpen = true;
  }

  closeEssentialsModal(): void {
    this.isEssentialsModalOpen = false;
    this.bookingService.closeEssentials();
  }

  goToEssentials(category: string): void {
    if (typeof gtag !== 'undefined') {
      (window as any).gtag('event', 'essentials_category_click', {
        event_category: 'Shopping',
        event_label: category,
        source: 'homepage_cta'
      });
    }

    const categoryMap: Record<string, string> = {
      luggage: 'luggage',
      toiletries: 'travel toiletries',
      electronics: 'travel electronics',
      clothing: 'travel clothing'
    };

    const query = categoryMap[category] || category;
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=tripsaver21-21`;
    window.open(url, '_blank', 'noopener');
    this.closeEssentialsModal();
  }

  /**
   * Track hotel platform click
   */
  trackHotelClick(platform: string): void {
    if (typeof gtag !== 'undefined') {
      (window as any).gtag('event', 'hotel_platform_click', {
        event_category: 'Hotel Booking',
        event_label: platform,
        source: 'homepage_modal'
      });
    }
  }
}
