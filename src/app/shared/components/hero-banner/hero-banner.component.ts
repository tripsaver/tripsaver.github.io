import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss']
})
export class HeroBannerComponent {
  quickLinks = [
    { name: 'Hotels', icon: 'hotel', url: '/hotels', isRoute: true },
    { name: 'Flights', icon: 'flight', url: '/flights', isRoute: true },
    { name: 'Deals', icon: 'local_offer', url: '/deals', isRoute: true },
    { name: 'Contact', icon: 'contact_mail', url: '/contact', isRoute: true }
  ];

  constructor(private router: Router) {}

  onQuickLinkClick(url: string): void {
    // Check if it's a route or scroll anchor
    if (url.startsWith('/')) {
      this.router.navigate([url]);
    } else {
      const element = document.querySelector(url);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  scrollToCategories(): void {
    const element = document.querySelector('#categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
