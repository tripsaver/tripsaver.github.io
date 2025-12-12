/**
 * Agoda Affiliate Configuration
 * 
 * Centralized configuration for all Agoda affiliate links and widgets.
 * Easy to update affiliate IDs, URLs, and track all integration points.
 * 
 * Architecture: Single source of truth for Agoda partnerships
 * - All affiliate links reference this config
 * - Easy to update CID across entire site
 * - Track all integration points
 * - Simple onboarding/offboarding
 */

export interface AgodaAffiliateConfig {
  // Core affiliate information
  partnerId: string;
  affiliateId: string;
  partnerName: string;
  active: boolean;
  
  // Branding
  branding: {
    logo: string;
    brandColor: string;
    displayName: string;
  };
  
  // Link configurations
  links: {
    hotels: AgodaLinkConfig;
    flights: AgodaLinkConfig;
    search: AgodaLinkConfig;
    imageLinks: AgodaImageLink[];
  };
  
  // Widget configurations
  widgets: {
    searchWidget: AgodaWidgetConfig;
  };
  
  // Data sources
  dataSources: {
    hotelsCSV: DataSourceConfig;
    flightsCSV?: DataSourceConfig;
  };
}

export interface AgodaLinkConfig {
  baseUrl: string;
  defaultParams: Record<string, string>;
  buildUrl: (params?: Record<string, any>) => string;
}

export interface AgodaImageLink {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  alt: string;
  width: number;
  height: number;
}

export interface AgodaWidgetConfig {
  enabled: boolean;
  widgetId: string;
  scriptUrl: string;
  config: {
    crt: string;
    version: string;
    width: string;
    height: string;
    referenceKey: string;
    layout: string;
    language: string;
  };
}

export interface DataSourceConfig {
  type: 'csv' | 'api' | 'json';
  path: string;
  indexPath?: string;
  enabled: boolean;
}

/**
 * Main Agoda Configuration
 * Update affiliate ID here to change across entire site
 */
export const AGODA_CONFIG: AgodaAffiliateConfig = {
  partnerId: 'agoda',
  affiliateId: '1955073',
  partnerName: 'Agoda',
  active: true,
  
  branding: {
    logo: 'https://cdn6.agoda.net/images/kite-js/logo/agoda/color-default.svg',
    brandColor: '#FF6600',
    displayName: 'Agoda - Book Hotels & Flights'
  },
  
  links: {
    // Hotel booking links
    hotels: {
      baseUrl: 'https://www.agoda.com/partners/partnersearch.aspx',
      defaultParams: {
        pcs: '1',
        cid: '1955073',
        hl: 'en-us'
      },
      buildUrl: (params = {}) => {
        const queryParams = new URLSearchParams({
          pcs: params.pcs || '1',
          cid: '1955073',
          hl: params.hl || 'en-us',
          ...(params.city && { city: params.city }),
          ...(params.cityId && { cityId: params.cityId }),
          ...(params.hid && { hid: params.hid }), // Hotel ID
          ...(params.checkIn && { checkIn: params.checkIn }),
          ...(params.checkOut && { checkOut: params.checkOut }),
          ...(params.adults && { adults: params.adults }),
          ...(params.children && { children: params.children }),
          ...(params.rooms && { rooms: params.rooms })
        });
        return `https://www.agoda.com/partners/partnersearch.aspx?${queryParams.toString()}`;
      }
    },
    
    // Flight booking links
    flights: {
      baseUrl: 'https://www.agoda.com/flights',
      defaultParams: {
        cid: '1955073',
        hl: 'en-us'
      },
      buildUrl: (params = {}) => {
        const queryParams = new URLSearchParams({
          cid: '1955073',
          hl: params.hl || 'en-us',
          ...(params.origin && { origin: params.origin }),
          ...(params.destination && { destination: params.destination }),
          ...(params.departDate && { departDate: params.departDate }),
          ...(params.returnDate && { returnDate: params.returnDate }),
          ...(params.adults && { adults: params.adults }),
          ...(params.children && { children: params.children })
        });
        return `https://www.agoda.com/flights?${queryParams.toString()}`;
      }
    },
    
    // General search link
    search: {
      baseUrl: 'https://www.agoda.com/partners/partnersearch.aspx',
      defaultParams: {
        pcs: '1',
        cid: '1955073',
        hl: 'en-us'
      },
      buildUrl: (params = {}) => {
        const queryParams = new URLSearchParams({
          pcs: params.pcs || '1',
          cid: '1955073',
          hl: 'en-us',
          ...params
        });
        return `https://www.agoda.com/partners/partnersearch.aspx?${queryParams.toString()}`;
      }
    },
    
    // Image/Banner links
    imageLinks: [
      {
        id: 'agoda-hero-banner',
        title: 'Book Amazing Hotels with Agoda',
        imageUrl: 'assets/image/radisson-blu-mumbai.jpg',
        linkUrl: 'https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1955073&hl=en-us',
        alt: 'Agoda - Book Hotels with Best Price Guarantee',
        width: 1200,
        height: 400
      },
      {
        id: 'agoda-deals-banner',
        title: 'Special Deals on Agoda',
        imageUrl: 'assets/image/agoda-deals.jpg',
        linkUrl: 'https://www.agoda.com/deals?cid=1955073',
        alt: 'Exclusive deals and discounts',
        width: 800,
        height: 300
      }
    ]
  },
  
  widgets: {
    searchWidget: {
      enabled: true,
      widgetId: 'adgshp-30325076',
      scriptUrl: '//cdn0.agoda.net/images/sherpa/js/sherpa_init1_08.min.js',
      config: {
        crt: '7593686995288',
        version: '1.04',
        width: '320px',
        height: '420px',
        referenceKey: 'a6wO5dpZi0qUoFlWf3lOdA==',
        layout: 'SquareCalendar',
        language: 'en-us'
      }
    }
  },
  
  dataSources: {
    hotelsCSV: {
      type: 'csv',
      // OPTION 1: Google Drive direct download link
      // Get your file ID from: https://drive.google.com/file/d/FILE_ID/view
      // Replace FILE_ID below with your actual Google Drive file ID
      path: 'https://drive.google.com/uc?export=download&id=YOUR_GOOGLE_DRIVE_FILE_ID',
      
      // OPTION 2: Local split CSV files (for files > 100MB)
      // path: 'assets/data/hotels',
      // indexPath: 'assets/data/hotels/index.json',
      
      indexPath: undefined, // Not needed for Google Drive
      enabled: false // Set to true once you add your Google Drive link
    },
    flightsCSV: {
      type: 'csv',
      path: 'https://drive.google.com/uc?export=download&id=YOUR_FLIGHTS_FILE_ID',
      indexPath: undefined,
      enabled: false // Enable when flights data is available
    }
  }
};

