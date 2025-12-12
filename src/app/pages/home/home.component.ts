import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { PopularDestinationsComponent } from '../../shared/components/popular-destinations/popular-destinations.component';
import { TopDealsComponent } from '../../shared/components/top-deals/top-deals.component';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { CategoryCardsComponent } from '../../shared/components/category-cards/category-cards.component';
import { FeaturedDealsComponent } from '../../shared/components/featured-deals/featured-deals.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

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
    HeroBannerComponent,
    CategoryCardsComponent,
    FeaturedDealsComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', './home.component.css']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredDeals: Deal[] = [];
  isMenuOpen = false;

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
    this.loadFeaturedDeals();
  }

  loadCategories(): void {
    this.http.get<{ categories: Category[] }>('/assets/data/categories.json')
      .subscribe({
        next: (data) => {
          this.categories = data.categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  loadFeaturedDeals(): void {
    // Sample deals - replace with actual data from affiliate-links.json or API
    this.featuredDeals = [
      {
        id: '1',
        title: 'Flat 30% Off on Mumbai Hotels',
        description: 'Book luxury hotels in Mumbai and save big',
        platform: 'Booking.com',
        discount: '30% OFF',
        affiliateUrl: 'PLACEHOLDER_AFFILIATE_LINK',
        category: 'Hotels',
        expiryDate: '2025-12-31'
      },
      {
        id: '2',
        title: 'Delhi to Goa Flights Starting ₹2999',
        description: 'Limited time offer on domestic flights',
        platform: 'Cleartrip',
        discount: '₹2999',
        affiliateUrl: 'PLACEHOLDER_AFFILIATE_LINK',
        category: 'Flights',
        expiryDate: '2025-12-20'
      },
      {
        id: '3',
        title: 'Full Body Checkup @ ₹999',
        description: 'Comprehensive health package with 60+ tests',
        platform: 'Healthians',
        discount: '50% OFF',
        affiliateUrl: 'PLACEHOLDER_AFFILIATE_LINK',
        category: 'Health',
        expiryDate: '2025-12-25'
      }
    ];
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
}
