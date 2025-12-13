import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { PopularDestinationsComponent } from '../../shared/components/popular-destinations/popular-destinations.component';
import { TopDealsComponent } from '../../shared/components/top-deals/top-deals.component';
import { FeaturedDealsComponent } from '../../shared/components/featured-deals/featured-deals.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AgodaHotelsComponent } from '../../shared/components/agoda-hotels/agoda-hotels.component';
import { RequirementFormComponent, UserRequirements } from '../../shared/components/requirement-form/requirement-form.component';
import { RecommendationResultComponent } from '../../shared/components/recommendation-result/recommendation-result.component';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  affiliates: any[];
}

interface Deal {
  id: string;
  title: string;
  description: string;
  platform: string;
  discount: string;
  image?: string;
  affiliateUrl: string;
  category: string;
  expiryDate?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    PopularDestinationsComponent, 
    TopDealsComponent,
    FeaturedDealsComponent,
    FooterComponent,
    AgodaHotelsComponent,
    RequirementFormComponent,
    RecommendationResultComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', './home.component.css']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  isMenuOpen = false;
  showRequirementForm = false;
  showRecommendationResult = false;
  userRequirements: UserRequirements | null = null;

  constructor(
    private http: HttpClient,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    // Set SEO meta tags
    this.titleService.setTitle('TripSaver - Compare Hotels, Flights & Travel Deals | Save More on Bookings');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Find the best hotel deals and travel offers on TripSaver. Compare prices across Booking.com, MakeMyTrip, Agoda & more. Book hotels, flights & deals with easy links. Save money on every trip!' 
    });
    this.metaService.updateTag({ 
      name: 'keywords', 
      content: 'hotel deals, flight booking, travel deals, cheap hotels, flight comparison, TripSaver, hotel booking India, discount travel' 
    });
    
    // Load data
    this.loadCategories();
  }

  startSearch(): void {
    this.showRequirementForm = true;
  }

  closeRequirementForm(): void {
    this.showRequirementForm = false;
  }

  handleFormSubmit(requirements: UserRequirements): void {
    console.log('User requirements:', requirements);
    this.userRequirements = requirements;
    
    // Close form and show recommendation result
    this.showRequirementForm = false;
    this.showRecommendationResult = true;
  }

  closeRecommendationResult(): void {
    this.showRecommendationResult = false;
    this.userRequirements = null;
  }

  loadCategories(): void {
    this.http.get<{ categories: Category[] }>('/assets/data/categories.json')
      .subscribe({
        next: (data) => {
          this.categories = data.categories;
          console.log('Categories loaded:', this.categories);
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          // Fallback: Load sample categories if JSON fails
          this.categories = [
            {
              id: 'hotels',
              name: 'Hotels',
              description: 'Find the best hotel deals and save on your accommodation',
              icon: 'hotel',
              affiliates: [
                { name: 'Booking.com', baseUrl: 'https://www.booking.com/', active: true },
                { name: 'Agoda', baseUrl: 'https://www.agoda.com/?cid=1955073', active: true },
                { name: 'MakeMyTrip', baseUrl: 'https://www.makemytrip.com/hotels/', active: true }
              ]
            },
            {
              id: 'flights',
              name: 'Flights',
              description: 'Compare and book cheap flights to your destination',
              icon: 'flight',
              affiliates: [
                { name: 'Cleartrip', baseUrl: 'https://www.cleartrip.com/', active: true },
                { name: 'MakeMyTrip', baseUrl: 'https://www.makemytrip.com/flights/', active: true }
              ]
            },
            {
              id: 'health-labs',
              name: 'Health & Labs',
              description: 'Book health checkups and lab tests online',
              icon: 'medical_services',
              affiliates: [
                { name: 'Thyrocare', baseUrl: 'https://www.thyrocare.com/', active: true },
                { name: '1mg Labs', baseUrl: 'https://www.1mg.com/labs', active: true }
              ]
            },
            {
              id: 'electronics',
              name: 'Electronics',
              description: 'Best deals on smartphones, laptops and gadgets',
              icon: 'devices',
              affiliates: [
                { name: 'Amazon', baseUrl: 'https://www.amazon.in/electronics', active: true },
                { name: 'Flipkart', baseUrl: 'https://www.flipkart.com/electronics', active: true }
              ]
            }
          ];
          console.log('Loaded fallback categories:', this.categories);
        }
      });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    // Prevent body scroll when menu is open
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
