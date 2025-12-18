import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  submissionId?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/api/contact/submit';
  
  // Use production API if available
  private productionApiUrl = 'https://tripsaver-backend.onrender.com/api/contact/submit';

  constructor(private http: HttpClient) {
    // Auto-detect environment
    const isProduction = window.location.hostname !== 'localhost';
    if (isProduction) {
      this.apiUrl = this.productionApiUrl;
    }
  }

  submitContactForm(formData: ContactFormData): Observable<ContactSubmissionResponse> {
    return this.http.post<ContactSubmissionResponse>(this.apiUrl, formData);
  }
}
