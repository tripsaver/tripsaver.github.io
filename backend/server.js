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

// CORS configuration - allow specific origins
const corsOptions = {
  origin: [
    'https://tripsaver.github.io',
    'https://tripsaver-github-io.onrender.com',
    'http://localhost:4200',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200,
  maxAge: 86400
};

// Apply CORS BEFORE any routes
app.use(cors(corsOptions));

// Explicit preflight handler
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${res.statusCode}`);
  });
  next();
});

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
    
    // Initialize collections on startup
    await initializeCollections();
    
    // Initialize affiliate config with defaults
    await initializeAffiliateConfig();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// Initialize collections and indexes on startup
async function initializeCollections() {
  try {
    console.log('🔧 Initializing database collections...');
    
    // Create contact-submissions collection with indexes
    const contactCollection = db.collection('contact-submissions');
    
    // Create compound index for email and date
    await contactCollection.createIndex({ email: 1, submittedAt: -1 });
    console.log('  ✓ Index created: email, submittedAt');
    
    // Create text index for searching
    await contactCollection.createIndex({ name: 'text', subject: 'text', message: 'text' });
    console.log('  ✓ Text index created: name, subject, message');
    
    console.log('✅ Database initialization complete');
  } catch (err) {
    // Indexes might already exist - this is not an error
    if (err.code === 85) {
      console.log('ℹ️  Indexes already exist (expected on subsequent runs)');
    } else {
      console.warn('⚠️  Issue during collection initialization:', err.message);
    }
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
    const result = await db
      .collection('destinations')
      .findOne({});

    if (!result) {
      return res.json([]);
    }

    // Extract destinations array from wrapper document
    const destinations = result.destinations || [];
    
    res.json(destinations);
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// 🚀 BULK INSERT destinations (ONE-TIME SEED)
app.post('/api/destinations/bulk-insert', async (req, res) => {
  try {
    const { destinations } = req.body;

    if (!Array.isArray(destinations) || destinations.length === 0) {
      return res.status(400).json({ error: 'destinations array required' });
    }

    // Clear existing destinations first (optional - remove if you want to append)
    await db.collection('destinations').deleteMany({});
    console.log('🗑️  Cleared existing destinations');

    // Insert new destinations
    const result = await db
      .collection('destinations')
      .insertMany(destinations);

    console.log(`✅ Inserted ${result.insertedCount} destinations`);

    res.status(201).json({
      success: true,
      inserted: result.insertedCount,
      message: `Successfully inserted ${result.insertedCount} destinations`
    });
  } catch (err) {
    console.error('❌ /api/destinations/bulk-insert:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🎯 SIMPLE SEED ENDPOINT (just visit in browser)
app.get('/api/seed-destinations', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read destinations from file
    const filePath = path.join(__dirname, '../public/assets/data/destinations-full.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const destinations = data.destinations || [];

    if (destinations.length === 0) {
      return res.status(400).json({ error: 'No destinations found in file' });
    }

    // Clear existing
    await db.collection('destinations').deleteMany({});
    console.log('🗑️  Cleared existing destinations');

    // Insert new
    const result = await db.collection('destinations').insertMany(destinations);
    console.log(`✅ Inserted ${result.insertedCount} destinations`);

    res.json({
      success: true,
      inserted: result.insertedCount,
      message: `✅ Successfully inserted ${result.insertedCount} destinations into MongoDB`
    });
  } catch (err) {
    console.error('❌ /api/seed-destinations:', err.message);
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
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Create submission document
    const submission = {
      name,
      email,
      subject,
      message,
      submittedAt: new Date(),
      status: 'new',
      ipAddress: req.ip || 'unknown'
    };

    // Ensure collection exists and insert
    try {
      const collection = db.collection('contact-submissions');
      const result = await collection.insertOne(submission);

      console.log(`✅ Contact submission from ${email}: ${subject}`);
      console.log(`   Inserted ID: ${result.insertedId}`);

      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        submissionId: result.insertedId
      });
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      throw dbError;
    }
  } catch (err) {
    console.error('❌ /api/contact/submit Error:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    
    // Return more detailed error for debugging
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit contact form',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    version: '1.0'
  });
});

// Initialize collections endpoint (optional - for manual re-initialization)
app.post('/api/init', async (req, res) => {
  try {
    console.log('🔧 Manual database initialization requested...');
    await initializeCollections();
    
    res.json({
      success: true,
      message: 'Database re-initialized successfully',
      collections: {
        'contact-submissions': 'ready with indexes'
      }
    });
  } catch (err) {
    console.error('❌ /api/init:', err.message);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/* ===============================
   AFFILIATE CONFIG ENDPOINTS
   =============================== */

// Initialize affiliate config with defaults
app.get('/api/affiliate-config/init', async (req, res) => {
  try {
    const defaultConfig = {
      _id: 'active',
      activePartner: 'amazon',
      affiliateIds: {
        amazon: 'tripsaver21-21',
        agoda: process.env.AGODA_AFFILIATE_ID || 'YOUR_AGODA_ID',
        booking: process.env.BOOKING_AFFILIATE_ID || 'YOUR_BOOKING_ID',
        abhibus: 'kQK6mx'
      },
      partners: {
        amazon: {
          name: 'Amazon',
          logo: '🛒',
          type: 'shopping'
        },
        agoda: {
          name: 'Agoda',
          logo: '🏨',
          type: 'hotel'
        },
        booking: {
          name: 'Booking.com',
          logo: '🏩',
          type: 'hotel'
        },
        abhibus: {
          name: 'AbhiBus',
          logo: '🚌',
          type: 'bus'
        }
      },
      lastUpdated: new Date(),
      updatedBy: 'auto-init'
    };

    // Check if config already exists
    const existing = await db.collection('affiliate-config').findOne({ _id: 'active' });
    
    if (existing) {
      return res.json({
        status: 'already_exists',
        message: 'Config already initialized',
        config: existing
      });
    }

    // Initialize with defaults
    await db.collection('affiliate-config').insertOne(defaultConfig);
    
    console.log('✅ Affiliate config initialized with defaults');

    res.status(201).json({
      status: 'initialized',
      message: 'Config initialized with defaults',
      config: defaultConfig
    });
  } catch (err) {
    console.error('❌ Error initializing affiliate config:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get current affiliate configuration
app.get('/api/affiliate-config', async (req, res) => {
  try {
    let config = await db.collection('affiliate-config').findOne({ _id: 'active' });
    
    // Auto-initialize if not found
    if (!config) {
      console.log('ℹ️  Config not found, auto-initializing...');
      
      // Direct initialization
      config = {
        _id: 'active',
        activePartner: 'amazon',
        affiliateIds: {
          amazon: 'tripsaver21-21',
          agoda: process.env.AGODA_AFFILIATE_ID || 'YOUR_AGODA_ID',
          booking: process.env.BOOKING_AFFILIATE_ID || 'YOUR_BOOKING_ID',
          abhibus: 'kQK6mx'
        },
        partners: {
          amazon: {
            name: 'Amazon',
            logo: '🛒',
            type: 'shopping'
          },
          agoda: {
            name: 'Agoda',
            logo: '🏨',
            type: 'hotel'
          },
          booking: {
            name: 'Booking.com',
            logo: '🏩',
            type: 'hotel'
          },
          abhibus: {
            name: 'AbhiBus',
            logo: '🚌',
            type: 'bus'
          }
        },
        lastUpdated: new Date(),
        updatedBy: 'auto-init'
      };

      await db.collection('affiliate-config').insertOne(config);
      console.log('✅ Auto-initialized affiliate config');
    }

    res.json({
      activePartner: config.activePartner,
      affiliateIds: config.affiliateIds,
      partners: config.partners,
      lastUpdated: config.lastUpdated
    });
  } catch (err) {
    console.error('❌ Error fetching affiliate config:', err);
    res.status(500).json({ error: 'Failed to fetch affiliate config', details: err.message });
  }
});

// Update affiliate configuration
app.post('/api/affiliate-config', async (req, res) => {
  try {
    const { activePartner, affiliateIds, partners } = req.body;

    if (!activePartner) {
      return res.status(400).json({ error: 'activePartner is required' });
    }

    const config = {
      _id: 'active',
      activePartner,
      affiliateIds: affiliateIds || {},
      partners: partners || {},
      lastUpdated: new Date(),
      updatedBy: 'system'
    };

    const result = await db.collection('affiliate-config').updateOne(
      { _id: 'active' },
      { $set: config },
      { upsert: true }
    );

    console.log(`✅ Affiliate config updated: ${activePartner}`);

    res.status(200).json({
      success: true,
      message: 'Affiliate config updated',
      config
    });
  } catch (err) {
    console.error('❌ Error updating affiliate config:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update specific affiliate ID
app.patch('/api/affiliate-config/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { affiliateId } = req.body;

    if (!affiliateId) {
      return res.status(400).json({ error: 'affiliateId is required' });
    }

    const result = await db.collection('affiliate-config').updateOne(
      { _id: 'active' },
      { 
        $set: { 
          [`affiliateIds.${partnerId}`]: affiliateId,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    );

    console.log(`✅ Affiliate ID updated for ${partnerId}`);

    res.status(200).json({
      success: true,
      message: `Affiliate ID updated for ${partnerId}`,
      partnerId,
      affiliateId
    });
  } catch (err) {
    console.error('❌ Error updating affiliate ID:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   AUTO-INITIALIZATION ON STARTUP
   =============================== */
async function initializeAffiliateConfig() {
  try {
    const config = await db.collection('affiliate-config').findOne({ _id: 'active' });
    
    if (!config) {
      console.log('📌 No affiliate config found, initializing...');
      
      const defaultConfig = {
        _id: 'active',
        activePartner: 'amazon',
        affiliateIds: {
          amazon: 'tripsaver21-21',
          agoda: process.env.AGODA_AFFILIATE_ID || 'YOUR_AGODA_ID',
          booking: process.env.BOOKING_AFFILIATE_ID || 'YOUR_BOOKING_ID',
          abhibus: 'kQK6mx'
        },
        partners: {
          amazon: { name: 'Amazon', logo: '🛒', type: 'shopping' },
          agoda: { name: 'Agoda', logo: '🏨', type: 'hotel' },
          booking: { name: 'Booking.com', logo: '🏩', type: 'hotel' },
          abhibus: { name: 'AbhiBus', logo: '🚌', type: 'bus' }
        },
        lastUpdated: new Date(),
        updatedBy: 'startup'
      };

      await db.collection('affiliate-config').insertOne(defaultConfig);
      console.log('✅ Affiliate config initialized on startup');
    } else {
      console.log('✅ Affiliate config already exists:', config.activePartner);
    }
  } catch (err) {
    console.error('❌ Error initializing affiliate config:', err);
  }
}

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
