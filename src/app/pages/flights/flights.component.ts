import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { AnalyticsService } from '../../core/services/analytics/analytics.service';

interface FlightRoute {
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  duration: string;
  avgPrice: string;
  popular: boolean;
  image: string;
  bookingUrl: string;
  mmtUrl: string;
  goibiboUrl: string;
}

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flights.component.html',
  styleUrl: './flights.component.scss'
})
export class FlightsComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private analytics = inject(AnalyticsService);
  
  routes: FlightRoute[] = [];

  constructor() {
    this.initializeRoutes();
  }

  ngOnInit() {
    this.titleService.setTitle('Cheap Flight Tickets - Compare Flight Prices | TripSaver');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Compare and book cheap domestic flights in India. Find best prices on Delhi-Mumbai, Bangalore-Goa flights and more. Search flights on MakeMyTrip, Goibibo, and Booking.com.' 
    });
    this.metaService.updateTag({ 
      name: 'keywords', 
      content: 'cheap flights, flight tickets, domestic flights India, Delhi Mumbai flights, Bangalore Goa flights, flight booking' 
    });
  }

  private initializeRoutes() {
    this.routes = [
    {
      from: 'Bangalore',
      to: 'Goa',
      fromCode: 'BLR',
      toCode: 'GOI',
      duration: '1h 30m',
      avgPrice: '₹3,500',
      popular: true,
      image: 'https://picsum.photos/400/200?random=10',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/flights?ss=Bangalore-Goa&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/flights?from=BLR&to=GOI&campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      goibiboUrl: this.analytics.addUTMToUrl('https://www.goibibo.com/flights/air-BLR-GOI?&utm_source=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate')
    },
    {
      from: 'Delhi',
      to: 'Mumbai',
      fromCode: 'DEL',
      toCode: 'BOM',
      duration: '2h 15m',
      avgPrice: '₹4,200',
      popular: true,
      image: 'https://picsum.photos/400/200?random=11',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/flights?ss=Delhi-Mumbai&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/flights?from=DEL&to=BOM&campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      goibiboUrl: this.analytics.addUTMToUrl('https://www.goibibo.com/flights/air-DEL-BOM?&utm_source=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate')
    },
    {
      from: 'Mumbai',
      to: 'Goa',
      fromCode: 'BOM',
      toCode: 'GOI',
      duration: '1h 15m',
      avgPrice: '₹3,200',
      popular: true,
      image: 'https://picsum.photos/400/200?random=12',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/flights?ss=Mumbai-Goa&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/flights?from=BOM&to=GOI&campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      goibiboUrl: this.analytics.addUTMToUrl('https://www.goibibo.com/flights/air-BOM-GOI?&utm_source=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate')
    },
    {
      from: 'Delhi',
      to: 'Bangalore',
      fromCode: 'DEL',
      toCode: 'BLR',
      duration: '2h 45m',
      avgPrice: '₹4,800',
      popular: true,
      image: 'https://picsum.photos/400/200?random=13',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/flights?ss=Delhi-Bangalore&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/flights?from=DEL&to=BLR&campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      goibiboUrl: this.analytics.addUTMToUrl('https://www.goibibo.com/flights/air-DEL-BLR?&utm_source=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate')
    },
    {
      from: 'Chennai',
      to: 'Delhi',
      fromCode: 'MAA',
      toCode: 'DEL',
      duration: '2h 50m',
      avgPrice: '₹5,100',
      popular: false,
      image: 'https://picsum.photos/400/200?random=14',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/flights?ss=Chennai-Delhi&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/flights?from=MAA&to=DEL&campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      goibiboUrl: this.analytics.addUTMToUrl('https://www.goibibo.com/flights/air-MAA-DEL?&utm_source=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate')
    },
    {
      from: 'Kolkata',
      to: 'Mumbai',
      fromCode: 'CCU',
      toCode: 'BOM',
      duration: '2h 40m',
      avgPrice: '₹4,900',
      popular: false,
      image: 'https://picsum.photos/400/200?random=15',
      bookingUrl: this.analytics.addUTMToUrl('https://www.booking.com/flights?ss=Kolkata-Mumbai&aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      mmtUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/flights?from=CCU&to=BOM&campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate'),
      goibiboUrl: this.analytics.addUTMToUrl('https://www.goibibo.com/flights/air-CCU-BOM?&utm_source=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_flights', 'affiliate')
    }
    ];
  }

  trackFlightClick(platform: string, route: string) {
    const routeData = this.routes.find(r => `${r.from}-${r.to}` === route);
    this.analytics.trackAffiliateClick(
      platform,
      'flight',
      route,
      routeData?.avgPrice
    );
  }
}
