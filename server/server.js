const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, Timestamp } = require('mongodb');
const http = require('http');
const socketIo = require('socket.io');
const setupSocketHandlers = require('./socket.js');
const uploadRoutes = require('./upload');

const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const groupRoutes = require('./routes/group.routes.js');
const channelRoutes = require('./routes/channel.routes.js');
const loggerMiddleware = require('./middleware/middleware.js');
const { time } = require('console');

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

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

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  setupSocketHandlers(io, db);
}




const fs = require('fs');
const path = require('path');

const userFilePath = path.join(__dirname, 'users.json');

// Helper function to read data from JSON file
const readData = () => {
  if (fs.existsSync(userFilePath)) {
    const data = fs.readFileSync(userFilePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
};

// Helper function to write data to JSON file
const writeData = (data) => {
  fs.writeFileSync(userFilePath, JSON.stringify(data, null, 2), 'utf8');
};

async function initializeSuperUser() {
  try {
    const users = readData();
    const superUser = users.find(user => user.username === 'super');
    if (!superUser) {
      const newSuperUser = {
        id: Date.now().toString(),
        username: 'super',
        email: 'super@admin.com',
        password: '123',
        roles: ['superadmin'],
        groups: [],
        interested: []
      };

      users.push(newSuperUser);
      writeData(users);
    }
  } catch (error) {
    console.error('Failed to initialize super user:', error);
  }
}