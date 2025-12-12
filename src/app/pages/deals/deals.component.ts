import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { AnalyticsService } from '../../core/services/analytics/analytics.service';

interface Deal {
  id: number;
  title: string;
  description: string;
  category: 'hotel' | 'flight' | 'package';
  image: string;
  originalPrice: string;
  discountedPrice: string;
  discount: string;
  validUntil: string;
  platform: string;
  affiliateUrl: string;
  featured: boolean;
}

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deals.component.html',
  styleUrl: './deals.component.scss'
})
export class DealsComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private analytics = inject(AnalyticsService);
  
  deals: Deal[] = [];
  filteredDeals: Deal[] = [];
  activeFilter: string = 'all';

  constructor() {
    this.initializeDeals();
  }

  ngOnInit() {
    this.titleService.setTitle('Best Travel Deals & Offers Today - Up to 50% Off | TripSaver');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Get the best travel deals today! Hotels under ₹2000, flight discounts, and holiday packages. Save up to 50% on verified deals from top booking platforms.' 
    });
    this.metaService.updateTag({ 
      name: 'keywords', 
      content: 'travel deals, hotel deals, flight deals, discount offers, cheap hotels, holiday packages, travel offers India' 
    });
  }

  private initializeDeals() {
    this.deals = [
    {
      id: 1,
      title: 'Goa Beach Resorts Under ₹2,000',
      description: '3-star beachfront properties with pool access',
      category: 'hotel',
      image: 'https://picsum.photos/600/400?random=20',
      originalPrice: '₹3,500',
      discountedPrice: '₹1,899',
      discount: '46% OFF',
      validUntil: '2025-12-31',
      platform: 'Booking.com',
      affiliateUrl: this.analytics.addUTMToUrl('https://www.booking.com/deals/goa-hotels?aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_deals', 'affiliate'),
      featured: true
    },
    {
      id: 2,
      title: 'Delhi to Mumbai Flights',
      description: 'Non-stop flights starting from ₹2,499',
      category: 'flight',
      image: 'https://picsum.photos/600/400?random=21',
      originalPrice: '₹5,200',
      discountedPrice: '₹2,499',
      discount: '52% OFF',
      validUntil: '2025-12-25',
      platform: 'MakeMyTrip',
      affiliateUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/flights/delhi-mumbai?campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_deals', 'affiliate'),
      featured: true
    },
    {
      id: 3,
      title: 'Manali 3N/4D Package',
      description: 'Hotel + Sightseeing + Breakfast included',
      category: 'package',
      image: 'https://picsum.photos/600/400?random=22',
      originalPrice: '₹12,000',
      discountedPrice: '₹8,999',
      discount: '25% OFF',
      validUntil: '2025-12-28',
      platform: 'MakeMyTrip',
      affiliateUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/holidays/india/packages?campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_deals', 'affiliate'),
      featured: true
    },
    {
      id: 4,
      title: 'Bangalore Hotels Under ₹1,500',
      description: 'Budget-friendly stays near city center',
      category: 'hotel',
      image: 'https://picsum.photos/600/400?random=23',
      originalPrice: '₹2,800',
      discountedPrice: '₹1,399',
      discount: '50% OFF',
      validUntil: '2025-12-20',
      platform: 'Agoda',
      affiliateUrl: this.analytics.addUTMToUrl('https://www.agoda.com/deals/bangalore?cid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_deals', 'affiliate'),
      featured: false
    },
    {
      id: 5,
      title: 'Flash Sale: Flights to Goa',
      description: 'Limited time offer - Book now!',
      category: 'flight',
      image: 'https://picsum.photos/600/400?random=24',
      originalPrice: '₹4,500',
      discountedPrice: '₹1,999',
      discount: '56% OFF',
      validUntil: '2025-12-18',
      platform: 'Goibibo',
      affiliateUrl: this.analytics.addUTMToUrl('https://www.goibibo.com/flights/deals?utm_source=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_deals', 'affiliate'),
      featured: false
    },
    {
      id: 6,
      title: 'Kerala Backwaters Package',
      description: 'Houseboat stay + Meals + Transfers',
      category: 'package',
      image: 'https://picsum.photos/600/400?random=25',
      originalPrice: '₹18,000',
      discountedPrice: '₹13,499',
      discount: '25% OFF',
      validUntil: '2025-12-30',
      platform: 'Booking.com',
      affiliateUrl: this.analytics.addUTMToUrl('https://www.booking.com/packages/kerala?aid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_deals', 'affiliate'),
      featured: false
    },
    {
      id: 7,
      title: 'Jaipur Heritage Hotels',
      description: 'Royal experience under ₹2,500',
      category: 'hotel',
      image: 'https://picsum.photos/600/400?random=26',
      originalPrice: '₹4,000',
      discountedPrice: '₹2,399',
      discount: '40% OFF',
      validUntil: '2025-12-22',
      platform: 'MakeMyTrip',
      affiliateUrl: this.analytics.addUTMToUrl('https://www.makemytrip.com/hotels/jaipur-heritage?campaign=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_deals', 'affiliate'),
      featured: false
    },
    {
      id: 8,
      title: 'Weekend Getaway: Ooty',
      description: 'Hotel + Breakfast + Hill station tour',
      category: 'package',
      image: 'https://picsum.photos/600/400?random=27',
      originalPrice: '₹9,500',
      discountedPrice: '₹6,999',
      discount: '26% OFF',
      validUntil: '2025-12-24',
      platform: 'Agoda',
      affiliateUrl: this.analytics.addUTMToUrl('https://www.agoda.com/packages/ooty?cid=REPLACE_WITH_AFFILIATE_ID', 'tripsaver_deals', 'affiliate'),
      featured: false
    }
    ];
    
    this.filteredDeals = this.deals;
  }

  selectedCategory: string = 'all';

  get featuredDeals(): Deal[] {
    return this.deals.filter(deal => deal.featured);
  }

  filterDeals(category: string) {
    this.selectedCategory = category;
    this.activeFilter = category;
    
    if (category === 'all') {
      this.filteredDeals = this.deals;
    } else {
      this.filteredDeals = this.deals.filter(deal => deal.category === category);
    }
    
    this.analytics.trackFilter('deal_category', category);
  }

  trackDealClick(deal: Deal) {
    this.analytics.trackDealClick(
      deal.title,
      deal.platform,
      deal.discount,
      deal.discountedPrice
    );
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      hotel: 'hotel',
      flight: 'flight',
      package: 'card_travel'
    };
    return icons[category] || 'local_offer';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      hotel: '#2563eb',
      flight: '#0ea5e9',
      package: '#8b5cf6'
    };
    return colors[category] || '#6b7280';
  }
}
