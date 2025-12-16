# MongoDB Setup - Get Your Credentials

## Your MongoDB Project ID
`693e7ea06871ec64ed334091`

## Get Your Data API Credentials

### Step 1: Go to MongoDB Atlas
1. Visit https://cloud.mongodb.com
2. Sign in with your account
3. Select Project ID: `693e7ea06871ec64ed334091`

### Step 2: Find Data API Settings
1. In left sidebar, click **Data API**
2. Look for your **App ID** (long string like `xxxxxxxxxx`)
3. Look for **API Key** (long string starting with your region)

### Step 3: Copy Your Credentials

You need to find:
- **App ID**: Look like `gzggipjk...` (the one that's failing is `gzggipjk`)
- **API Key**: Long string for authentication
- **API Endpoint**: Should be `https://ap-south-1.aws.data.mongodb-api.com/app/{APP_ID}/endpoint/data/v1`

### Step 4: Share with Me

Reply with:
```
App ID: [your-app-id-here]
API Key: [your-api-key-here]
Region: [ap-south-1 or your-region]
```

Or provide a screenshot of the Data API page in MongoDB Atlas.

---

## Alternative: Check Existing Setup

Your project might already have the Data API configured. Check:

1. **Data API Page**
   - MongoDB Atlas → Data API
   - Is it "Enabled"?
   - What's the App ID shown?

2. **API Keys**
   - Data API → API Keys
   - Is there an active key?
   - Copy the key value

3. **Collections**
   - Does database `tripsaver` exist?
   - Does collection `destinations` exist?
   - Does it have sample documents?

---

## Once You Have Credentials

Once you provide the correct App ID and API Key, I'll:

1. Update `backend/server.js` with your credentials
2. Deploy to Render
3. Test the connection
4. App will use live MongoDB data ✅

---

## Quick Option: Stay with Static Data

If you don't want to look up credentials now:
- App works perfectly with static data
- Deploy as-is
- Add MongoDB later

Let me know which path you prefer! 🚀