/**
 * Helper Functions
 */

// Get hotel booking link
export function getAgodaHotelLink(params?: {
  city?: string;
  cityId?: string;
  hotelId?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  rooms?: number;
}): string {
  return AGODA_CONFIG.links.hotels.buildUrl(params);
}

// Get flight booking link
export function getAgodaFlightLink(params?: {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  adults?: number;
}): string {
  return AGODA_CONFIG.links.flights.buildUrl(params);
}

// Get search link
export function getAgodaSearchLink(params?: Record<string, any>): string {
  return AGODA_CONFIG.links.search.buildUrl(params);
}

// Get image banner by ID
export function getAgodaImageLink(id: string): AgodaImageLink | undefined {
  return AGODA_CONFIG.links.imageLinks.find(link => link.id === id);
}

// Check if Agoda is active
export function isAgodaActive(): boolean {
  return AGODA_CONFIG.active;
}

// Get widget configuration
export function getAgodaWidgetConfig(): AgodaWidgetConfig | null {
  return AGODA_CONFIG.widgets.searchWidget.enabled 
    ? AGODA_CONFIG.widgets.searchWidget 
    : null;
}

// Get data source configuration
export function getAgodaDataSource(type: 'hotels' | 'flights'): DataSourceConfig | null {
  const source = type === 'hotels' 
    ? AGODA_CONFIG.dataSources.hotelsCSV 
    : AGODA_CONFIG.dataSources.flightsCSV;
  
  return source?.enabled ? source : null;
}

/**
 * Usage Examples:
 * 
 * // Get hotel link
 * const link = getAgodaHotelLink({ city: 'Mumbai', adults: 2 });
 * 
 * // Get flight link
 * const flightLink = getAgodaFlightLink({ origin: 'BOM', destination: 'DEL' });
 * 
 * // Get image banner
 * const banner = getAgodaImageLink('agoda-hero-banner');
 * 
 * // Check if active
 * if (isAgodaActive()) {
 *   // Show Agoda content
 * }
 * 
 * // Get widget config
 * const widget = getAgodaWidgetConfig();
 * if (widget) {
 *   // Initialize widget
 * }
 */
