import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeoService } from './core/services/seo/seo.service';
import { SearchBarComponent } from './shared/components/search-bar/search-bar.component';
import { PopularDestinationsComponent } from './shared/components/popular-destinations/popular-destinations.component';
import { TopDealsComponent } from './shared/components/top-deals/top-deals.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SearchBarComponent, PopularDestinationsComponent, TopDealsComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('hotel-affiliate');
  constructor(private seo: SeoService) {
    this.seo.setTitle('TripSaver — Save on Hotels & Deals');
    this.seo.setMetaTags([
      { name: 'description', content: 'Find the best hotel deals, compare prices from top providers and save on your next trip with TripSaver.' },
      { name: 'keywords', content: 'hotels, hotel deals, booking, TripSaver' }
    ]);
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'TripSaver',
      'url': 'https://example.com/'
    });
  }
}
