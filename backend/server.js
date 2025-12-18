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
    collections: ['destinations', 'trust-badges', 'trust-messages'],
    endpoints: {
      health: 'GET /api/health',
      destinations: 'GET /api/destinations',
      search: 'POST /api/search',
      destinationById: 'GET /api/destinations/:id',
      trustBadges: 'GET /api/trust-badges',
      trustMessages: 'GET /api/trust-messages',
      trustMessagesByContext: 'GET /api/trust-messages/:context'
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

// Get trust badges
app.get('/api/trust-badges', async (req, res) => {
  try {
    const badges = await db
      .collection('trust-badges')
      .find({})
      .toArray();

    res.json(badges);
  } catch (err) {
    console.error('❌ /api/trust-badges:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get trust messages
app.get('/api/trust-messages', async (req, res) => {
  try {
    const messages = await db
      .collection('trust-messages')
      .find({})
      .toArray();

    res.json(messages);
  } catch (err) {
    console.error('❌ /api/trust-messages:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get trust messages by context
app.get('/api/trust-messages/:context', async (req, res) => {
  try {
    const { context } = req.params;

    const messages = await db
      .collection('trust-messages')
      .find({ context: context })
      .toArray();

    res.json(messages);
  } catch (err) {
    console.error('❌ /api/trust-messages/:context:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Seed destinations (one-time setup)
app.post('/api/seed', async (req, res) => {
  try {
    console.log('📝 Seeding destinations collection...');
    
    const destinations = [
      { state: 'Goa', categories: ['Beach', 'Party'], bestMonths: [11, 12, 1, 2], avoidMonths: [6, 7, 8], climate: 'tropical', budget: 'moderate', agoda: 'goa-in' },
      { state: 'Maharashtra', categories: ['City', 'Coastal'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [6, 7, 8], climate: 'humid', budget: 'premium', agoda: 'mumbai-in' },
      { state: 'Maharashtra', categories: ['City', 'Hill'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [6, 7, 8], climate: 'moderate', budget: 'moderate', agoda: 'pune-in' },
      { state: 'Himachal Pradesh', categories: ['Mountain', 'Snow'], bestMonths: [3, 4, 5, 10], avoidMonths: [7, 8], climate: 'cold', budget: 'budget', agoda: 'manali-in' },
      { state: 'Himachal Pradesh', categories: ['Hill', 'Colonial'], bestMonths: [3, 4, 5, 10], avoidMonths: [7, 8], climate: 'cold', budget: 'budget', agoda: 'shimla-in' },
      { state: 'Rajasthan', categories: ['Heritage'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'hot', budget: 'budget', agoda: 'jaipur-in' },
      { state: 'Rajasthan', categories: ['Romantic', 'Heritage'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'hot', budget: 'moderate', agoda: 'udaipur-in' },
      { state: 'Rajasthan', categories: ['Heritage'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'hot', budget: 'budget', agoda: 'jodhpur-in' },
      { state: 'Uttarakhand', categories: ['Spiritual', 'Adventure'], bestMonths: [3, 4, 5, 10, 11], avoidMonths: [7, 8], climate: 'cool', budget: 'budget', agoda: 'rishikesh-in' },
      { state: 'Delhi', categories: ['City', 'Culture', 'Heritage'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6, 7], climate: 'hot', budget: 'premium', agoda: 'delhi-in' },
      { state: 'Uttar Pradesh', categories: ['Heritage'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [6, 7, 8], climate: 'extreme', budget: 'budget', agoda: 'agra-in' },
      { state: 'Uttar Pradesh', categories: ['Spiritual', 'Culture'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [6, 7, 8], climate: 'extreme', budget: 'budget', agoda: 'varanasi-in' },
      { state: 'Ladakh', categories: ['Adventure', 'Mountain'], bestMonths: [6, 7, 8, 9], avoidMonths: [11, 12, 1, 2, 3], climate: 'cold', budget: 'premium', agoda: 'leh-in' },
      { state: 'Jammu & Kashmir', categories: ['Nature', 'Romantic'], bestMonths: [4, 5, 9, 10], avoidMonths: [11, 12, 1, 2], climate: 'cool', budget: 'moderate', agoda: 'srinagar-in' },
      { state: 'Jammu & Kashmir', categories: ['Snow', 'Ski'], bestMonths: [1, 2, 3], avoidMonths: [5, 6, 7, 8, 9], climate: 'cold', budget: 'premium', agoda: 'gulmarg-in' },
      { state: 'Kerala', categories: ['Backwaters', 'Culture'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6, 7], climate: 'tropical', budget: 'moderate', agoda: 'kochi-in' },
      { state: 'Kerala', categories: ['Hill', 'Nature'], bestMonths: [9, 10, 11, 12, 1], avoidMonths: [4, 5], climate: 'tropical', budget: 'budget', agoda: 'munnar-in' },
      { state: 'Kerala', categories: ['Backwaters'], bestMonths: [8, 9, 10, 11, 12], avoidMonths: [5, 6, 7], climate: 'tropical', budget: 'budget', agoda: 'alleppey-in' },
      { state: 'Tamil Nadu', categories: ['Hill'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [4, 5, 6], climate: 'cool', budget: 'budget', agoda: 'ooty-in' },
      { state: 'Puducherry', categories: ['Beach', 'Culture', 'Colonial'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6, 7], climate: 'tropical', budget: 'budget', agoda: 'puducherry-in' },
      { state: 'Karnataka', categories: ['Heritage'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'moderate', budget: 'budget', agoda: 'hampi-in' },
      { state: 'Karnataka', categories: ['Hill', 'Nature'], bestMonths: [9, 10, 11, 12, 1], avoidMonths: [4, 5, 6], climate: 'cool', budget: 'budget', agoda: 'coorg-in' },
      { state: 'Karnataka', categories: ['Beach'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'tropical', budget: 'budget', agoda: 'gokarna-in' },
      { state: 'West Bengal', categories: ['Hill', 'Colonial'], bestMonths: [3, 4, 9, 10, 11], avoidMonths: [6, 7, 8], climate: 'cool', budget: 'budget', agoda: 'darjeeling-in' },
      { state: 'Sikkim', categories: ['Hill', 'Nature'], bestMonths: [3, 4, 5, 10, 11], avoidMonths: [6, 7], climate: 'cold', budget: 'budget', agoda: 'gangtok-in' },
      { state: 'Meghalaya', categories: ['Nature', 'Hill'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6, 7], climate: 'wet', budget: 'budget', agoda: 'shillong-in' },
      { state: 'Andaman & Nicobar', categories: ['Island', 'Beach'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6, 7, 8], climate: 'tropical', budget: 'premium', agoda: 'andaman-in' },
      { state: 'Punjab', categories: ['Spiritual', 'Heritage'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6, 7], climate: 'extreme', budget: 'budget', agoda: 'amritsar-in' },
      { state: 'Kerala', categories: ['Beach', 'Spiritual'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6, 7], climate: 'tropical', budget: 'budget', agoda: 'thiruvananthapuram-in' },
      { state: 'Tamil Nadu', categories: ['Hill'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [4, 5, 6], climate: 'cool', budget: 'budget', agoda: 'coonoor-in' },
      { state: 'Maharashtra', categories: ['Hill'], bestMonths: [9, 10, 11, 12], avoidMonths: [5, 6, 7], climate: 'moderate', budget: 'budget', agoda: 'mahabaleshwar-in' },
      { state: 'Maharashtra', categories: ['Hill'], bestMonths: [9, 10, 11, 12], avoidMonths: [5, 6, 7], climate: 'moderate', budget: 'budget', agoda: 'panchgani-in' },
      { state: 'Uttarakhand', categories: ['Spiritual'], bestMonths: [4, 5, 10, 11], avoidMonths: [7, 8], climate: 'cool', budget: 'budget', agoda: 'uttarkashi-in' },
      { state: 'Kerala', categories: ['Nature', 'Wildlife'], bestMonths: [11, 12, 1, 2], avoidMonths: [5, 6, 7], climate: 'tropical', budget: 'budget', agoda: 'thekkady-in' },
      { state: 'Assam', categories: ['Wildlife', 'Nature'], bestMonths: [11, 12, 1, 2], avoidMonths: [5, 6, 7], climate: 'wet', budget: 'budget', agoda: 'kaziranga-in' },
      { state: 'Karnataka', categories: ['Heritage', 'Culture'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'hot', budget: 'budget', agoda: 'bangalore-in' },
      { state: 'Rajasthan', categories: ['Wildlife'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'hot', budget: 'moderate', agoda: 'jaisalmer-in' },
      { state: 'Madhya Pradesh', categories: ['Heritage'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'hot', budget: 'budget', agoda: 'khajuraho-in' },
      { state: 'Rajasthan', categories: ['Spiritual', 'Culture'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'hot', budget: 'budget', agoda: 'pushkar-in' },
      { state: 'Rajasthan', categories: ['Hill'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6], climate: 'hot', budget: 'budget', agoda: 'mount-abu-in' },
      { state: 'Meghalaya', categories: ['Nature'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [5, 6, 7], climate: 'wet', budget: 'budget', agoda: 'cherrapunji-in' },
      { state: 'Tamil Nadu', categories: ['Heritage', 'Spiritual'], bestMonths: [10, 11, 12, 1, 2], avoidMonths: [4, 5, 6], climate: 'hot', budget: 'budget', agoda: 'madurai-in' },
      { state: 'Uttarakhand', categories: ['Hill', 'Lake'], bestMonths: [5, 6, 9, 10], avoidMonths: [11, 12, 1, 2], climate: 'cool', budget: 'budget', agoda: 'nainital-in' },
      { state: 'Uttarakhand', categories: ['Hill', 'Colonial'], bestMonths: [3, 4, 5, 10, 11], avoidMonths: [7, 8], climate: 'cool', budget: 'budget', agoda: 'almora-in' }
    ];

    // Drop and recreate
    const collection = db.collection('destinations');
    await collection.deleteMany({});
    const result = await collection.insertMany(destinations);

    res.json({
      message: `✅ Seeded ${result.insertedCount} destinations`,
      count: result.insertedCount
    });
  } catch (err) {
    console.error('❌ /api/seed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Submit Contact Form
app.post('/api/contact/submit', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create submission document
    const submission = {
      name,
      email,
      subject,
      message,
      submittedAt: new Date(),
      status: 'new',
      ipAddress: req.ip
    };

    // Insert into MongoDB
    const result = await db
      .collection('contact-submissions')
      .insertOne(submission);

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: result.insertedId
    });

    console.log(`✅ Contact submission from ${email}: ${subject}`);
  } catch (err) {
    console.error('❌ /api/contact/submit:', err.message);
    res.status(500).json({ error: 'Failed to submit contact form' });
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
