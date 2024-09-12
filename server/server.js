const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const groupRoutes = require('./routes/group.routes.js');
const channelRoutes = require('./routes/channel.routes.js');
const loggerMiddleware = require('./middleware/middleware.js');

const app = express();

const PORT = process.env.PORT || 3000;

const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
const client = new MongoClient(uri);
const dbName = 'mydb';
let db;

// Connect to MongoDB
client.connect()
  .then(() => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');

    loadServer(db);
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

function loadServer(db) {
  app.use(cors());
  app.use(bodyParser.json());

  // Use the logger middleware
  app.use(loggerMiddleware);

  // Pass `db` to routes
  app.use('/api', authRoutes(db)); 
  app.use('/api', userRoutes(db));
  app.use('/api', groupRoutes(db));
  app.use('/api', channelRoutes(db));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
