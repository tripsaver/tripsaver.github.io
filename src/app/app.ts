import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SeoService } from './core/services/seo/seo.service';
import { FooterComponent } from './components/footer/footer.component';
import { InstantBookingBarComponent } from './components/instant-booking-bar/instant-booking-bar.component';
// Note: keep component imports local to pages that render them to avoid unused warnings

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FooterComponent, InstantBookingBarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected readonly title = signal('hotel-affiliate');
  
  constructor(
    private seo: SeoService,
    private router: Router
  ) {
    this.seo.setTitle('TripSaver — Save on Hotels & Deals');
    this.seo.setMetaTags([
      { name: 'description', content: 'Find the best hotel deals from top booking providers and save on your next trip with TripSaver.' },
      { name: 'keywords', content: 'hotels, hotel deals, booking, TripSaver' }
    ]);
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'TripSaver',
      'url': 'https://tripsaver.github.io/'
    });
  }

  ngOnInit() {
    // Handle 404.html redirect from GitHub Pages
    const params = new URLSearchParams(window.location.search);
    if (params.has('p')) {
      const path = '/' + params.get('p')?.replace(/^\//, '') || '/';
      const query = params.has('q') ? '?' + params.get('q') : '';
      this.router.navigateByUrl(path + query);
    }
  }
}
