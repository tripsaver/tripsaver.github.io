import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgodaDataService, AgodaHotel } from '../../../core/services/agoda-data/agoda-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
    
    if (this.agodaService.isDataSourceAvailable()) {
      this.loadPopularDestinations();
    } else {
      this.loading = false;
      this.loadSampleDestinations();
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hotels) => {
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
          }).filter(d => d.topHotel); // Only show cities with hotels in our data

          // Take top 6 destinations
          this.destinations = this.destinations.slice(0, 6);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading destinations:', error);
          this.loadSampleDestinations();
          this.loading = false;
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
