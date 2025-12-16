# TripSaver Deployment Information

## Backend Service Details

**Service ID:** `srv-d50ijdv5r7bs739fhtt0`

**Service URL:** https://tripsaver-github-io.onrender.com

**Platform:** Render.com (Free Tier)

## Service URLs

| Service | URL |
|---------|-----|
| Frontend | https://tripsaver.github.io |
| Backend | https://tripsaver-github-io.onrender.com |
| Health Check | https://tripsaver-github-io.onrender.com/api/health |
| Render Dashboard | https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0 |

## Quick Links

- **View Logs:** https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0/logs
- **Settings:** https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0/settings
- **Environment:** https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0/env

## Architecture

```
Frontend: https://tripsaver.github.io (GitHub Pages)
    ↓
Backend: https://tripsaver-github-io.onrender.com (Render.com - Service ID: srv-d50ijdv5r7bs739fhtt0)
    ↓
Database: MongoDB Atlas (Live Data)
    ↓
Fallback: Static Data (Always Available)
```

## What's Deployed

✅ **Backend Proxy Server**
- Node.js/Express
- CORS handling for GitHub Pages
- MongoDB API proxy endpoints
- Health check endpoint
- Error logging

✅ **Endpoints Available**
- `GET /api/health` - Health check
- `POST /api/destinations` - Get all destinations
- `POST /api/search` - Search destinations with filter
- `GET /api/destinations/:id` - Get single destination

✅ **Configuration**
- CORS enabled for GitHub Pages
- 5-second timeout per request
- Automatic fallback to static data
- Production-grade error handling

## Monitoring

### Check Backend Status
```bash
curl https://tripsaver-github-io.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","service":"TripSaver Backend"}
```

### View Logs
- Dashboard: https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0/logs
- Or command line (if Render CLI installed):
  ```bash
  render logs srv-d50ijdv5r7bs739fhtt0
  ```

## Free Tier Details

- ✅ 750 CPU hours/month
- ✅ 0.5 GB RAM
- ✅ Automatic HTTPS
- 🟡 Service sleeps after 15 min inactivity
- 🟡 First request after sleep: 5-10 seconds
- After wake: Instant responses

## Troubleshooting

### Service Down or Slow
1. Check dashboard: https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0
2. View logs for errors
3. Restart service if needed (Dashboard → Restart)

### 502 Bad Gateway
- Backend may be sleeping (free tier)
- First request wakes it up (5-10 sec delay)
- Subsequent requests instant
- Refresh page to retry

### Connection Timeout
- MongoDB may be unreachable
- App still works with static fallback
- Check MongoDB credentials in environment variables

## Environment Variables

If needed to update MongoDB credentials:
1. Go to https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0/env
2. Add/update variables
3. Redeploy service

Current config:
- Uses MongoDB API key from code (embedded)
- Can be moved to env var for security

## Updating Backend Code

To update backend after code changes:

```bash
# 1. Make changes to backend/ folder
# 2. Push to GitHub
git add backend/
git commit -m "Update backend code"
git push origin master

# 3. Render automatically redeploys (check dashboard)
```

Render auto-deploys when master branch changes.

## Next Steps

1. ✅ Build and push frontend
2. ✅ Verify both services running
3. ✅ Test full flow end-to-end
4. ✅ Monitor for any issues
5. ✅ Share with users!

## Support

For issues:
- Check logs: https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0/logs
- View service details: https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0
- Review backend code: `backend/` folder in repository

---

**Service Status:** ✅ Active and Running

**Last Updated:** December 16, 2025
