import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { AnalyticsService } from '../../core/services/analytics/analytics.service';
import { ContactService } from '../../core/services/contact/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    private analytics: AnalyticsService,
    private contactService: ContactService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Contact Us - TripSaver Customer Support');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Get in touch with TripSaver for any questions about hotel and flight bookings. Email us at support@tripsaver.com or call +91 80 1234 5678.' 
    });
  }

  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  submitForm() {
    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    console.log('📤 Contact form submitted:', this.formData);
    
    this.contactService.submitContactForm(this.formData).subscribe({
      next: (response) => {
        console.log('✅ Contact form submitted successfully:', response);
        this.submitSuccess = true;
        
        // Track form submission
        this.analytics.trackFormSubmission('contact_form', true);
        
        // Show success message
        alert('Thank you for contacting us! We will get back to you soon.');
        
        // Reset form
        this.resetForm();
        this.isSubmitting = false;
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);
      },
      error: (error) => {
        console.error('❌ Contact form submission failed:', error);
        this.submitError = error.error?.error || 'Failed to submit contact form. Please try again.';
        this.isSubmitting = false;
        
        // Track failed submission
        this.analytics.trackFormSubmission('contact_form', false);
      }
    });
  }

  resetForm() {
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}

