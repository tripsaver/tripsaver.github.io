# Google Drive CSV Setup Guide

## 🎯 Quick Setup - No Python Script Needed!

Since your CSV data is on Google Drive, you can load it directly without any local files or Python scripts.

## 📋 Step-by-Step Instructions

### 1. Get Your Google Drive File ID

1. Open your CSV file in Google Drive
2. Click "Share" and set to "Anyone with the link can view"
3. Copy the shareable link - it looks like:
   ```
   https://drive.google.com/file/d/1ABC123XYZ456/view?usp=sharing
   ```
4. Extract the FILE_ID (the part between `/d/` and `/view`):
   ```
   FILE_ID = 1ABC123XYZ456
   ```

### 2. Update Configuration

Open: `src/app/core/config/agoda-affiliate.config.ts`

Find this section:
```typescript
dataSources: {
  hotelsCSV: {
    type: 'csv',
    path: 'https://drive.google.com/uc?export=download&id=YOUR_GOOGLE_DRIVE_FILE_ID',
    indexPath: undefined,
    enabled: false // ← Change to true
  }
}
```

Replace `YOUR_GOOGLE_DRIVE_FILE_ID` with your actual FILE_ID and set `enabled: true`:

```typescript
dataSources: {
  hotelsCSV: {
    type: 'csv',
    path: 'https://drive.google.com/uc?export=download&id=1ABC123XYZ456',
    indexPath: undefined,
    enabled: true // ← IMPORTANT: Set to true!
  }
}
```

### 3. Test It!

```bash
npm start
```

Navigate to http://localhost:4200

You should see:
- ✅ "Featured Hotels on Agoda" section with hotel cards
- ✅ "Book Your Perfect Stay" search widget

## 🐛 Troubleshooting

### Hotels Section Not Showing

**Check Browser Console:**
- `ℹ️ Agoda hotels section hidden - data source not configured`
  → Solution: Set `enabled: true` in config

- `⚠️ Agoda data source not configured`
  → Solution: Add your Google Drive FILE_ID

### CORS Error

If you see CORS errors in console:

**Option 1: Make File Public**
1. Right-click file in Google Drive
2. Share → Anyone with the link
3. Viewer access

**Option 2: Use Google Drive API**
If file is large or private, consider using Google Drive API with authentication.

**Option 3: Download and Host Locally**
If file is small (<100MB):
1. Download CSV from Google Drive
2. Place in `src/assets/data/hotels.csv`
3. Update config:
   ```typescript
   path: 'assets/data/hotels.csv'
   ```

### File Too Large

If CSV is > 100MB and causing issues:

**Option 1: Filter Data**
Only include essential columns:
- hotel_id, hotel_name, city, country
- rating, review_score, review_count
- price_from, currency, image_url

**Option 2: Split by City**
Use the Python script to split into smaller files:
```bash
python split-csv.py
```

### Data Not Loading

1. **Check file format**: Must be valid CSV
2. **Check headers**: First row should be column names
3. **Check permissions**: File must be publicly accessible
4. **Check URL**: Use `/uc?export=download&id=` format

## 📊 CSV Format Expected

Your CSV should have these columns (column names may vary):

```csv
hotel_id,hotel_name,city,country,rating,review_score,review_count,price_from,currency,image_url,description,amenities,latitude,longitude
12345,Grand Hotel Mumbai,Mumbai,India,5,9.2,1234,5000,INR,https://...,Luxury hotel,...,19.0760,72.8777
```

### Update Column Mappings

If your CSV has different column names, update:

`src/app/core/services/agoda-data/agoda-data.service.ts`

Find the `mapToHotel()` method and adjust column names:

```typescript
private mapToHotel(headers: string[], values: string[]): AgodaHotel | null {
  // Map your CSV columns to the interface
  const row: any = {};
  headers.forEach((header, i) => {
    row[header] = values[i];
  });

  return {
    hotelId: row['YOUR_ID_COLUMN'] || row['id'],
    hotelName: row['YOUR_NAME_COLUMN'] || row['hotel_name'],
    city: row['YOUR_CITY_COLUMN'] || row['city'],
    // ... adjust other fields
  };
}
```

## 🎉 Success Indicators

When everything is working, you'll see:

1. **Homepage loads without errors**
2. **"Featured Hotels on Agoda" section appears**
3. **Hotel cards display with:**
   - Hotel image
   - Hotel name and location
   - Star rating
   - Review score
   - Price
   - Amenities
   - "View Details & Book" button

4. **Console shows:**
   ```
   Hotels loaded successfully
   Displaying 12 featured hotels
   ```

## 🚀 Next Steps

Once hotels are loading:

1. **Customize display count**: Edit `getFeaturedHotels(12)` in component
2. **Add filters**: City, price range, rating filters
3. **Add sorting**: By price, rating, reviews
4. **Add search**: Search by hotel name or city
5. **Add analytics**: Track clicks on "View Details" buttons

## 💡 Pro Tips

- **Large files**: If CSV is > 10MB, consider filtering data first
- **Performance**: Service caches results automatically
- **Testing**: Use a small sample CSV first (100-200 hotels)
- **Updates**: To refresh data, just re-share the updated Google Drive file

## 📞 Need Help?

Common errors and solutions:

| Error | Solution |
|-------|----------|
| "Failed to load hotels from Google Drive" | Check file is publicly accessible |
| "No hotels data available" | Check CSV format and column names |
| Section not showing | Set `enabled: true` in config |
| CORS error | Make file public or download locally |

---

**Remember:** No Python script needed! Just configure the Google Drive link and you're done! 🎉
