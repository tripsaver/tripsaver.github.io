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
  topDeals: AgodaHotel[] = [];
  loading = false;
  showSection = false;
  private destroy$ = new Subject<void>();

  constructor(private agodaService: AgodaDataService) {}

  ngOnInit(): void {
    if (this.agodaService.isDataSourceAvailable()) {
      this.showSection = true;
      this.loadTopDeals();
    }
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
            this.showSection = false;
          }
        },
        error: (err) => {
          console.error('Error loading top deals:', err);
          this.loading = false;
          this.showSection = false;
        }
      });
  }

  trackDealClick(hotel: AgodaHotel): void {
    console.log(`Top Deal Clicked: ${hotel.hotelName}`);
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
