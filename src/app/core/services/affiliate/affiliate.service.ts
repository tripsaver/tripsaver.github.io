import { Injectable } from '@angular/core';

export interface PriceEntry { provider: string; price: number; currency?: string; url?: string }

@Injectable({ providedIn: 'root' })
export class AffiliateService {
  // Mock price comparison. In production replace with real provider API or your backend aggregator.
  getPrices(hotelId: string): Promise<PriceEntry[]> {
    return Promise.resolve([
      { provider: 'Agoda', price: 3200, currency: 'INR', url: this.buildAffiliateLink('agoda', hotelId) },
      { provider: 'Booking.com', price: 3350, currency: 'INR', url: this.buildAffiliateLink('booking', hotelId) },
      { provider: 'Expedia', price: 3310, currency: 'INR', url: this.buildAffiliateLink('expedia', hotelId) }
    ]);
  }

  buildAffiliateLink(provider: string, hotelId: string) {
    // Insert your affiliate id or tracking params here
    const domainMap: any = { agoda: 'https://www.agoda.com', booking: 'https://www.booking.com', expedia: 'https://www.expedia.co.in' };
    const base = domainMap[provider] || 'https://example.com';
    const params = `?affid=YOUR_AFFILIATE_ID&hotel=${encodeURIComponent(hotelId)}`;
    return base + params;
  }
}
