const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, Timestamp } = require('mongodb');
const http = require('http');
const socketIo = require('socket.io');

const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const groupRoutes = require('./routes/group.routes.js');
const channelRoutes = require('./routes/channel.routes.js');
const loggerMiddleware = require('./middleware/middleware.js');
const Message = require('./models/message.model.js');
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

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  setupSocketHandlers(io, db);
}

function setupSocketHandlers(io, db) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinChannel', ({ channelId }) => {
      console.log(`User ${socket.id} joining channel: ${channelId}`);
      socket.join(channelId);
    });

    socket.on('leaveChannel', ({ channelId }) => {
      console.log(`User ${socket.id} leaving channel: ${channelId}`);
      socket.leave(channelId);
    });

    socket.on('sendMessage', async ({ channelId, userId, message, timeStamp }) => {
      console.log(`User ${userId} sending message to channel ${channelId}: ${message}`);
      const messageData = new Message(channelId, userId, message, timeStamp);

      try {
        const messagesCollection = db.collection('Messages');
        await messagesCollection.insertOne(messageData);
        console.log('Message saved to database:', messageData);
        socket.to(channelId).emit('receiveMessage', messageData);
        console.log(`Message emitted to channel ${channelId}`);
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    });

    socket.on('receiveMessage', ({ channelId, userId, message, timeStamp }) => {
      console.log(`Message received in channel ${channelId} from user ${userId}: ${message} at ${timeStamp}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

async function initializeSuperUser(db) {
  try {
    const usersCollection = db.collection('Users');
    const superUser = await usersCollection.findOne({ username: 'super' });
    
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

      await usersCollection.insertOne(newSuperUser);
    }
  } catch (error) {
    console.error('Failed to initialize super user:', error);
  }
}
