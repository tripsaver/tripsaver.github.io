import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AffiliateService } from '../../core/services/affiliate/affiliate.service';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold mb-2">Hotel Search Results</h1>
      <p class="text-gray-600 mb-4" *ngIf="q">Results for <strong>"{{q}}"</strong></p>
      <div *ngIf="!q" class="bg-blue-50 p-4 rounded-lg text-blue-900">Enter a search query to find hotels.</div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div *ngFor="let h of hotels" class="card p-4 border border-gray-200">
          <img [src]="h.image" alt="{{h.name}}" loading="lazy" class="w-full h-40 object-cover rounded-lg mb-3">
          <h3 class="text-lg font-bold mb-1">{{h.name}}</h3>
          <p class="text-sm text-gray-600 mb-3">{{h.location}}</p>
          
          <!-- Price Summary -->
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg mb-3">
            <div *ngIf="h.bestPrice" class="flex items-center justify-between">
              <div>
                <small class="text-gray-600">Best Price</small>
                <div class="text-xl font-bold text-blue-600">₹{{h.bestPrice}}</div>
                <small class="text-gray-500">via {{h.bestProvider}}</small>
              </div>
              <button (click)="toggleCompare(h)" class="text-xs bg-white px-2 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold">
                {{h.showCompare ? '▼ Hide' : '▶ Compare'}}
              </button>
            </div>
          </div>

          <!-- Compare Prices (Expandable) -->
          <div *ngIf="h.showCompare && h.prices" class="mb-3 border-t pt-3">
            <h4 class="text-sm font-semibold mb-2">All Provider Prices</h4>
            <div class="space-y-2">
              <div *ngFor="let p of h.prices" class="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                <span class="font-medium">{{p.provider}}</span>
                <span class="font-bold text-gray-900">₹{{p.price}}</span>
                <a [href]="p.url" target="_blank" rel="noopener" class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Book</a>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <a [routerLink]="['/hotel', h.id]" class="btn-primary flex-1 text-center">View Details</a>
            <a *ngIf="h.bestUrl" [href]="h.bestUrl" target="_blank" rel="noopener" class="btn-accent flex-1 text-center">Book Now</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HotelListComponent{
  q = '';
  hotels: any[] = [];
  constructor(private route: ActivatedRoute, private affiliate: AffiliateService){
    this.route.queryParams.subscribe(params=>{
      this.q = params['q'] || '';
      // mock hotels by query
      if(this.q){
        this.hotels = [
          { id: 'h1', name: this.q + ' Grand Hotel', location: this.q + ' city center', price: '₹3,200', image: '/assets/images/hotel-deal-1.jpg', showCompare: false },
          { id: 'h2', name: this.q + ' Resort', location: 'Near beach', price: '₹2,499', image: '/assets/images/hotel-deal-2.jpg', showCompare: false }
        ];

        // fetch affiliate prices for each hotel and attach bestPrice
        this.hotels.forEach(h => {
          this.affiliate.getPrices(h.id).then(prices => {
            h.prices = prices;
            const best = prices.reduce((a:any,b:any)=> a.price <= b.price ? a : b, prices[0]);
            h.bestPrice = best.price;
            h.bestProvider = best.provider;
            h.bestUrl = best.url;
          });
        });
      }
    });
  }

  toggleCompare(hotel: any) {
    hotel.showCompare = !hotel.showCompare;
  }
}
