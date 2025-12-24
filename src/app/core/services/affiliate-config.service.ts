import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { tap, catchError, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AffiliatePartner {
  id: string;
  name: string;
  logo: string;
  baseUrl: string;
  affiliateId: string;
  commission?: number;
  active: boolean;
  description?: string;
  type: 'hotel' | 'shopping' | 'bus' | 'both';
}

export interface AffiliateConfigData {
  _id?: string;
  activePartner: string;
  partners: { [key: string]: AffiliatePartner };
  lastUpdated?: string;
  updatedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AffiliateConfigService {
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.apiBaseUrl}/api/affiliate-config`;
  
  private configSubject = new BehaviorSubject<AffiliateConfigData | null>(null);
  public config$ = this.configSubject.asObservable();

  constructor() {
    console.log(`✅ AffiliateConfigService initialized with API URL: ${this.apiUrl}`);
    this.loadConfig();
  }

  /**
   * Initialize affiliate config if not exists
   */
  initConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/init`).pipe(
      tap(result => {
        console.log('✅ Affiliate config initialized:', result);
      }),
      catchError(err => {
        console.warn('⚠️ Failed to initialize affiliate config:', err);
        throw err;
      })
    );
  }

  /**
   * Load affiliate configuration from MongoDB
   */
  loadConfig(): Observable<AffiliateConfigData> {
    return this.http.get<AffiliateConfigData>(this.apiUrl).pipe(
      tap(config => {
        console.log('✅ Affiliate config loaded from MongoDB:', config);
        this.configSubject.next(config);
      }),
      catchError(err => {
        console.warn('⚠️ Failed to load affiliate config:', err);
        throw err;
      })
    );
  }

  /**
   * Get current config synchronously if loaded
   */
  getCurrentConfig(): AffiliateConfigData | null {
    return this.configSubject.value;
  }

  /**
   * Wait for config to load (useful for initialization)
   */
  async waitForConfig(): Promise<AffiliateConfigData> {
    const current = this.configSubject.value;
    if (current) {
      return current;
    }
    return firstValueFrom(
      this.config$.pipe(
        filter((config): config is AffiliateConfigData => config !== null)
      )
    );
  }

  /**
   * Update affiliate configuration in MongoDB
   */
  updateConfig(config: Partial<AffiliateConfigData>): Observable<any> {
    return this.http.post<any>(this.apiUrl, config).pipe(
      tap(result => {
        console.log('✅ Affiliate config updated:', result);
        this.loadConfig();
      }),
      catchError(err => {
        console.error('❌ Failed to update config:', err);
        throw err;
      })
    );
  }

  /**
   * Update specific affiliate ID in MongoDB
   */
  updateAffiliateId(partnerId: string, affiliateId: string): Observable<any> {
    return this.http
      .patch<any>(`${this.apiUrl}/${partnerId}`, { affiliateId })
      .pipe(
        tap(result => {
          console.log(`✅ Affiliate ID updated for ${partnerId}:`, result);
          this.loadConfig();
        }),
        catchError(err => {
          console.error(`❌ Failed to update affiliate ID for ${partnerId}:`, err);
          throw err;
        })
      );
  }

  /**
   * Get active partner from config
   */
  getActivePartner(): string | null {
    return this.configSubject.value?.activePartner || null;
  }

  /**
   * Get affiliate ID for partner
   */
  getAffiliateId(partnerId: string): string | null {
    return this.configSubject.value?.partners[partnerId]?.affiliateId || null;
  }

  /**
   * Set active partner
   */
  setActivePartner(partnerId: string): Observable<any> {
    return this.updateConfig({ activePartner: partnerId });
  }
}
