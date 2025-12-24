import { Injectable } from '@angular/core';

export interface PriceEntry { provider: string; price: number; currency?: string; url?: string }

@Injectable({ providedIn: 'root' })
export class AffiliateService {
  // Get all active hotel partners from config
  private hotelPartners: any[] = [];

  /**
   * Get hotel prices from all active affiliate partners
   * @param hotelId Hotel identifier
   * @returns Promise with price entries from all partners
   */
  getPrices(hotelId: string): Promise<PriceEntry[]> {
    // In production, replace with real API calls to partner APIs
    // For now, return mock data with affiliate links
    const prices: PriceEntry[] = this.hotelPartners.map((partner: any, index: number) => ({
      provider: partner.name,
      price: 3200 + (index * 100), // Mock prices
      currency: 'INR',
      url: this.buildAffiliateLink(partner.id, hotelId)
    }));

    return Promise.resolve(prices);
  }

  /**
   * Build affiliate link for a given provider and hotel
   * @param providerId Provider ID (agoda, amazon, booking, etc)
   * @param hotelId Hotel identifier
   * @returns Formatted affiliate URL
   */
  buildAffiliateLink(providerId: string, hotelId: string): string {
    const partner = AFFILIATE_CONFIG[providerId];

    if (!partner || !partner.active) {
      console.warn(`Partner ${providerId} not found or inactive`);
      return '';
    }

    let params = '';

    // Provider-specific parameter formatting
    switch (providerId) {
      case 'amazon':
        // Amazon uses 'k' for search and 'tag' for affiliate ID
        const searchQuery = `hotel ${hotelId}`;
        params = `?k=${encodeURIComponent(searchQuery)}&tag=${partner.affiliateId}`;
        break;

      case 'agoda':
        // Agoda format
        params = `?affid=${partner.affiliateId}&hotel=${encodeURIComponent(hotelId)}`;
        break;

      case 'booking':
        // Booking.com format
        params = `?affiliate_id=${partner.affiliateId}&ss=${encodeURIComponent(hotelId)}`;
        break;

      case 'expedia':
        // Expedia format
        params = `?pwaLandingTest=UNSET&rfrr=${partner.affiliateId}`;
        break;

      default:
        // Generic format
        params = `?affid=${partner.affiliateId}&ref=${encodeURIComponent(hotelId)}`;
    }

    return partner.baseUrl + params;
  }

  /**
   * Get all active partners for UI display
   */
  getActivePartners() {
    return this.hotelPartners;
  }
}
