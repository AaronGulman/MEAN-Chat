const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channel.controller.js');

module.exports = (db) => {
    // Route to get all channels for a specific group
    router.get('/channels/:groupId', (req, res) => channelController.getChannels(req, res, db));

    // Route to create a new channel
    router.post('/channels', (req, res) => channelController.createChannel(req, res, db));

    // Route to update an existing channel
    router.put('/channels/:groupId/:id', (req, res) => channelController.updateChannel(req, res, db));

    // Route to delete a channel by ID
    router.delete('/channels/:groupId/:id', (req, res) => channelController.deleteChannel(req, res, db));

    // Route to find a channel by ID
    router.get('/channel/:groupId/:id', (req, res) => channelController.getChannelById(req, res, db));
    return router;
};
