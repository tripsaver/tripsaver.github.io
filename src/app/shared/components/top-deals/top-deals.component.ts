import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgodaDataService, AgodaHotel } from '../../../core/services/agoda-data/agoda-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-top-deals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-deals.component.html',
  styleUrls: ['./top-deals.component.scss']
})
export class TopDealsComponent implements OnInit, OnDestroy {
  // Make Math available in template
  Math = Math;
  
  topDeals: AgodaHotel[] = [];
  loading = false;
  showSection = false;
  private destroy$ = new Subject<void>();

  constructor(private agodaService: AgodaDataService) {}

  ngOnInit(): void {
    // Always show section with immediate sample data
    this.showSection = true;
    this.loading = false;
    this.topDeals = this.getSampleDeals();
    
    // Skip CSV loading for now (can be enabled later when CSV is properly configured)
    console.info('✅ Displaying sample top deals');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTopDeals(): void {
    this.loading = true;

    // Get top rated hotels with best prices
    this.agodaService.getTopRatedHotels(8)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hotels: AgodaHotel[]) => {
          this.topDeals = hotels;
          this.loading = false;
          
          if (hotels.length === 0) {
            this.topDeals = this.getSampleDeals();
          }
        },
        error: (err) => {
          console.error('Error loading top deals:', err);
          this.loading = false;
          this.topDeals = this.getSampleDeals();
        }
      });
  }

  trackDealClick(hotel: AgodaHotel): void {
    console.log(`Top Deal Clicked: ${hotel.hotelName}`);
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  private getSampleDeals(): AgodaHotel[] {
    const sampleDeals = [
      { city: 'Dubai', country: 'UAE', hotel: 'Atlantis The Palm' },
      { city: 'Maldives', country: 'Maldives', hotel: 'Conrad Maldives' },
      { city: 'Phuket', country: 'Thailand', hotel: 'Banyan Tree Phuket' },
      { city: 'Santorini', country: 'Greece', hotel: 'Canaves Oia Hotel' },
      { city: 'Bora Bora', country: 'French Polynesia', hotel: 'Four Seasons Resort' },
      { city: 'Tokyo', country: 'Japan', hotel: 'Aman Tokyo' },
      { city: 'Jaipur', country: 'India', hotel: 'Rambagh Palace' },
      { city: 'Venice', country: 'Italy', hotel: 'Gritti Palace' }
    ];

    return sampleDeals.map((item, index) => ({
      hotelId: `deal-${index + 1}`,
      hotelName: item.hotel,
      city: item.city,
      country: item.country,
      rating: 4.5 + Math.random() * 0.5,
      reviewScore: 9.0 + Math.random(),
      numberOfReviews: Math.floor(2000 + Math.random() * 3000),
      priceFrom: Math.floor(100 + Math.random() * 300),
      currency: 'USD',
      imageUrl: `https://picsum.photos/seed/deal-${item.city}/500/350`,
      description: `Exclusive deal at ${item.hotel}`,
      amenities: ['Pool', 'Spa', 'Fine Dining', 'Butler Service'],
      coordinates: { latitude: 0, longitude: 0 },
      affiliateUrl: `https://www.agoda.com/search?city=${item.city}&cid=1955073`
    }));
  }
}
