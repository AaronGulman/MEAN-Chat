const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const https = require('https'); // For HTTPS server
const fs = require('fs');
const socketIo = require('socket.io');
const setupSocketHandlers = require('./socket.js');
const initializeSuperUser = require('./initSuperUser.js');
const uploadRoutes = require('./upload');

const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const groupRoutes = require('./routes/group.routes.js');
const channelRoutes = require('./routes/channel.routes.js');
const loggerMiddleware = require('./middleware/middleware.js');

const app = express();
const PORT = 3000;

// Load SSL Certificate and Key for HTTPS
const privateKey = fs.readFileSync('./config/server.key', 'utf8');
const certificate = fs.readFileSync('./config/server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server for Express
const server = https.createServer(credentials, app);

// Initialize Socket.IO with HTTPS server on Port 3000
const io = socketIo(server, {
  cors: {
    origin: 'https://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

// MongoDB Setup
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'Frameworks-Assignment';
let db;

client.connect()
  .then(() => {
    db = client.db(dbName);
    initializeSuperUser(db);
    loadServer(db);
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

function loadServer(db) {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(loggerMiddleware);
  app.use('/api', authRoutes(db));
  app.use('/api', userRoutes(db));
  app.use('/api', groupRoutes(db));
  app.use('/api', channelRoutes(db));
  app.use('/api', uploadRoutes);

  // Serve uploads directory as static files
  app.use('/uploads', express.static('uploads'));

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

  // Start the HTTPS server on port 3000
  server.listen(PORT, () => {
    console.log(`Secure server (Express & Socket.IO) is running on https://localhost:${PORT}`);
  });

  // Set up Socket.IO handlers
  setupSocketHandlers(io, db);
}
