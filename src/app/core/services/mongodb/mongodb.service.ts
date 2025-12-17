import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, timeout } from 'rxjs';
import { Destination } from '../../engines/destination/destinations.data';

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

@Injectable({
  providedIn: 'root'
})
export class MongoDBService {
  private http = inject(HttpClient);

  /** Backend base URL (Render) */
  private readonly BASE_URL = 'https://tripsaver-github-io.onrender.com';

  /**
   * Get all destinations
   */
  getAllDestinations(): Observable<Destination[]> {
    return this.http
      .get<Destination[]>(`${this.BASE_URL}/api/destinations`)
      .pipe(
        timeout(5000),
        catchError(err => {
          console.error('❌ Failed to load destinations', err);
          return of([]);
        })
      );
  }

  /**
   * Get single destination by ID
   */
  getDestination(id: string): Observable<Destination | null> {
    return this.http
      .get<Destination>(`${this.BASE_URL}/api/destinations/${id}`)
      .pipe(
        timeout(5000),
        catchError(err => {
          console.error(`❌ Failed to load destination ${id}`, err);
          return of(null);
        })
      );
  }

  /**
   * Search destinations
   */
  searchDestinations(query: string): Observable<Destination[]> {
    return this.http
      .post<Destination[]>(`${this.BASE_URL}/api/search`, { query })
      .pipe(
        timeout(5000),
        catchError(err => {
          console.error('❌ Search failed', err);
          return of([]);
        })
      );
  }

  /**
   * Get destinations by month
   * (Backend filter can be added later)
   */
  getDestinationsByMonth(month: number): Observable<Destination[]> {
    return this.http
      .get<Destination[]>(`${this.BASE_URL}/api/destinations`)
      .pipe(
        timeout(5000),
        catchError(err => {
          console.error(`❌ Failed to load destinations for month ${month}`, err);
          return of([]);
        })
      );
  }

  /**
   * Get trust badges
   * (Optional – requires backend collection)
   */
  getTrustBadges(): Observable<TrustBadge[]> {
    return this.http
      .get<TrustBadge[]>(`${this.BASE_URL}/api/trust-badges`)
      .pipe(
        timeout(5000),
        catchError(err => {
          console.warn('⚠️ Trust badges not available', err);
          return of([]);
        })
      );
  }

  /**
   * Get trust messages
   */
  getTrustMessages(category?: string): Observable<TrustMessage[]> {
    const url = category
      ? `${this.BASE_URL}/api/trust-messages?category=${category}`
      : `${this.BASE_URL}/api/trust-messages`;

    return this.http
      .get<TrustMessage[]>(url)
      .pipe(
        timeout(5000),
        catchError(err => {
          console.warn('⚠️ Trust messages not available', err);
          return of([]);
        })
      );
  }
}
