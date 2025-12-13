import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, forkJoin } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { PARTNERS, buildPartnerUrl } from '../../config/partners.config';

export interface AgodaHotel {
  hotelId: string;
  hotelName: string;
  city: string;
  country: string;
  rating: number;
  reviewScore: number;
  numberOfReviews: number;
  priceFrom: number;
  currency: string;
  imageUrl: string;
  description: string;
  amenities: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  affiliateUrl: string;
}

export interface CityIndex {
  cities: {
    [cityName: string]: {
      filename: string;
      hotel_count: number;
      size_mb: number;
    }
  };
  total_cities: number;
  total_hotels: number;
  csv_headers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AgodaDataService {
  // CSV data sources (currently disabled - using sample data)
  private readonly DATA_PATH: string | undefined = undefined;
  private readonly INDEX_PATH: string | undefined = undefined;
  private readonly IS_GOOGLE_DRIVE = false;
  
  private cityIndex: CityIndex | null = null;
  private cityCache = new Map<string, AgodaHotel[]>();
  private allHotelsCache: AgodaHotel[] | null = null;

  constructor(private http: HttpClient) {
    // CSV data source is disabled - components use sample data
    console.info('ℹ️ Agoda data service initialized (using sample data in components)');
  }

  /**
   * Check if data source is properly configured
   */
  isDataSourceAvailable(): boolean {
    return false; // CSV data source disabled
  }

  /**
   * Load city index to see available cities (only for local split files)
   */
  private loadCityIndex(): Observable<CityIndex> {
    if (this.cityIndex) {
      return of(this.cityIndex);
    }

    if (!this.INDEX_PATH) {
      return of({ cities: {}, total_cities: 0, total_hotels: 0, csv_headers: [] });
    }
    
    return this.http.get<CityIndex>(this.INDEX_PATH).pipe(
      map((index: CityIndex) => {
        this.cityIndex = index;
        return index;
      }),
      catchError((error: any) => {
        console.error('Failed to load city index:', error);
        return of({ cities: {}, total_cities: 0, total_hotels: 0, csv_headers: [] });
      })
    );
  }

  /**
   * Load hotels for a specific city (only for local split files)
   */
  loadHotelsByCity(cityName: string): Observable<AgodaHotel[]> {
    // If Google Drive, can't load by city - load all and filter
    if (this.IS_GOOGLE_DRIVE) {
      return this.loadHotelData().pipe(
        map((hotels: AgodaHotel[]) => 
          hotels.filter((h: AgodaHotel) => 
            h.city.toLowerCase() === cityName.toLowerCase()
          )
        )
      );
    }

    // Check cache first
    if (this.cityCache.has(cityName)) {
      return of(this.cityCache.get(cityName)!);
    }

    return this.loadCityIndex().pipe(
      map((index: CityIndex) => {
        const cityInfo = index.cities[cityName];
        if (!cityInfo) {
          throw new Error(`City '${cityName}' not found in index`);
        }
        return cityInfo.filename;
      }),
      switchMap((filename: string) => {
        const csvPath = `${this.DATA_PATH}/${filename}`;
        return this.http.get(csvPath, { responseType: 'text' }).pipe(
          map((csvData: string) => {
            const hotels = this.parseCSV(csvData);
            this.cityCache.set(cityName, hotels);
            return hotels;
          })
        );
      }),
      catchError((error: any) => {
        console.error(`Failed to load hotels for ${cityName}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Load hotels from multiple cities
   */
  loadHotelsByCities(cityNames: string[]): Observable<AgodaHotel[]> {
    const observables = cityNames.map(city => 
      this.loadHotelsByCity(city).pipe(
        catchError((error: any) => {
          console.warn(`Failed to load hotels for ${city}:`, error);
          return of([]);
        })
      )
    );

    return forkJoin(observables).pipe(
      map((results: AgodaHotel[][]) => results.flat())
    );
  }

  /**
   * Get list of all available cities
   */
  getAvailableCities(): Observable<string[]> {
    return this.loadCityIndex().pipe(
      map((index: CityIndex) => Object.keys(index.cities).sort())
    );
  }

  /**
   * Load featured hotels from popular cities or Google Drive
   */
  loadHotelData(): Observable<AgodaHotel[]> {
    // Return empty if not configured
    if (!this.isDataSourceAvailable()) {
      console.warn('⚠️ Agoda data source not configured');
      return of([]);
    }

    // Check cache
    if (this.allHotelsCache) {
      return of(this.allHotelsCache);
    }

    // If Google Drive, load directly
    if (this.IS_GOOGLE_DRIVE) {
      return this.http.get(this.DATA_PATH!, { responseType: 'text' }).pipe(
        map((csvData: string) => {
          const hotels = this.parseCSV(csvData);
          this.allHotelsCache = hotels;
          return hotels;
        }),
        catchError((error: any) => {
          console.error('Failed to load hotels from Google Drive:', error);
          console.info('💡 Make sure your Google Drive link is publicly accessible');
          return of([]);
        })
      );
    }

    // Otherwise, load from local split files
    const popularCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Jaipur',
      'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Udaipur'
    ];
    
    return this.loadHotelsByCities(popularCities);
  }

  /**
   * Parse CSV data into structured hotel objects
   */
  private parseCSV(csvData: string): AgodaHotel[] {
    const lines = csvData.split('\n');
    const headers = this.parseCSVLine(lines[0]);
    const hotels: AgodaHotel[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = this.parseCSVLine(lines[i]);
      const hotel = this.mapToHotel(headers, values);
      if (hotel) {
        hotels.push(hotel);
      }
    }

    return hotels;
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Map CSV row to AgodaHotel object
   * Adjust field mappings based on actual CSV structure
   */
  private mapToHotel(headers: string[], values: string[]): AgodaHotel | null {
    try {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Map CSV columns to AgodaHotel interface
      // ADJUST THESE MAPPINGS based on your actual CSV column names
      return {
        hotelId: row['hotel_id'] || row['id'] || '',
        hotelName: row['hotel_name'] || row['name'] || '',
        city: row['city'] || '',
        country: row['country'] || '',
        rating: parseFloat(row['rating'] || row['star_rating'] || '0'),
        reviewScore: parseFloat(row['review_score'] || row['score'] || '0'),
        numberOfReviews: parseInt(row['number_of_reviews'] || row['reviews'] || '0'),
        priceFrom: parseFloat(row['price_from'] || row['price'] || '0'),
        currency: row['currency'] || 'USD',
        imageUrl: row['image_url'] || row['image'] || '',
        description: row['description'] || '',
        amenities: (row['amenities'] || '').split('|').filter((a: string) => a.trim()),
        coordinates: {
          latitude: parseFloat(row['latitude'] || row['lat'] || '0'),
          longitude: parseFloat(row['longitude'] || row['lng'] || '0')
        },
        affiliateUrl: this.buildAffiliateUrl(row['hotel_id'] || row['id'])
      };
    } catch (error) {
      console.error('Error parsing hotel row:', error);
      return null;
    }
  }

  /**
   * Build Agoda affiliate URL for a hotel using centralized config
   */
  private buildAffiliateUrl(hotelId: string): string {
    return buildPartnerUrl('agoda', 'hotels', { hotelId });
  }

  /**
   * Filter hotels by city (uses optimized city-based loading)
   */
  getHotelsByCity(city: string): Observable<AgodaHotel[]> {
    // Try exact city match first
    return this.loadHotelsByCity(city).pipe(
      catchError(() => {
        // Fallback: load from popular cities and filter
        return this.loadHotelData().pipe(
          map((hotels: AgodaHotel[]) => hotels.filter((h: AgodaHotel) => 
            h.city.toLowerCase().includes(city.toLowerCase())
          ))
        );
      })
    );
  }

  /**
   * Get top rated hotels
   */
  getTopRatedHotels(limit: number = 10): Observable<AgodaHotel[]> {
    return this.loadHotelData().pipe(
      map((hotels: AgodaHotel[]) => hotels
        .filter((h: AgodaHotel) => h.reviewScore > 0)
        .sort((a: AgodaHotel, b: AgodaHotel) => b.reviewScore - a.reviewScore)
        .slice(0, limit)
      )
    );
  }

  /**
   * Search hotels by name or city
   */
  searchHotels(query: string): Observable<AgodaHotel[]> {
    return this.loadHotelData().pipe(
      map((hotels: AgodaHotel[]) => hotels.filter((h: AgodaHotel) => 
        h.hotelName.toLowerCase().includes(query.toLowerCase()) ||
        h.city.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  /**
   * Get hotels by price range
   */
  getHotelsByPriceRange(min: number, max: number): Observable<AgodaHotel[]> {
    return this.loadHotelData().pipe(
      map((hotels: AgodaHotel[]) => hotels.filter((h: AgodaHotel) => 
        h.priceFrom >= min && h.priceFrom <= max
      ))
    );
  }

  /**
   * Get featured hotels (high rating + good reviews)
   */
  getFeaturedHotels(limit: number = 6): Observable<AgodaHotel[]> {
    return this.loadHotelData().pipe(
      map((hotels: AgodaHotel[]) => hotels
        .filter((h: AgodaHotel) => h.rating >= 4 && h.reviewScore >= 8 && h.numberOfReviews >= 50)
        .sort((a: AgodaHotel, b: AgodaHotel) => b.reviewScore - a.reviewScore)
        .slice(0, limit)
      )
    );
  }
}
