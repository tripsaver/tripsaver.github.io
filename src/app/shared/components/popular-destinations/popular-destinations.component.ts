import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgodaDataService, AgodaHotel } from '../../../core/services/agoda-data/agoda-data.service';
import { Subject, timeout } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { getAgodaHotelLink } from '../../../core/config/agoda-affiliate.config';

interface Destination {
  city: string;
  country: string;
  imageUrl: string;
  topHotel?: AgodaHotel;
  affiliateUrl: string;
}

@Component({
	selector: 'app-popular-destinations',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './popular-destinations.component.html',
	styleUrls: ['./popular-destinations.component.scss']
})
export class PopularDestinationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private agodaService = inject(AgodaDataService);

  destinations: Destination[] = [];
  loading = true;
  showSection = false;

  // Popular cities to showcase
  private popularCities = [
    { city: 'Goa', country: 'India' },
    { city: 'Dubai', country: 'UAE' },
    { city: 'Bangkok', country: 'Thailand' },
    { city: 'Singapore', country: 'Singapore' },
    { city: 'Bali', country: 'Indonesia' },
    { city: 'Paris', country: 'France' }
  ];

  ngOnInit(): void {
    // Always show section
    this.showSection = true;
    
    // Try to load real data from Agoda CSV
    if (this.agodaService.isDataSourceAvailable()) {
      this.loading = true;
      this.loadPopularDestinations();
    } else {
      // Use sample data only if CSV not configured
      this.loading = false;
      this.loadSampleDestinations();
      console.info('ℹ️ Agoda CSV not configured. Using sample destinations.');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPopularDestinations(): void {
    this.loading = true;
    
    // Load hotels for popular cities
    this.agodaService.loadHotelData()
      .pipe(
        timeout(8000), // 8 second timeout
        takeUntil(this.destroy$),
        catchError((error) => {
          console.warn('Failed to load destinations from CSV, using sample data:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (hotels) => {
          this.loading = false;
          
          if (hotels.length === 0) {
            // No data from CSV, use sample
            this.loadSampleDestinations();
            console.info('ℹ️ No destination data from CSV. Using sample destinations.');
            return;
          }
          
          this.destinations = this.popularCities.map(cityInfo => {
            // Find top-rated hotel for this city
            const cityHotels = hotels
              .filter(h => h.city?.toLowerCase() === cityInfo.city.toLowerCase())
              .sort((a, b) => (b.reviewScore || 0) - (a.reviewScore || 0));
            
            const topHotel = cityHotels[0];
            
            return {
              city: cityInfo.city,
              country: cityInfo.country,
              imageUrl: topHotel?.imageUrl || `https://picsum.photos/seed/${cityInfo.city}/400/280`,
              topHotel: topHotel,
              affiliateUrl: topHotel ? topHotel.affiliateUrl : getAgodaHotelLink({ city: cityInfo.city })
            };
          });

          // If no cities have hotels, use sample
          if (this.destinations.filter(d => d.topHotel).length === 0) {
            this.loadSampleDestinations();
            console.info('ℹ️ No matching cities in CSV. Using sample destinations.');
          } else {
            console.log(`✅ Loaded ${this.destinations.length} destinations from Agoda CSV`);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading destinations:', error);
          this.loadSampleDestinations();
        }
      });
  }

  private loadSampleDestinations(): void {
    // Fallback sample destinations with Agoda city links
    this.destinations = this.popularCities.slice(0, 6).map(cityInfo => ({
      city: cityInfo.city,
      country: cityInfo.country,
      imageUrl: `https://picsum.photos/seed/${cityInfo.city}/400/280`,
      affiliateUrl: getAgodaHotelLink({ city: cityInfo.city }),
      topHotel: undefined
    }));
    this.showSection = true;
    console.info('ℹ️ Showing sample destinations. Configure data source for real hotel data.');
  }

  trackDestinationClick(destination: Destination): void {
    console.log('Destination clicked:', destination.city);
  }
}
