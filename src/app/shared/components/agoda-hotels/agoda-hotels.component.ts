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
    // Only load if data source is available
    if (this.agodaService.isDataSourceAvailable()) {
      this.showSection = true;
      this.loadFeaturedHotels();
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
          this.featuredHotels = hotels;
          this.loading = false;
          
          // Hide section if no hotels found
          if (hotels.length === 0) {
            this.showSection = false;
            console.info('ℹ️ No hotels data available. Configure Google Drive link in agoda-affiliate.config.ts');
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Unable to load hotels. Please check your configuration.';
          this.showSection = false;
          console.error('Error loading hotels:', err);
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
}
