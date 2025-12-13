import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgodaDataService, AgodaHotel } from '../../../core/services/agoda-data/agoda-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-agoda-hotels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agoda-hotels.component.html',
  styleUrls: ['./agoda-hotels.component.scss']
})
export class AgodaHotelsComponent implements OnInit, OnDestroy {
  featuredHotels: AgodaHotel[] = [];
  loading = false;
  error: string | null = null;
  showSection = false; // Only show if data source is configured
  private destroy$ = new Subject<void>();

  constructor(private agodaService: AgodaDataService) {}

  ngOnInit(): void {
    // Always show section
    this.showSection = true;
    
    // Try to load real data, fall back to sample data
    if (this.agodaService.isDataSourceAvailable()) {
      this.loadFeaturedHotels();
    } else {
      // Show sample hotels if no data source
      this.loading = false;
      this.featuredHotels = this.getSampleHotels();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeaturedHotels(): void {
    this.loading = true;
    this.error = null;

    this.agodaService.getFeaturedHotels(12)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hotels: AgodaHotel[]) => {
          this.loading = false;
          
          // Use real data if available, otherwise use sample data
          if (hotels.length === 0) {
            this.featuredHotels = this.getSampleHotels();
            console.info('ℹ️ No hotels data available. Showing sample hotels. Configure Google Drive link in agoda-affiliate.config.ts');
          } else {
            this.featuredHotels = hotels;
          }
        },
        error: (err) => {
          this.loading = false;
          // Show sample data on error
          this.featuredHotels = this.getSampleHotels();
          console.warn('Unable to load hotels data. Showing sample hotels.', err);
        }
      });
  }

  trackHotelClick(hotel: AgodaHotel): void {
    console.log(`Agoda Hotel Clicked: ${hotel.hotelName} (ID: ${hotel.hotelId})`);
    // Add analytics tracking here
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  private getSampleHotels(): AgodaHotel[] {
    const sampleCities = [
      { city: 'Mumbai', country: 'India', hotel: 'Taj Mahal Palace' },
      { city: 'Goa', country: 'India', hotel: 'Radisson Blu Resort' },
      { city: 'Dubai', country: 'UAE', hotel: 'Burj Al Arab Jumeirah' },
      { city: 'Bangkok', country: 'Thailand', hotel: 'Mandarin Oriental' },
      { city: 'Singapore', country: 'Singapore', hotel: 'Marina Bay Sands' },
      { city: 'Bali', country: 'Indonesia', hotel: 'Four Seasons Resort' },
      { city: 'Paris', country: 'France', hotel: 'Hotel Plaza Athénée' },
      { city: 'London', country: 'UK', hotel: 'The Savoy' },
      { city: 'New York', country: 'USA', hotel: 'The Plaza Hotel' },
      { city: 'Tokyo', country: 'Japan', hotel: 'Park Hyatt Tokyo' }
    ];

    return sampleCities.map((item, index) => ({
      hotelId: `sample-${index + 1}`,
      hotelName: item.hotel,
      city: item.city,
      country: item.country,
      rating: 4 + Math.random(),
      reviewScore: 8.5 + Math.random() * 1.5,
      numberOfReviews: Math.floor(1000 + Math.random() * 4000),
      priceFrom: Math.floor(80 + Math.random() * 220),
      currency: 'USD',
      imageUrl: `https://picsum.photos/seed/${item.city}/400/300`,
      description: `Experience luxury at ${item.hotel} in ${item.city}`,
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant'],
      coordinates: { latitude: 0, longitude: 0 },
      affiliateUrl: `https://www.agoda.com/search?city=${item.city}&cid=1955073`
    }));
  }
}
