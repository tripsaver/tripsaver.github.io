# Agoda Affiliate Integration Guide

## 🎯 Overview

This project is configured for **AGODA-ONLY** affiliate integration with a scalable architecture for future partner onboarding.

## 📁 Architecture

### Configuration Files

1. **`src/app/core/config/agoda-affiliate.config.ts`** ⭐ PRIMARY CONFIG
   - Complete Agoda affiliate configuration
   - Hotel links, flight links, search links
   - Image banners and promotional materials
   - Widget configurations
   - CSV data source paths
   
2. **`src/app/core/config/partner-links.config.ts`** (Legacy/Fallback)
   - Multi-partner framework (currently only Agoda active)
   - Easy onboarding structure for future partners

3. **`src/app/core/services/agoda-data/agoda-data.service.ts`**
   - Handles CSV data loading (hotels/flights)
   - City-based data loading for performance
   - Affiliate URL generation

## 🔧 Quick Configuration

### Update Affiliate ID

**Option 1: Agoda Config (Recommended)**
```typescript
// src/app/core/config/agoda-affiliate.config.ts
export const AGODA_CONFIG = {
  affiliateId: '1955073', // ← Change this
  //...
}
```

**Option 2: Partner Links Config**
```typescript
// src/app/core/config/partner-links.config.ts
agoda: {
  affiliateId: '1955073', // ← Change this
  //...
}
```

### Update Widget ID

```typescript
// agoda-affiliate.config.ts
widgets: {
  searchWidget: {
    widgetId: 'adgshp-30325076', // ← Your widget ID
    config: {
      crt: '7593686995288', // ← Update if needed
      //...
    }
  }
}
```

## 📊 Data Sources

### Hotels CSV Data from Google Drive ⭐ RECOMMENDED

**No Python script needed!** Load data directly from Google Drive.

**Setup:**
1. Upload CSV to Google Drive
2. Make it publicly accessible (Anyone with link)
3. Get the FILE_ID from the shareable link
4. Update config:

```typescript
// agoda-affiliate.config.ts
dataSources: {
  hotelsCSV: {
    type: 'csv',
    path: 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID',
    enabled: true // ← Set to true!
  }
}
```

**Full instructions:** See `GOOGLE-DRIVE-SETUP.md`

### Alternative: Local Split Files (for files > 100MB)

If your CSV is too large for GitHub or Google Drive has CORS issues:

**Location:** `src/assets/data/hotels/`

**Structure:**
```
src/assets/data/hotels/
├── index.json          # City index
├── mumbai.csv         # Hotels in Mumbai
├── delhi.csv          # Hotels in Delhi
└── ... (more cities)
```

**Setup:**
1. Place large CSV in `src/assets/E342B777-64FD-4A49-9C9F-FEF4BA635863_EN.csv`
2. Run: `python split-csv.py`
3. Verify files created in `assets/data/hotels/`
4. Delete original large file

**Configuration:**
```typescript
dataSources: {
  hotelsCSV: {
    type: 'csv',
    path: 'assets/data/hotels',
    indexPath: 'assets/data/hotels/index.json',
    enabled: true
  }
}
```

### Flights CSV Data (Future)

```typescript
flightsCSV: {
  type: 'csv',
  path: 'assets/data/flights',
  enabled: false // ← Enable when ready
}
```

## 🔗 Link Types

### 1. Hotel Booking Links

```typescript
import { getAgodaHotelLink } from './core/config/agoda-affiliate.config';

// Basic hotel search
const link = getAgodaHotelLink();

// City-specific
const mumbaiLink = getAgodaHotelLink({ city: 'Mumbai' });

// Specific hotel
const hotelLink = getAgodaHotelLink({ hotelId: '12345' });

// With dates and guests
const detailedLink = getAgodaHotelLink({
  cityId: 'BOM',
  checkIn: '2024-01-15',
  checkOut: '2024-01-20',
  adults: 2,
  rooms: 1
});
```

### 2. Flight Booking Links

```typescript
import { getAgodaFlightLink } from './core/config/agoda-affiliate.config';

const flightLink = getAgodaFlightLink({
  origin: 'BOM',
  destination: 'DEL',
  departDate: '2024-01-15',
  returnDate: '2024-01-22',
  adults: 2
});
```

### 3. Search Links

```typescript
import { getAgodaSearchLink } from './core/config/agoda-affiliate.config';

const searchLink = getAgodaSearchLink({ pcs: '1' });
```

### 4. Image/Banner Links

```typescript
import { getAgodaImageLink } from './core/config/agoda-affiliate.config';

const banner = getAgodaImageLink('agoda-hero-banner');
// Returns: { id, title, imageUrl, linkUrl, alt, width, height }
```

## 🎨 Widget Integration

### Current Widget

- **ID:** `adgshp-30325076`
- **Type:** SquareCalendar
- **Size:** 320x420px
- **Location:** Home page (prime position under hero)

### Add Widget to New Pages

```html
<!-- In your component template -->
<section class="agoda-widget-hero">
  <div class="container">
    <div class="section-header">
      <h2>🏨 Search Hotels Instantly</h2>
      <p>Compare prices and book with exclusive deals</p>
    </div>
    <div class="agoda-widget-wrapper">
      <div id="adgshp-30325076"></div>
    </div>
    <div class="widget-footer-text">
      <p>🛡️ Secure booking • Best price guarantee</p>
    </div>
  </div>
</section>
```

**Styles:** Already defined in `src/app/app.scss` (global)

## 📝 Component Integration

### Display Hotels from CSV

