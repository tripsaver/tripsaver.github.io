import { Injectable, inject } from '@angular/core';
import { Observable, map, of, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { AgodaDataService, AgodaHotel } from '../agoda-data/agoda-data.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AffiliateConfigService, AffiliateConfigData } from '../affiliate-config.service';

export interface SearchResult {
  hotelId: string;
  hotelName: string;
  city: string;
  country: string;
  rating: number;
  priceFrom: number;
  currency: string;
  imageUrl: string;
  agodaUrl: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private allHotels: AgodaHotel[] = [];
  private hotelsLoaded = false;
  private affiliateConfig: AffiliateConfigData | null = null;
  private affiliateConfigService = inject(AffiliateConfigService);

  constructor(
    private agodaService: AgodaDataService,
    private analytics: AnalyticsService
  ) {
    // Pre-load all hotels for instant search
    this.loadAllHotels();
    // Load affiliate config from MongoDB
    this.loadAffiliateConfig();
  }

  private loadAllHotels(): void {
    // Load all hotels from data source (Google Drive CSV or local files)
    this.agodaService.loadHotelData().subscribe({
      next: (hotels: AgodaHotel[]) => {
        this.allHotels = hotels;
        this.hotelsLoaded = true;
        console.log(`✅ Loaded ${hotels.length} hotels for search`);
      },
      error: (err: any) => {
        console.error('Failed to load hotels for search:', err);
        this.hotelsLoaded = false;
      }
    });
  }

  private loadAffiliateConfig(): void {
    // Load affiliate config from MongoDB
    this.affiliateConfigService.loadConfig().subscribe({
      next: (config: AffiliateConfigData) => {
        this.affiliateConfig = config;
        console.log('✅ Affiliate config loaded for search service');
      },
      error: (err: any) => {
        console.error('Failed to load affiliate config for search service:', err);
        this.affiliateConfig = null;
      }
    });
  }

  /**
   * Smart search that filters hotels by name, city, or country
   * @param query Search query string
   * @returns Observable array of SearchResult
   */
  searchHotels(query: string): Observable<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    const searchTerm = query.trim().toLowerCase();
    
    // Wait for hotels to load
    if (!this.hotelsLoaded || this.allHotels.length === 0) {
      return this.agodaService.loadHotelData().pipe(
        map((hotels: AgodaHotel[]) => {
          if (hotels.length === 0) {
            console.warn('⚠️ No hotels loaded for search');
          }
          return this.filterHotels(hotels, searchTerm);
        })
      );
    }

    return of(this.filterHotels(this.allHotels, searchTerm));
  }

  private filterHotels(hotels: AgodaHotel[], searchTerm: string): SearchResult[] {
    const filtered = hotels.filter(hotel => 
      hotel.hotelName.toLowerCase().includes(searchTerm) ||
      hotel.city.toLowerCase().includes(searchTerm) ||
      hotel.country.toLowerCase().includes(searchTerm)
    );

    // Sort by relevance: exact matches first, then by rating
    const sorted = filtered.sort((a, b) => {
      const aNameMatch = a.hotelName.toLowerCase().startsWith(searchTerm);
      const bNameMatch = b.hotelName.toLowerCase().startsWith(searchTerm);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return b.rating - a.rating;
    });

    // Limit to top 10 results for performance
    return sorted.slice(0, 10).map(hotel => this.mapToSearchResult(hotel));
  }

  private mapToSearchResult(hotel: AgodaHotel): SearchResult {
    const agodaUrl = this.buildAgodaUrl(hotel.hotelId, hotel.city);
    
    return {
      hotelId: hotel.hotelId,
      hotelName: hotel.hotelName,
      city: hotel.city,
      country: hotel.country,
      rating: hotel.rating,
      priceFrom: hotel.priceFrom,
      currency: hotel.currency,
      imageUrl: hotel.imageUrl,
      agodaUrl: agodaUrl
    };
  }

  private buildAgodaUrl(hotelId: string, city: string): string {
    // Build Agoda URL with affiliate ID from MongoDB
    const baseUrl = 'https://www.agoda.com';
    
    // Get Agoda affiliate ID from MongoDB config
    let agodaAffiliateId = '1955073'; // Fallback to known ID if config not loaded
    if (this.affiliateConfig && this.affiliateConfig.partners && this.affiliateConfig.partners.agoda) {
      agodaAffiliateId = this.affiliateConfig.partners.agoda.affiliateId;
    } else {
      console.warn('⚠️ Agoda affiliate config not loaded, using default');
    }
    
    let url: string;
    // Use hotel ID if available, otherwise search by city
    if (hotelId) {
      url = `${baseUrl}/hotel/${hotelId}.html?cid=${agodaAffiliateId}`;
    } else {
      const citySlug = city.toLowerCase().replace(/\s+/g, '-');
      url = `${baseUrl}/search?city=${encodeURIComponent(citySlug)}&cid=${agodaAffiliateId}`;
    }
    
    // Add UTM parameters for tracking
    return this.analytics.addUTMToUrl(url, 'tripsaver_search', 'smart_search');
  }

  /**
   * Get hotel by ID for direct navigation
   */
  getHotelById(hotelId: string): Observable<SearchResult | null> {
    if (!this.hotelsLoaded || this.allHotels.length === 0) {
      return this.agodaService.loadHotelData().pipe(
        map((hotels: AgodaHotel[]) => {
          const hotel = hotels.find((h: AgodaHotel) => h.hotelId === hotelId);
          return hotel ? this.mapToSearchResult(hotel) : null;
        })
      );
    }

    const hotel = this.allHotels.find(h => h.hotelId === hotelId);
    return of(hotel ? this.mapToSearchResult(hotel) : null);
  }
}
