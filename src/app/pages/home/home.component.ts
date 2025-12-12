import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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
}
