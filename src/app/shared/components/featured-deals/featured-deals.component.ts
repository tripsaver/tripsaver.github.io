import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgodaDataService, AgodaHotel } from '../../../core/services/agoda-data/agoda-data.service';
import { getAgodaHotelLink } from '../../../core/config/agoda-affiliate.config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Deal {
  id: string;
  title: string;
  description: string;
  platform: string;
  discount: string;
  image?: string;
  affiliateUrl: string;
  category: string;
  originalPrice?: number;
  currentPrice?: number;
  currency?: string;
  location?: string;
  rating?: number;
}

@Component({
  selector: 'app-featured-deals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-deals.component.html',
  styleUrls: ['./featured-deals.component.scss']
})
export class FeaturedDealsComponent implements OnInit, OnDestroy {
  deals: Deal[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(private agodaService: AgodaDataService) {}

  ngOnInit(): void {
    if (this.agodaService.isDataSourceAvailable()) {
      this.loadAgodaDeals();
    } else {
      // Fallback sample deals
      this.loadSampleDeals();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAgodaDeals(): void {
    this.loading = true;

    // Get top deals: high discount, good ratings, popular cities
    this.agodaService.loadHotelData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hotels: AgodaHotel[]) => {
          // Filter and sort for best deals
          this.deals = hotels
            .filter(h => h.reviewScore >= 8 && h.priceFrom > 0)
            .sort((a, b) => b.reviewScore - a.reviewScore)
            .slice(0, 6)
            .map(hotel => this.convertHotelToDeal(hotel));
          
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading Agoda deals:', err);
          this.loadSampleDeals();
          this.loading = false;
        }
      });
  }

  convertHotelToDeal(hotel: AgodaHotel): Deal {
    const discountPercent = Math.floor(Math.random() * 30) + 20; // 20-50% for display
    
    return {
      id: hotel.hotelId,
      title: `${hotel.hotelName}`,
      description: `${hotel.city}, ${hotel.country} • ${hotel.rating}⭐ Hotel`,
      platform: 'Agoda',
      discount: `${discountPercent}% OFF`,
      image: hotel.imageUrl || `https://picsum.photos/seed/${hotel.hotelId}/400/300`,
      affiliateUrl: hotel.affiliateUrl,
      category: 'Hotels',
      originalPrice: hotel.priceFrom * (1 + discountPercent/100),
      currentPrice: hotel.priceFrom,
      currency: hotel.currency,
      location: `${hotel.city}, ${hotel.country}`,
      rating: hotel.rating
    };
  }

  loadSampleDeals(): void {
    // Fallback sample deals with Agoda links
    this.deals = [
      {
        id: '1',
        title: 'Luxury Hotels in Mumbai',
        description: 'Mumbai, India • 5⭐ Hotels',
        platform: 'Agoda',
        discount: '30% OFF',
        affiliateUrl: getAgodaHotelLink({ city: 'Mumbai' }),
        category: 'Hotels',
        location: 'Mumbai, India'
      },
      {
        id: '2',
        title: 'Beach Resorts in Goa',
        description: 'Goa, India • 4⭐ Resorts',
        platform: 'Agoda',
        discount: '25% OFF',
        affiliateUrl: getAgodaHotelLink({ city: 'Goa' }),
        category: 'Hotels',
        location: 'Goa, India'
      },
      {
        id: '3',
        title: 'Heritage Hotels in Jaipur',
        description: 'Jaipur, India • 5⭐ Heritage',
        platform: 'Agoda',
        discount: '35% OFF',
        affiliateUrl: getAgodaHotelLink({ city: 'Jaipur' }),
        category: 'Hotels',
        location: 'Jaipur, India'
      }
    ];
  }

  onDealClick(deal: Deal): void {
    console.log('Deal clicked:', deal.title);
    window.open(deal.affiliateUrl, '_blank', 'noopener,noreferrer');
  }

  getDaysRemaining(expiryDate?: string): number | null {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }
}
