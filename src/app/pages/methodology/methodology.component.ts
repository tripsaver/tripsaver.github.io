import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-methodology',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './methodology.component.html',
  styleUrl: './methodology.component.scss'
})
export class MethodologyComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  // Last updated timestamp for transparency
  lastUpdated = new Date('2025-12-18T00:00:00Z');
  lastUpdatedFormatted: string = '';

  engines = [
    {
      name: 'Destination Scoring Engine',
      version: '2.0.0',
      description: 'Intelligently scores destinations based on your preferences, timing, budget, and interests.',
      factors: [
        { name: 'Perfect Timing', weight: 36, description: 'Best months to visit vs. months to avoid' },
        { name: 'Budget Match', weight: 27, description: 'How well the destination fits your budget' },
        { name: 'Interest Match', weight: 23, description: 'Categories like beach, adventure, heritage' },
        { name: 'Climate Preference', weight: 14, description: 'Weather patterns you prefer' }
      ],
      totalPoints: 100,
      badges: ['Perfect Season', 'Budget Match', 'Perfect Match', 'Great Weather', 'Popular Choice']
    },
    {
      name: 'Trip Readiness Engine',
      version: '1.0.0',
      description: 'Evaluates your preparedness for travel across multiple dimensions.',
      factors: [
        { name: 'Budget Preparedness', weight: 25, description: 'Available vs. estimated trip cost' },
        { name: 'Document Readiness', weight: 25, description: 'Passport, visa, and travel documents' },
        { name: 'Timing & Planning', weight: 25, description: 'Lead time and booking flexibility' },
        { name: 'Seasonal Timing', weight: 25, description: 'Peak, off-peak, or shoulder season' }
      ],
      totalPoints: 100,
      statuses: ['Ready', 'Almost Ready', 'Needs Preparation', 'Not Ready']
    },
    {
      name: 'Recommendation Engine',
      version: '1.0.0',
      description: 'Master engine combining destination scoring and trip readiness for comprehensive recommendations.',
      factors: [
        { name: 'Destination Score', weight: 70, description: 'How well the destination matches preferences' },
        { name: 'Readiness Score', weight: 30, description: 'Your preparedness level' }
      ],
      totalPoints: 100,
      types: ['Highly Recommended', 'Recommended', 'Consider', 'Not Recommended']
    }
  ];

  methodology = {
    transparency: [
      'All scoring algorithms are open and explainable',
      'Every recommendation comes with clear reasoning',
      'No hidden biases or promotional preferences',
      'Data-driven decisions based on objective criteria'
    ],
    dataSources: [
      'MongoDB database with 45+ Indian destinations',
      'Seasonal weather patterns and best visit times',
      'Budget ranges based on real travel costs',
      'Category classifications from official tourism data'
    ],
    approach: [
      'Multi-factor scoring considering 10+ parameters',
      'Weighted algorithm prioritizing key factors',
      'Real-time data from MongoDB for accuracy',
      'Personalized based on individual preferences'
    ]
  };

  ngOnInit(): void {
    this.titleService.setTitle('Our Methodology - How TripSaver Works | TripSaver');
    this.metaService.updateTag({
      name: 'description',
      content: 'Transparent, data-driven travel recommendations. Learn how our engines score destinations and evaluate trip readiness.'
    });

    // Format last updated timestamp
    this.lastUpdatedFormatted = this.lastUpdated.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  }
}
