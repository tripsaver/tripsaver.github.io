import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of, timeout } from 'rxjs';
import { Destination } from '../../engines/destination/destinations.data';

interface MongoDocument {
  _id: string;
  [key: string]: any;
}

interface MongoResponse<T> {
  documents: T[];
}

interface TrustBadge {
  _id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

interface TrustMessage {
  _id: string;
  message: string;
  category: string;
  order: number;
}

@Injectable()
export class MongoDBService {
  private http = inject(HttpClient);

  private readonly CONFIG = {
    dataApiUrl: 'https://ap-south-1.aws.data.mongodb-api.com/app/gzggipjk/endpoint/data/v1',
    apiKey: 'VFPCzeFPD5k38njwbVmpf2vXvwdlQsGpmNY7OTfeTwRE6wJWh9Ht0cpLjN18Cww8',
    dataSource: 'Cluster0',
    database: 'tripsaver'
  };

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': this.CONFIG.apiKey
    });
  }

  /**
   * Get all destinations from MongoDB
   * Uses CORS proxy for GitHub Pages compatibility
   * Includes 5-second timeout to prevent hanging
   */
  getAllDestinations(): Observable<Destination[]> {
    const mongoUrl = `${this.CONFIG.dataApiUrl}/action/find`;
    const body = {
      dataSource: this.CONFIG.dataSource,
      database: this.CONFIG.database,
      collection: 'destinations'
    };

    // Try direct MongoDB API first (with 5-second timeout)
    return this.http.post<MongoResponse<Destination>>(
      mongoUrl,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      timeout(5000), // 5-second timeout
      map(response => {
        console.log('✅ MongoDB Direct API Response:', response);
        return response.documents || [];
      }),
      catchError(error => {
        console.error('❌ Direct API failed:', error.status || 'timeout');
        console.warn('⚠️ Trying CORS Proxy...');
        
        // If direct fails, try CORS proxy (with 5-second timeout)
        const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${mongoUrl}`;
        
        return this.http.post<MongoResponse<Destination>>(
          corsProxyUrl,
          body,
          { headers: this.getHeaders() }
        ).pipe(
          timeout(5000), // 5-second timeout for proxy
          map(response => {
            console.log('✅ CORS Proxy Response:', response);
            return response.documents || [];
          }),
          catchError(proxyError => {
            console.error('❌ CORS Proxy also failed:', proxyError.status || 'timeout');
            console.warn('⚠️ Falling back to static data');
            return of([]);
          })
        );
      })
    );
  }

  /**
   * Get a single destination by ID
   */
  getDestination(id: string): Observable<Destination | null> {
    const body = {
      dataSource: this.CONFIG.dataSource,
      database: this.CONFIG.database,
      collection: 'destinations',
      filter: { _id: id }
    };

    return this.http.post<MongoResponse<Destination>>(
      `${this.CONFIG.dataApiUrl}/action/findOne`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.documents[0] || null),
      catchError(error => {
        console.error(`Error fetching destination ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Search destinations by filters
   */
  searchDestinations(filters: {
    categories?: string[];
    budget?: string;
    climate?: string;
    state?: string;
  }): Observable<Destination[]> {
    const filter: any = {};

    if (filters.categories && filters.categories.length > 0) {
      filter.categories = { $in: filters.categories };
    }
    if (filters.budget) {
      filter.budget = filters.budget;
    }
    if (filters.climate) {
      filter.climate = filters.climate;
    }
    if (filters.state) {
      filter.state = filters.state;
    }

    return this.http.post<MongoResponse<Destination>>(
      '/api/mongo/search',
      { filter }
    ).pipe(
      map(response => response.documents),
      catchError(error => {
        console.error('Error searching destinations:', error);
        return of([]);
      })
    );
  }

  /**
   * Get destinations by month (best time to visit)
   */
  getDestinationsByMonth(month: number): Observable<Destination[]> {
    const body = {
      dataSource: this.CONFIG.dataSource,
      database: this.CONFIG.database,
      collection: 'destinations',
      filter: {
        bestMonths: { $in: [month] }
      }
    };

    return this.http.post<MongoResponse<Destination>>(
      `${this.CONFIG.dataApiUrl}/action/find`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.documents),
      catchError(error => {
        console.error(`Error fetching destinations for month ${month}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get trust badges for building credibility
   */
  getTrustBadges(): Observable<TrustBadge[]> {
    const body = {
      dataSource: this.CONFIG.dataSource,
      database: this.CONFIG.database,
      collection: 'trust_badges',
      sort: { order: 1 }
    };

    return this.http.post<MongoResponse<TrustBadge>>(
      `${this.CONFIG.dataApiUrl}/action/find`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.documents),
      catchError(error => {
        console.error('Error fetching trust badges:', error);
        return of([]);
      })
    );
  }

  /**
   * Get trust messages for building credibility
   */
  getTrustMessages(category?: string): Observable<TrustMessage[]> {
    const filter = category ? { category } : {};

    const body = {
      dataSource: this.CONFIG.dataSource,
      database: this.CONFIG.database,
      collection: 'trust_messages',
      filter,
      sort: { order: 1 }
    };

    return this.http.post<MongoResponse<TrustMessage>>(
      `${this.CONFIG.dataApiUrl}/action/find`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.documents),
      catchError(error => {
        console.error('Error fetching trust messages:', error);
        return of([]);
      })
    );
  }
}
