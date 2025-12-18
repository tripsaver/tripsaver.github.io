import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent {
  features = [
    {
      icon: 'map',
      title: 'Destination type',
      description: 'Domestic or international'
    },
    {
      icon: 'work',
      title: 'Travel purpose',
      description: 'Leisure or business'
    },
    {
      icon: 'hotel',
      title: 'Stay preference',
      description: 'Budget or luxury'
    },
    {
      icon: 'event_available',
      title: 'Flexibility needs',
      description: 'Free cancellation, pay at hotel'
    }
  ];

  recommendationFactors = [
    'Publicly available platform features',
    'Inventory focus and destination coverage',
    'Payment and cancellation options',
    'General travel use cases'
  ];

  benefits = [
    {
      icon: 'schedule',
      title: 'Save time choosing the right platform',
      description: 'Get a recommendation in 60 seconds instead of researching for hours'
    },
    {
      icon: 'block',
      title: 'Avoid unnecessary comparisons',
      description: 'Stop opening 10+ tabs and comparing endless options'
    },
    {
      icon: 'phone_android',
      title: 'Simple, fast, and mobile-friendly experience',
      description: 'Works perfectly on any device with a clean, distraction-free interface'
    },
    {
      icon: 'verified',
      title: 'Transparent affiliate links',
      description: 'Clear disclosures about how we earn commission from partner platforms'
    }
  ];
}
