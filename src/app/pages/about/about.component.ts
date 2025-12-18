import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.titleService.setTitle('About TripSaver - Data-Driven Travel Recommendations');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Learn about TripSaver - transparent, data-driven travel recommendations powered by intelligent scoring engines. No sponsored rankings, just smart travel decisions.'
    });
    this.metaService.updateTag({ 
      name: 'keywords', 
      content: 'about TripSaver, travel recommendations, data-driven travel, transparent travel platform, smart destinations'
    });
  }
}
    },
    {
      icon: 'verified',
      title: 'Trusted Partner',
      description: 'We partner with Agoda, a leading global hotel booking platform trusted by millions.'
    },
    {
      icon: 'attach_money',
      title: 'Save More',
      description: 'Get access to special Agoda offers and promotions that help you save on every booking.'
    },
    {
      icon: 'public',
      title: 'Worldwide Hotels',
      description: 'Access millions of properties worldwide through Agoda\'s extensive network.'
    }
  ];

  values = [
    {
      icon: '🎯',
      title: 'Transparency',
      description: 'We believe in complete transparency about how we work and earn.'
    },
    {
      icon: '💰',
      title: 'Value',
      description: 'Helping you get the best value for your money is our top priority.'
    },
    {
      icon: '🤝',
      title: 'Trust',
      description: 'Building long-term relationships based on trust and reliability.'
    },
    {
      icon: '⚡',
      title: 'Innovation',
      description: 'Constantly improving to provide you with the best experience.'
    }
  ];
}
