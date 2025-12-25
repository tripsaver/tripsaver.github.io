import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  trustPoints = [
    { icon: '🔒', text: 'No paid rankings' },
    { icon: '📊', text: 'Data-driven recommendations' },
    { icon: '🇮🇳', text: 'Focused on Indian travelers' }
  ];

  quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Hotels', path: '/hotels' },
    { label: 'Deals', path: '/deals' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  transparencyLinks = [
    { label: 'How Recommendations Work', path: '/how-it-works' },
    { label: 'Our Methodology', path: '/how-it-works' },
    { label: 'Data Sources', path: '/about' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Terms of Use', path: '/terms' },
    { label: 'Affiliate Disclosure', path: '/affiliate-disclosure' }
  ];

  contactEmail = 'tripsaver.help@gmail.com';
}
