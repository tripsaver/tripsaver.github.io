import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
  private apiUrl = `${environment.apiBaseUrl}/api/contact/submit`;

  constructor(private http: HttpClient) {
    console.log(`✅ ContactService initialized with API URL: ${this.apiUrl}`);
  }

  submitContactForm(formData: ContactFormData): Observable<ContactSubmissionResponse> {
    return this.http.post<ContactSubmissionResponse>(this.apiUrl, formData);
  }
}
