import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TrustConfig {
  heroSubtitle: string;
  trustBadge: string;
  affiliateDisclosure: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrustConfigService {
  private readonly CACHE_KEY = 'trust_config_cache';
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private readonly DEFAULT_CONFIG: TrustConfig = {
    heroSubtitle: 'Smart travel recommendations, ranked for you — not ads',
    trustBadge: 'Powered by trusted travel partners',
    affiliateDisclosure: 'We may earn a commission at no extra cost to you'
  };

  private config$ = new BehaviorSubject<TrustConfig>(this.DEFAULT_CONFIG);

  constructor(private http: HttpClient) {
    this.initializeConfig();
  }

  /**
   * Initialize config from cache or fetch from backend
   * Non-blocking - doesn't prevent app rendering
   */
  private initializeConfig(): void {
    const cached = this.getFromCache();
    
    if (cached) {
      this.config$.next(cached);
      return;
    }

    // Fetch in background (non-blocking)
    this.fetchFromBackend()
      .pipe(
        tap(config => this.config$.next(config)),
        catchError(err => {
          console.warn('⚠️ Failed to fetch trust config, using defaults:', err.message);
          return of(this.DEFAULT_CONFIG);
        })
      )
      .subscribe();
  }

  /**
   * Fetch trust messages and badges from backend
   */
  private fetchFromBackend() {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/trust-messages`).pipe(
      map((messages: any[]) => {
        const heroMsg = messages.find((m: any) => m.context === 'homepage_hero');
        const affiliateMsg = messages.find((m: any) => m.context === 'affiliate_disclosure');
        
        const config: TrustConfig = {
          heroSubtitle: heroMsg?.content || this.DEFAULT_CONFIG.heroSubtitle,
          trustBadge: this.DEFAULT_CONFIG.trustBadge,
          affiliateDisclosure: affiliateMsg?.content || this.DEFAULT_CONFIG.affiliateDisclosure
        };

        this.saveToCache(config);
        return config;
      }),
      tap((config: TrustConfig) => {
        this.config$.next(config);
      })
    );
  }

  /**
   * Get config as observable
   */
  getConfig() {
    return this.config$.asObservable();
  }

  /**
   * Get config value immediately (useful for templates)
   */
  getConfigValue(): TrustConfig {
    return this.config$.value;
  }

  /**
   * Get from localStorage cache
   */
  private getFromCache(): TrustConfig | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { config, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > this.CACHE_TTL;

      if (isExpired) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      return config as TrustConfig;
    } catch (err) {
      console.warn('⚠️ Cache read error:', err);
      return null;
    }
  }

  /**
   * Save to localStorage cache
   */
  private saveToCache(config: TrustConfig): void {
    try {
      localStorage.setItem(
        this.CACHE_KEY,
        JSON.stringify({
          config,
          timestamp: Date.now()
        })
      );
    } catch (err) {
      console.warn('⚠️ Cache write error:', err);
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    this.config$.next(this.DEFAULT_CONFIG);
  }
}
