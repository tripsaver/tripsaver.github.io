const express = require('express');
const cors = require('cors');
const app = express();

// MongoDB Atlas App Services - REST Data API
const MONGODB_PUBLIC_KEY = process.env.MONGODB_PUBLIC_KEY || 'gzggipjk';
const MONGODB_PRIVATE_KEY = process.env.MONGODB_PRIVATE_KEY || '5c39bfd7-bc63-4656-b088-a147ca8ba608';
const MONGODB_BASE_URL = `https://ap-south-1.aws.data.mongodb-api.com/app/${MONGODB_PUBLIC_KEY}/endpoint/data/v1`;

// Enable CORS for your GitHub Pages domain
app.use(cors({
  origin: ['https://tripsaver.github.io', 'http://localhost:4200', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoding({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'TripSaver Backend', 
    status: 'ok',
    database: 'mongodb-rest-api',
    endpoints: {
      health: 'GET /api/health',
      destinations: 'POST /api/destinations',
      search: 'POST /api/search',
      destinationById: 'GET /api/destinations/:id'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    status: 'ok', 
    service: 'TripSaver Backend', 
    database: 'mongodb-rest-api',
    configured: true,
    timestamp: new Date() 
  });
});

// Proxy endpoint for getting all destinations
app.post('/api/destinations', async (req, res) => {
  try {
    console.log('📍 [POST /api/destinations] Fetching destinations from MongoDB REST API...');
    
    const response = await fetch(`${MONGODB_BASE_URL}/action/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGODB_PRIVATE_KEY
      },
      body: JSON.stringify({
        dataSource: 'Cluster0',
        database: 'tripsaver',
        collection: 'destinations'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ [POST /api/destinations] MongoDB Error:', data);
      return res.status(response.status).json({ 
        error: data, 
        service: 'destinations',
        documents: []
      });
    }

    console.log(`✅ [POST /api/destinations] Fetched ${data.documents?.length || 0} destinations`);
    
    res.json({
      documents: data.documents || []
    });
  } catch (error) {
    console.error('❌ [POST /api/destinations] Error:', error.message);
    res.status(500).json({ 
      error: error.message, 
      service: 'destinations',
      documents: []
    });
  }
});

// Proxy endpoint for searching destinations
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    console.log('📍 [POST /api/search] Search query:', query);
    
    const response = await fetch(`${MONGODB_BASE_URL}/action/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGODB_PRIVATE_KEY
      },
      body: JSON.stringify({
        dataSource: 'Cluster0',
        database: 'tripsaver',
        collection: 'destinations',
        filter: {
          $or: [
            { name: { $regex: query || '', $options: 'i' } },
            { description: { $regex: query || '', $options: 'i' } },
            { location: { $regex: query || '', $options: 'i' } }
          ]
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ [POST /api/search] MongoDB Error:', data);
      return res.status(response.status).json({ 
        error: data,
        documents: []
      });
    }

    console.log(`✅ [POST /api/search] Found ${data.documents?.length || 0} matches`);
    
    res.json({
      documents: data.documents || []
    });
  } catch (error) {
    console.error('❌ [POST /api/search] Error:', error.message);
    res.status(500).json({ 
      error: error.message,
      documents: []
    });
  }
});

// Get single destination by ID
app.get('/api/destinations/:id', async (req, res) => {
  try {
    console.log('📍 [GET /api/destinations/:id] ID:', req.params.id);
    
    const response = await fetch(`${MONGODB_BASE_URL}/action/findOne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGODB_PRIVATE_KEY
      },
      body: JSON.stringify({
        dataSource: 'Cluster0',
        database: 'tripsaver',
        collection: 'destinations',
        filter: { _id: req.params.id }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ [GET /api/destinations/:id] MongoDB Error:', data);
      return res.status(response.status).json({ error: data });
    }

    if (!data.document) {
      console.warn(`⚠️ [GET /api/destinations/:id] Not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    console.log(`✅ [GET /api/destinations/:id] Found: ${data.document.name}`);
    res.json(data.document);
  } catch (error) {
    console.error('❌ [GET /api/destinations/:id] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  console.warn(`⚠️ [${req.method}] ${req.path} - Not Found`);
  res.status(404).json({ 
    error: 'Endpoint not found', 
    path: req.path,
    method: req.method,
    available: [
      'GET /',
      'GET /api/health',
      'POST /api/destinations',
      'POST /api/search (with query body)',
      'GET /api/destinations/:id'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ [ERROR HANDLER] Unhandled error:', err);
  res.status(500).json({ 
    error: err.message, 
    timestamp: new Date() 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TripSaver Backend running on port ${PORT}`);
  console.log(`📊 MongoDB REST Data API configured`);
  console.log(`🌐 CORS enabled for GitHub Pages`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');
  process.exit(0);
});
