import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { AnalyticsService } from '../../core/services/analytics/analytics.service';

interface Destination {
  name: string;
  image: string;
  description: string;
  context: string; // Data-backed contextual info
  popularHotels: number;
  avgPrice: string;
  agodaUrl: string;
}

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.scss'
})
export class HotelsComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private analytics = inject(AnalyticsService);
  
  destinations: Destination[] = [];

  constructor() {
    this.initializeDestinations();
  }

  ngOnInit() {
    this.titleService.setTitle('Best Hotel Deals in India - Agoda | TripSaver');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Find and compare the best hotel deals in Goa, Bangalore, Manali, Ooty, and more. Book hotels at lowest prices on Agoda with exclusive deals.' 
    });
    this.metaService.updateTag({ 
      name: 'keywords', 
      content: 'hotel deals, cheap hotels, book hotels, Goa hotels, Bangalore hotels, Manali hotels, hotel booking India, Agoda hotels' 
    });
  }

  private initializeDestinations() {
    this.destinations = [
    {
      name: 'Goa',
      image: 'https://picsum.photos/400/300?random=1',
      description: 'Beautiful beaches, vibrant nightlife, and Portuguese heritage',
      context: 'Best value in Oct–Mar • High demand destination',
      popularHotels: 250,
      avgPrice: '₹2,500',
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=9558&cid=1955073', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Bangalore',
      image: 'https://picsum.photos/400/300?random=2',
      description: 'Garden city with pleasant weather and modern amenities',
      context: 'Business-friendly hotels • Year-round availability',
      popularHotels: 180,
      avgPrice: '₹3,000',
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=11304&cid=1955073', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Manali',
      image: 'https://picsum.photos/400/300?random=3',
      description: 'Stunning Himalayan views, adventure sports, and serene valleys',
      context: 'Peak rates May–Jun • Adventure-focused travelers',
      popularHotels: 120,
      avgPrice: '₹2,800',
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=11058&cid=1955073', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Ooty',
      image: 'https://picsum.photos/400/300?random=4',
      description: 'Queen of hill stations with tea gardens and cool climate',
      context: 'Most affordable hill station • Couples & families',
      popularHotels: 95,
      avgPrice: '₹2,200',
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=12640&cid=1955073', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Jaipur',
      image: 'https://picsum.photos/400/300?random=5',
      description: 'Pink city with majestic forts, palaces, and rich culture',
      context: 'Tourist hub • Budget hotels available',
      popularHotels: 150,
      avgPrice: '₹2,600',
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=11097&cid=1955073', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Kerala',
      image: 'https://picsum.photos/400/300?random=6',
      description: 'God\'s own country with backwaters, houseboats, and beaches',
      context: 'Best rates Dec–Feb • Houseboat bookings surge',
      popularHotels: 200,
      avgPrice: '₹3,200',
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=17249&cid=1955073', 'tripsaver_hotels', 'affiliate')
    }
    ];
  }

  trackAffiliateClick(platform: string, destination: string) {
    const dest = this.destinations.find(d => d.name === destination);
    this.analytics.trackAffiliateClick(
      platform,
      'hotel',
      destination,
      dest?.avgPrice
    );
  }
}
