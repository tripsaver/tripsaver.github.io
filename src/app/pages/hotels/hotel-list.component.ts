import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AffiliateService } from '../../core/services/affiliate/affiliate.service';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container results-page">
      <h1 class="page-title">Hotel Search Results</h1>
      <p class="subtitle" *ngIf="q">Results for <strong>"{{q}}"</strong></p>
      <div *ngIf="!q" class="empty-note">Enter a search query to find hotels.</div>

      <div class="results-grid mt-6">
        <article *ngFor="let h of hotels" class="result-card card">
          <div class="result-media">
            <img [src]="h.image || ('https://picsum.photos/seed/'+h.id+'/600/400')" alt="{{h.name}}" loading="lazy">
          </div>
          <div class="result-body">
            <h3 class="result-title">{{h.name}}</h3>
            <p class="result-location">{{h.location}}</p>

            <div class="price-box">
              <div class="price-left">
                <small>Best Price</small>
                <div class="price">₹{{h.bestPrice || '––'}}</div>
                <small class="provider">via {{h.bestProvider || '—'}}</small>
              </div>
              <button (click)="toggleCompare(h)" class="compare-toggle">{{h.showCompare ? 'Hide ▴' : 'Compare ▸'}}</button>
            </div>

            <div *ngIf="h.showCompare && h.prices" class="compare-list">
              <div *ngFor="let p of h.prices" class="compare-row">
                <span class="provider-name">{{p.provider}}</span>
                <span class="provider-price">₹{{p.price}}</span>
                <a [href]="p.url" target="_blank" rel="noopener" class="provider-book">Book</a>
              </div>
            </div>

            <div class="result-actions">
              <a [routerLink]="['/hotel', h.id]" class="btn btn-primary">View Details</a>
              <a *ngIf="h.bestUrl" [href]="h.bestUrl" target="_blank" rel="noopener" class="btn btn-accent">Book Now</a>
            </div>
          </div>
        </article>
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
