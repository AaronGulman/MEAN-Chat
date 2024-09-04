const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channel.controller');

// Route to get all channels for a specific group
router.get('/channels/:groupId', channelController.getChannels);

// Route to create a new channel
router.post('/channels', channelController.createChannel);

// Route to update an existing channel
router.put('/channels/:groupId/:id', channelController.updateChannel);

// Route to delete a channel by ID
router.delete('/channels/:groupId/:id', channelController.deleteChannel);

// Route to find a channel by ID
router.get('/channel/:groupId/:id', channelController.getChannelById);

module.exports = router;
