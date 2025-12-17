/**
 * TripSaver Backend – Express + MongoDB Atlas
 * ✔ No MongoDB Data API
 * ✔ No App Services App ID
 * ✔ Uses MongoDB connection string
 * ✔ Safe for Render deployment
 */

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

/* ===============================
   ENVIRONMENT VARIABLES (REQUIRED)
   =============================== */
const MONGODB_URI = process.env.MONGODB_URI; // mongodb+srv://...
const DB_NAME = 'tripsaver';
const PORT = process.env.PORT || 3000;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
  process.exit(1);
}

/* ===============================
   MIDDLEWARE
   =============================== */
app.use(cors({
  origin: [
    'https://tripsaver.github.io',
    'http://localhost:4200',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   MONGODB CONNECTION
   =============================== */
let db;
let client;

async function connectToMongo() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

/* ===============================
   ROUTES
   =============================== */

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'TripSaver Backend',
    status: 'ok',
    database: 'mongodb-atlas',
    endpoints: {
      health: 'GET /api/health',
      destinations: 'GET /api/destinations',
      search: 'POST /api/search',
      destinationById: 'GET /api/destinations/:id'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'connected',
    timestamp: new Date()
  });
});

// Get all destinations
app.get('/api/destinations', async (req, res) => {
  try {
    const destinations = await db
      .collection('destinations')
      .find({})
      .toArray();

    res.json(destinations);
  } catch (err) {
    console.error('❌ /api/destinations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Search destinations
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;

    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } }
          ]
        }
      : {};

    const results = await db
      .collection('destinations')
      .find(filter)
      .toArray();

    res.json(results);
  } catch (err) {
    console.error('❌ /api/search:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get destination by ID
app.get('/api/destinations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await db
      .collection('destinations')
      .findOne({ _id: new ObjectId(id) });

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destination);
  } catch (err) {
    console.error('❌ /api/destinations/:id:', err.message);
    res.status(500).json({ error: 'Invalid ID format' });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

/* ===============================
   START SERVER
   =============================== */
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TripSaver Backend running on port ${PORT}`);
  });
});

/* ===============================
   GRACEFUL SHUTDOWN
   =============================== */
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');
  if (client) await client.close();
  process.exit(0);
});
