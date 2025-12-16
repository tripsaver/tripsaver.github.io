# 🚀 Quick Deployment Guide

## Your Setup is Ready!

Your MongoDB credentials are now configured in the backend. Follow these 3 simple steps to go live:

## Step 1: Deploy Backend to Render

```bash
# Commit and push your backend changes
git add backend/
git commit -m "Configure MongoDB REST API credentials"
git push origin master
```

**What happens:**
- Render automatically detects changes to `backend/` folder
- Runs `npm install` to install dependencies
- Starts the backend service
- Service is live at: `https://tripsaver-github-io.onrender.com`

**Check deployment status:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on service: `tripsaver-github-io`
3. Watch the deploy logs
4. Once deployed, test: `https://tripsaver-github-io.onrender.com/api/health`

## Step 2: Test Backend Endpoints

Once backend is deployed, test these in your browser or terminal:

```bash
# Health check
curl https://tripsaver-github-io.onrender.com/api/health

# Get destinations
curl -X POST https://tripsaver-github-io.onrender.com/api/destinations \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "documents": [
    {
      "_id": "...",
      "name": "Delhi",
      ...
    }
  ]
}
```

## Step 3: Deploy Frontend to GitHub Pages

```bash
# Build the app
npm run build

# Push to GitHub (triggers automatic deployment)
git add dist/
git commit -m "Build with live MongoDB"
git push origin master
```

**Result:**
- App goes live at: `https://tripsaver.github.io`
- Frontend calls backend for destination data
- Results appear within 2-3 seconds

## Verify Everything Works

1. Go to `https://tripsaver.github.io`
2. Fill in the form (month, budget, categories)
3. Click "Get Recommendations"
4. Loader stops within 5 seconds
5. See destinations from MongoDB

## Environment Variables (Optional but Recommended)

For production security, add credentials to Render environment:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select service: `tripsaver-github-io`
3. Go to **Settings** → **Environment**
4. Add variables:
   ```
   MONGODB_PUBLIC_KEY=gzggipjk
   MONGODB_PRIVATE_KEY=5c39bfd7-bc63-4656-b088-a147ca8ba608
   ```
5. Click "Deploy"

## Timeline

| Task | Time | Status |
|------|------|--------|
| Backend deploy | 2-3 min | ⏳ Pending |
| Test endpoints | 1 min | ⏳ Pending |
| Frontend build | 1-2 min | ⏳ Pending |
| Frontend deploy | 1 min | ⏳ Pending |
| **Total** | **5-7 min** | ⏳ Ready to start |

## Troubleshooting

### Backend deployment stuck
- Check Render logs: https://dashboard.render.com
- Verify all dependencies are in package.json
- Ensure node_modules is in .gitignore

### Endpoints return 404
- Wait 30 seconds for backend to fully start
- Try the health endpoint: `/api/health`
- Check Render service is running

### Frontend not getting data
- Open browser DevTools
- Check Network tab for `/api/destinations` requests
- Verify backend URL is correct
- Check browser console for errors

## Success Checklist

- [ ] Backend code updated with credentials
- [ ] Pushed changes to GitHub
- [ ] Render deployment completed
- [ ] Health endpoint returns 200
- [ ] Destinations endpoint returns data
- [ ] Frontend built
- [ ] Frontend deployed to GitHub Pages
- [ ] App shows recommendations from MongoDB

---

**You're all set! Deploy whenever ready.** 🎉
