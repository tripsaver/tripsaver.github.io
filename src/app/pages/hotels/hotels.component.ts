import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { AnalyticsService } from '../../core/services/analytics/analytics.service';

interface Destination {
  name: string;
  image: string;
  description: string;
  popularHotels: number;
  avgPrice: string;
  bookingUrl: string;
  agodaUrl: string;
  mmtUrl: string;
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
    this.titleService.setTitle('Best Hotel Deals in India - Compare Prices | TripSaver');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Find and compare the best hotel deals in Goa, Bangalore, Manali, Ooty, and more. Book hotels at lowest prices on Booking.com, Agoda, and MakeMyTrip.' 
    });
    this.metaService.updateTag({ 
      name: 'keywords', 
      content: 'hotel deals, cheap hotels, book hotels, Goa hotels, Bangalore hotels, Manali hotels, hotel booking India' 
    });
  }

  private initializeDestinations() {
    this.destinations = [
    {
      name: 'Goa',
      image: 'https://picsum.photos/400/300?random=1',
      description: 'Beautiful beaches, vibrant nightlife, and Portuguese heritage',
      popularHotels: 250,
      avgPrice: '₹2,500',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/searchresults.html?ss=Goa&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=9558&cid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/hotels/hotels-in-goa.html?campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Bangalore',
      image: 'https://picsum.photos/400/300?random=2',
      description: 'Garden city with pleasant weather and modern amenities',
      popularHotels: 180,
      avgPrice: '₹3,000',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/searchresults.html?ss=Bangalore&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=11304&cid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/hotels/hotels-in-bangalore.html?campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Manali',
      image: 'https://picsum.photos/400/300?random=3',
      description: 'Stunning Himalayan views, adventure sports, and serene valleys',
      popularHotels: 120,
      avgPrice: '₹2,800',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/searchresults.html?ss=Manali&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=11058&cid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/hotels/hotels-in-manali.html?campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Ooty',
      image: 'https://picsum.photos/400/300?random=4',
      description: 'Queen of hill stations with tea gardens and cool climate',
      popularHotels: 95,
      avgPrice: '₹2,200',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/searchresults.html?ss=Ooty&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=12640&cid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/hotels/hotels-in-ooty.html?campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Jaipur',
      image: 'https://picsum.photos/400/300?random=5',
      description: 'Pink city with majestic forts, palaces, and rich culture',
      popularHotels: 150,
      avgPrice: '₹2,600',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/searchresults.html?ss=Jaipur&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=11097&cid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/hotels/hotels-in-jaipur.html?campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate')
    },
    {
      name: 'Kerala',
      image: 'https://picsum.photos/400/300?random=6',
      description: 'God\'s own country with backwaters, houseboats, and beaches',
      popularHotels: 200,
      avgPrice: '₹3,200',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/searchresults.html?ss=Kerala&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      agodaUrl: this.analytics.addUTMToUrl('https://www.agoda.com/search?city=17249&cid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/hotels/hotels-in-kerala.html?campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_hotels', 'affiliate')
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
