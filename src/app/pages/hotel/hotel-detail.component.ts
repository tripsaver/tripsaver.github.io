import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AffiliateService, PriceEntry } from '../../core/services/affiliate/affiliate.service';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <img src="/assets/images/hotel-deal-1.jpg" alt="hotel" loading="lazy" class="w-full h-96 object-cover rounded-lg mb-4">
        <h1 class="text-4xl font-bold mb-2">{{name}}</h1>
        <p class="text-gray-600 mb-6">{{location}}</p>
        
        <section class="mb-8">
          <h3 class="text-2xl font-bold mb-3">Overview</h3>
          <p class="text-gray-700 leading-relaxed">A comfortable stay with modern amenities and excellent service.</p>
        </section>
        
        <section>
          <h3 class="text-2xl font-bold mb-3">Amenities</h3>
          <ul class="grid grid-cols-2 gap-2">
            <li class="flex items-center gap-2"><span class="text-green-600">✓</span> Free Wi-Fi</li>
            <li class="flex items-center gap-2"><span class="text-green-600">✓</span> Breakfast</li>
            <li class="flex items-center gap-2"><span class="text-green-600">✓</span> Pool</li>
            <li class="flex items-center gap-2"><span class="text-green-600">✓</span> Parking</li>
          </ul>
        </section>
      </div>
      
      <aside class="card p-6 border border-gray-200">
        <h3 class="text-xl font-bold mb-4">Prices & Booking</h3>
        <div *ngIf="prices.length" class="space-y-3">
          <div *ngFor="let p of prices" class="p-3 bg-slate-50 rounded-lg border border-gray-200">
            <div class="flex justify-between items-center mb-2">
              <span class="font-semibold text-gray-900">{{p.provider}}</span>
              <span class="text-lg font-bold text-blue-600">₹{{p.price}}</span>
            </div>
            <a [href]="p.url" target="_blank" rel="noopener" class="btn-primary w-full text-center block">Book on {{p.provider}}</a>
          </div>
        </div>
        <div *ngIf="!prices.length" class="text-gray-500 text-sm">Loading prices...</div>
      </aside>
    </div>
  `
})
export class HotelDetailComponent{
  id = '';
  name = 'Hotel';
  location = '';
  prices: PriceEntry[] = [];
  constructor(private route: ActivatedRoute, private affiliate: AffiliateService){
    this.route.params.subscribe(p=>{ this.id = p['id']; this.name = 'Hotel ' + this.id; this.location = 'City center';
      this.affiliate.getPrices(this.id).then(r=> this.prices = r);
    });
  }
}
