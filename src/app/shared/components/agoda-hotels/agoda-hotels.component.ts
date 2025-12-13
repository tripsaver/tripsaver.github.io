import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgodaDataService, AgodaHotel } from '../../../core/services/agoda-data/agoda-data.service';
import { Subject, timeout } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
    
    // Try to load real data from Agoda CSV
    if (this.agodaService.isDataSourceAvailable()) {
      this.loading = true;
      this.loadFeaturedHotels();
    } else {
      // Use sample data only if CSV not configured
      this.loading = false;
      this.featuredHotels = this.getSampleHotels();
      console.info('ℹ️ Agoda CSV not configured. Using sample data.');
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
      .pipe(
        timeout(8000), // 8 second timeout
        takeUntil(this.destroy$),
        catchError((err) => {
          console.warn('Failed to load hotels from CSV, using sample data:', err);
          return of([]);
        })
      )
      .subscribe({
        next: (hotels: AgodaHotel[]) => {
          this.loading = false;
          
          // Use real data if available, otherwise use sample data
          if (hotels.length === 0) {
            this.featuredHotels = this.getSampleHotels();
            console.info('ℹ️ No hotels data from CSV. Using sample hotels.');
          } else {
            this.featuredHotels = hotels;
            console.log(`✅ Loaded ${hotels.length} hotels from Agoda CSV`);
          }
        },
        error: (err) => {
          this.loading = false;
          // Show sample data on error
          this.featuredHotels = this.getSampleHotels();
          console.warn('Error loading hotels, using sample data:', err);
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
