import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';

import { PopularDestinationsComponent } from '../../shared/components/popular-destinations/popular-destinations.component';
import { TopDealsComponent } from '../../shared/components/top-deals/top-deals.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AgodaHotelsComponent } from '../../shared/components/agoda-hotels/agoda-hotels.component';
import {
  RequirementFormComponent,
  UserRequirements
} from '../../shared/components/requirement-form/requirement-form.component';
import { RecommendationResultComponent } from '../../shared/components/recommendation-result/recommendation-result.component';
import { SmartRecommendationsComponent } from '../../components/smart-recommendations/smart-recommendations.component';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  affiliates: any[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    PopularDestinationsComponent,
    TopDealsComponent,
    FooterComponent,
    AgodaHotelsComponent,
    RequirementFormComponent,
    RecommendationResultComponent,
    SmartRecommendationsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  /* =======================
     UI STATE
  ======================== */
  isMenuOpen = false;
  showRequirementForm = false;
  showRecommendationResult = false;
  showSmartRecommendations = false;

  userRequirements: UserRequirements | null = null;
  categories: Category[] = [];

  /* =======================
     DESTINATION FINDER FORM
  ======================== */
  travelMonth = '';
  budgetRange = '';
  climatePreference = '';

  selectedInterests: Set<string> = new Set();
  readonly MAX_INTERESTS = 3;

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
    private metaService: Meta
  ) {}

  /* =======================
     LIFECYCLE
  ======================== */
  ngOnInit(): void {
    this.setSeoTags();
    this.loadCategories();
  }

  /* =======================
     SEO
  ======================== */
  private setSeoTags(): void {
    this.titleService.setTitle(
      'TripSaver - Compare Hotels, Flights & Travel Deals | Save More on Bookings'
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
  private loadCategories(): void {
    this.http.get<{ categories: Category[] }>('/assets/data/categories.json')
      .subscribe({
        next: res => (this.categories = res.categories),
        error: () => (this.categories = [])
      });
  }

  /* =======================
     MODALS
  ======================== */
  startSearch(): void {
    this.showRequirementForm = true;
  }

  closeRequirementForm(): void {
    this.showRequirementForm = false;
  }

  handleFormSubmit(requirements: UserRequirements): void {
    this.userRequirements = requirements;
    this.showRequirementForm = false;
    this.showRecommendationResult = true;
  }

  closeRecommendationResult(): void {
    this.showRecommendationResult = false;
    this.userRequirements = null;
  }
}
