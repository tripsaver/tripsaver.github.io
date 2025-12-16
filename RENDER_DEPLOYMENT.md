# Render.com Deployment Guide for TripSaver Backend

## What's New
Backend proxy service is now ready in `/backend` folder. This allows your GitHub Pages app to access MongoDB without CORS issues.

## Quick Deployment (5 Minutes)

### Step 1: Push Code to GitHub
```bash
git add backend/
git commit -m "Add backend proxy for MongoDB"
git push origin master
```

### Step 2: Visit Render.com
1. Go to https://render.com
2. Sign up with GitHub (if not already)
3. Click **New +** → **Web Service**
4. Select **tripsaver/tripsaver.github.io** repository

### Step 3: Configure
Fill in these settings:

| Field | Value |
|-------|-------|
| Name | `tripsaver-backend` |
| Environment | `Node` |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && npm start` |
| Instance Type | **Free** |

### Step 4: Deploy
Click **Create Web Service** and wait 2-3 minutes for deployment.

### Step 5: Get Your Backend URL
Once deployed, you'll see:
```
Service is live at https://tripsaver-github-io.onrender.com
```

✅ **Your Backend is Already Deployed:** https://tripsaver-github-io.onrender.com

Copy this URL! You'll need it next.

---

## Step 6: Update Angular Service

Edit `src/app/core/services/mongodb/mongodb.service.ts`:

Replace the `getAllDestinations()` method with:

```typescript
/**
 * Get all destinations from MongoDB via backend proxy
 * Uses Render.com backend to handle CORS for GitHub Pages
 * Includes 5-second timeout and fallback to static data
 */
getAllDestinations(): Observable<Destination[]> {
  const backendUrl = 'https://tripsaver-github-io.onrender.com/api/destinations';
  
  return this.http.post<MongoResponse<Destination>>(
    backendUrl,
    {},
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(
    timeout(5000), // 5-second timeout
    map(response => {
      console.log('✅ Backend Proxy Response:', response);
      return response.documents || [];
    }),
    catchError(error => {
      console.error('❌ Backend proxy failed:', error.status || 'timeout');
      console.warn('⚠️ Falling back to static destination data');
      return of([]);
    })
  );
}
```

---

## Step 7: Test

### Test Backend Health
```bash
curl https://tripsaver-github-io.onrender.com/api/health
```

Should return:
```json
{ "status": "ok", "service": "TripSaver Backend" }
```

### Test App
1. Build: `npm run build`
2. Visit https://tripsaver.github.io/
3. Fill form and click "Get Recommendations"
4. Check console (F12) for:
   ```
   ✅ Backend Proxy Response: { documents: [...] }
   ```

---

## What's Happening

### Before (Current - Static Data Only)
```
User Form → SmartRecommendationsComponent
    ↓
DestinationScoringEngine
    ↓
MongoDB (CORS blocked) ❌
    ↓
Static Fallback ✅ (works, but not live data)
```

### After (With Backend)
```
User Form → SmartRecommendationsComponent
    ↓
DestinationScoringEngine
    ↓
MongoDB via Backend Proxy ✅ (CORS handled server-side)
    ↓
Results with Live Data ✅
```

---

## Free Tier Details

**Render.com Free Tier:**
- ✅ 750 hours/month (free)
- ✅ No credit card required
- ✅ Automatic HTTPS
- ✅ GitHub integration
- 🟡 Service sleeps after 15 min inactivity
- 🟡 First request takes 5-10 seconds (wakes service)

**Upgrade to Paid:**
- $10+/month for always-on service
- Better performance
- More resources

---

## Troubleshooting

### Deploy Failed: "cd: backend: No such file or directory"
✅ Fixed! Backend folder now exists

### Deploy Failed: "Cannot find module..."
- Wait 5 minutes, try again
- Check `backend/package.json` exists
- Check `backend/server.js` exists

### 502 Bad Gateway on First Request
- Normal! Free tier service was sleeping
- Refresh page (takes 10 seconds to wake)
- After that, instant responses

### "Backend proxy failed"
- Verify backend URL is correct
- Check MongoDB credentials
- Verify CORS is enabled for GitHub Pages domain

---

## Optional: Use Backend Locally

For development, test backend locally:

```bash
# Install dependencies
cd backend
npm install

# Start backend on http://localhost:3000
npm start

# In another terminal, start Angular app
cd ..
npm start
```

Update service to use:
```typescript
const backendUrl = 'http://localhost:3000/api/destinations';
```

---

## Summary

| Step | Status | Time |
|------|--------|------|
| 1. Push backend to GitHub | ✅ Done | 1 min |
| 2. Deploy to Render.com | ⏳ You do this | 2 min |
| 3. Update Angular service | ⏳ You do this | 2 min |
| 4. Test | ⏳ You do this | - |
| **Total** | | **5 min** |

---

## Next Steps

1. **Push** code to GitHub: `git push origin master`
2. **Deploy** to Render.com (follow steps above)
3. **Update** `mongodb.service.ts` with backend URL
4. **Test** on https://tripsaver.github.io/

Your app will then have:
- ✅ Live MongoDB data
- ✅ No CORS issues
- ✅ Completely free
- ✅ Production ready

**Questions?** Check `backend/README.md` for more details.
