# Update Backend with MongoDB Credentials

## Your Project ID
`693e7ea06871ec64ed334091`

## How to Update

### Method 1: Update Backend Code (Simple)

Once you have your App ID and API Key:

**Edit `backend/server.js` - Line 16-17:**

Replace:
```javascript
const MONGODB_API_URL = 'https://ap-south-1.aws.data.mongodb-api.com/app/gzggipjk/endpoint/data/v1';
const MONGODB_API_KEY = process.env.MONGODB_API_KEY || 'VFPCzeFPD5k38njwbVmpf2vXvwdlQsGpmNY7OTfeTwRE6wJWh9Ht0cpLjN18Cww8';
```

With:
```javascript
const MONGODB_API_URL = 'https://ap-south-1.aws.data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1';
const MONGODB_API_KEY = process.env.MONGODB_API_KEY || 'YOUR_API_KEY_HERE';
```

Then:
```bash
git add backend/server.js
git commit -m "Update: MongoDB credentials for project 693e7ea06871ec64ed334091"
git push origin master
```

### Method 2: Use Environment Variables (Secure)

For security, use Render environment variables:

1. **Go to Render Dashboard:**
   https://dashboard.render.com/services/srv-d50ijdv5r7bs739fhtt0/env

2. **Add Variables:**
   - Key: `MONGODB_API_URL`
   - Value: `https://ap-south-1.aws.data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1`

   - Key: `MONGODB_API_KEY`
   - Value: `YOUR_API_KEY_HERE`

3. **Save** (Render auto-redeploys)

4. **Update `backend/server.js` to use env vars:**
   ```javascript
   const MONGODB_API_URL = process.env.MONGODB_API_URL || 'https://ap-south-1.aws.data.mongodb-api.com/app/gzggipjk/endpoint/data/v1';
   const MONGODB_API_KEY = process.env.MONGODB_API_KEY || 'VFPCzeFPD5k38njwbVmpf2vXvwdlQsGpmNY7OTfeTwRE6wJWh9Ht0cpLjN18Cww8';
   ```

5. **Deploy:**
   ```bash
   git add backend/server.js
   git commit -m "Update: Use environment variables for MongoDB credentials"
   git push origin master
   ```

---

## Verify After Update

Test the endpoint:
```bash
curl -X POST https://tripsaver-github-io.onrender.com/api/destinations \
  -H "Content-Type: application/json"
```

Should return:
```json
{
  "documents": [
    {"_id": "goa", "name": "Goa", ...},
    {"_id": "manali", "name": "Manali", ...},
    ...
  ]
}
```

If successful:
✅ MongoDB connected
✅ Live data flowing
✅ App will use real destinations

---

## Next Steps

1. Get your MongoDB App ID and API Key from Atlas
2. Choose Method 1 or 2 above
3. Update credentials
4. Test with curl
5. Deploy frontend

---

## Need Your MongoDB Credentials?

Check the file: `GET_MONGODB_CREDENTIALS.md`

It has instructions to find your App ID and API Key in MongoDB Atlas.

---

## Still Working with Static Data?

If you skip MongoDB setup:
- App works perfectly with 20+ static destinations
- All features fully functional
- No setup needed
- Deploy with: `npm run build && git push origin master`

---

**Project ID:** `693e7ea06871ec64ed334091`
**Backend Service ID:** `srv-d50ijdv5r7bs739fhtt0`
