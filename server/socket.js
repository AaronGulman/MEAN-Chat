const chalk = require('chalk');
const Message = require('./models/message.model.js');

function setupSocketHandlers(io, db) {
  io.on('connection', (socket) => {
    console.log(chalk.green('A user connected:'), socket.id);

    socket.on('joinChannel', ({ channelId }) => {
      console.log(chalk.blue(`User ${socket.id} joining channel: ${channelId}`));
      socket.join(channelId);
    });

    socket.on('leaveChannel', ({ channelId }) => {
      console.log(chalk.yellow(`User ${socket.id} leaving channel: ${channelId}`));
      socket.leave(channelId);
    });

    socket.on('sendMessage', async ({ channelId, userId, message, timeStamp }) => {
      console.log(chalk.magenta(`User ${userId} sending message to channel ${channelId}: ${message}`));
      const messageData = new Message(channelId, userId, message, timeStamp);

      try {
        const messagesCollection = db.collection('Messages');
        await messagesCollection.insertOne(messageData);
        console.log(chalk.green('Message saved to database:'), messageData);
        io.in(channelId).emit('receiveMessage', messageData);
        console.log(chalk.cyan(`Message emitted to channel ${channelId}`));
      } catch (error) {
        console.error(chalk.red('Failed to save message:'), error);
      }
    });

    socket.on('receiveMessage', ({ channelId, userId, message, timeStamp }) => {
      console.log(chalk.cyan(`Message received in channel ${channelId} from user ${userId}: ${message} at ${timeStamp}`));
    });

    socket.on('disconnect', () => {
      console.log(chalk.red('User disconnected:'), socket.id);
    });
  });
}

module.exports = setupSocketHandlers;