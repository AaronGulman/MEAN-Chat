const chalk = require('chalk');
const Message = require('./models/message.model.js');

/**
 * Sets up socket event handlers for user connections, message handling, and channel management.
 *
 * @param {object} io - The socket.io server instance.
 * @param {object} db - The MongoDB database instance.
 */
function setupSocketHandlers(io, db) {
  // Event listener for when a new user connects to the socket
  io.on('connection', (socket) => {
    console.log(chalk.green('A user connected:'), socket.id);

    /**
     * Event listener for joining a specific channel.
     * @param {object} data - Contains channelId to join.
     */
    socket.on('joinChannel', ({ channelId }) => {
      console.log(chalk.blue(`User ${socket.id} joining channel: ${channelId}`));
      socket.join(channelId);
    });

    /**
     * Event listener for leaving a specific channel.
     * @param {object} data - Contains channelId to leave.
     */
    socket.on('leaveChannel', ({ channelId }) => {
      console.log(chalk.yellow(`User ${socket.id} leaving channel: ${channelId}`));
      socket.leave(channelId);
    });

    /**
     * Event listener for sending a message to a channel.
     * Saves the message to the database and emits it to all clients in the channel.
     *
     * @param {object} data - Contains channelId, userId, message, timeStamp, and uploadUrl.
     */
    socket.on('sendMessage', async ({ channelId, userId, message, timeStamp, uploadUrl }) => {
      console.log(chalk.magenta(`User ${userId} sending message to channel ${channelId}: ${message}`));
      const messageData = new Message(channelId, userId, message, timeStamp, uploadUrl);

      try {
        const messagesCollection = db.collection('Messages');
        await messagesCollection.insertOne(messageData);
        console.log(chalk.green('Message saved to database:'), messageData);

        // Emit the message to all users in the channel
        io.in(channelId).emit('receiveMessage', messageData);
        console.log(chalk.cyan(`Message emitted to channel ${channelId}`));
      } catch (error) {
        console.error(chalk.red('Failed to save message:'), error);
      }
    });

    /**
     * Event listener for receiving a message in a channel.
     * Logs the received message to the console.
     *
     * @param {object} data - Contains channelId, userId, message, and timeStamp.
     */
    socket.on('receiveMessage', ({ channelId, userId, message, timeStamp }) => {
      console.log(chalk.cyan(`Message received in channel ${channelId} from user ${userId}: ${message} at ${timeStamp}`));
    });

    /**
     * Event listener for handling peerID communication between clients.
     * Broadcasts the peerID to all connected clients.
     *
     * @param {string} message - The peerID message.
     */
    socket.on('peerID', (message) => {
      io.emit('peerID', message);
      console.log("Peer ID: ", message);
    });

    // Event listener for when a user disconnects from the socket
    socket.on('disconnect', () => {
      console.log(chalk.red('User disconnected:'), socket.id);
    });
  });
}

module.exports = setupSocketHandlers;