```typescript
// In your component
import { AgodaDataService } from './core/services/agoda-data/agoda-data.service';

export class YourComponent {
  private agodaService = inject(AgodaDataService);
  hotels: AgodaHotel[] = [];
  
  ngOnInit() {
    // Load featured hotels
    this.agodaService.getFeaturedHotels(12).subscribe(hotels => {
      this.hotels = hotels;
    });
    
    // Or load by city
    this.agodaService.loadHotelsByCity('Mumbai').subscribe(hotels => {
      this.hotels = hotels;
    });
  }
}
```

## 🚀 Adding New Partners (Future)

### Step 1: Add to Config

```typescript
// partner-links.config.ts
newpartner: {
  name: 'newpartner',
  displayName: 'New Partner Name',
  baseUrl: 'https://www.newpartner.com',
  affiliateId: 'YOUR_AFFILIATE_ID',
  logo: 'https://newpartner.com/logo.svg',
  brandColor: '#FF0000',
  buildUrl: (params) => {
    // Build affiliate URL logic
    return `https://newpartner.com/search?aid=${affiliateId}`;
  },
  widget: {
    enabled: false // or true with config
  },
  active: true // ← Set to true to enable
}
```

### Step 2: Auto-Integration

Once added with `active: true`, the partner automatically appears in:
- Footer "Special Deals" section
- Partner navigation links
- `getActivePartners()` results

## ❌ Removing Partners

### Temporary Disable

```typescript
active: false // Partner hidden from site
```

### Permanent Removal

Delete the entire partner object from `PARTNER_LINKS`.

## 📍 Integration Points

### Where Agoda Links Appear

1. **Homepage**
   - Hero banner image link
   - Search widget (prime position)
   - Featured hotels from CSV
   - Quick CTA buttons

2. **Hotels Page**
   - Search widget
   - Hotel cards (CSV data)
   - Filter results

3. **Deals Page**
   - Search widget
   - Special offers section

4. **Footer**
   - "Special Deals" section
   - Partner logos

5. **Destination Cards**
   - City-specific links
   - Popular destinations

## 🔐 SEO & Compliance

All affiliate links include:
```html
rel="nofollow sponsored noopener"
```

### Update Link Attributes

```html
<a [href]="agodaLink" 
   rel="nofollow sponsored noopener" 
   target="_blank">
  Book Now
</a>
```

## 📊 Tracking & Analytics

### Link Click Tracking

```typescript
trackHotelClick(hotel: AgodaHotel) {
  console.log(`Clicked: ${hotel.hotelName}`);
  // Add analytics tracking here
  // Example: gtag('event', 'affiliate_click', { partner: 'agoda', hotel: hotel.hotelId });
}
```

## 🧪 Testing

### Verify Configuration

```typescript
import { isAgodaActive, AGODA_CONFIG } from './core/config/agoda-affiliate.config';

console.log('Agoda Active:', isAgodaActive());
console.log('Affiliate ID:', AGODA_CONFIG.affiliateId);
console.log('Widget Enabled:', AGODA_CONFIG.widgets.searchWidget.enabled);
```

### Test Links

```bash
npm start
```

1. Navigate to homepage
2. Click "Search Hotels" widget
3. Check URL contains `cid=1955073`
4. Click featured hotel cards
5. Verify affiliate parameters in URLs

## 🐛 Troubleshooting

### Widget Not Showing

1. Check `src/index.html` has widget script:
```html
<script>
var stg = stg || {};
stg.crt = "7593686995288";
stg.cid = "1955073";
//...
</script>
<script src="//cdn0.agoda.net/images/sherpa/js/sherpa_init1_08.min.js"></script>
```

2. Verify widget ID matches:
- Config: `widgetId: 'adgshp-30325076'`
- HTML: `<div id="adgshp-30325076"></div>`

### CSV Data Not Loading

1. Check file exists: `src/assets/data/hotels/index.json`
2. Verify service configuration:
```typescript
enabled: true // in dataSources.hotelsCSV
```
3. Check browser console for errors

### Links Missing Affiliate ID

1. Verify config has correct ID
2. Clear browser cache
3. Rebuild: `npm run build`

## 📚 File Reference

### Configuration
- `src/app/core/config/agoda-affiliate.config.ts` - Main Agoda config
- `src/app/core/config/partner-links.config.ts` - Multi-partner framework

### Services
- `src/app/core/services/agoda-data/agoda-data.service.ts` - Data handling

### Components
- `src/app/shared/components/agoda-hotels/` - Hotel display component
- `src/app/pages/home/` - Homepage with widgets
- `src/app/pages/hotels/` - Hotels page
- `src/app/pages/deals/` - Deals page

### Styles
- `src/app/app.scss` - Global Agoda widget styles
- Component-specific SCSS files

### Data
- `src/assets/data/hotels/` - Hotel CSV files
- `src/assets/data/flights/` - Flight CSV files (future)
- `src/assets/image/` - Banner images

### Scripts
- `split-csv.py` - CSV splitting utility
- `CSV-SPLIT-INSTRUCTIONS.md` - CSV setup guide

## 🎯 Best Practices

1. **Always use config functions** instead of hardcoding URLs
2. **Test affiliate links** in incognito mode
3. **Monitor click-through rates** with analytics
4. **Update affiliate IDs** in one place (config files)
5. **Keep CSV data under 90MB per file**
6. **Use city-based loading** for performance
7. **Include SEO attributes** on all affiliate links
8. **Cache hotel data** to reduce API calls

## 📞 Support

For questions or issues:
1. Check this README
2. Review `CSV-SPLIT-INSTRUCTIONS.md`
3. Check `src/assets/data/hotels/README.md`
4. Review Agoda Partner documentation
