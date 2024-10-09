const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channel.controller.js');

module.exports = (db) => {
    // Route to get all channels for a specific group
    router.get('/channels/:groupId', (req, res) => channelController.getChannels(req, res, db));

    // Route to create a new channel
    router.post('/channels/:groupId', (req, res) => channelController.createChannel(req, res, db));

    // Route to update an existing channel
    router.post('/channels/:groupId/:channelId', (req, res) => channelController.updateChannel(req, res, db));

    // Route to delete a channel by ID
    router.delete('/channels/:groupId/:channelId', (req, res) => channelController.deleteChannel(req, res, db));

    // Route to find a channel by ID
    router.get('/channels/:groupId/:channelId', (req, res) => channelController.getChannelById(req, res, db));


    // Route to add a user to a channel
    router.post('/channels/:groupId/:channelId/addUser', (req, res) => channelController.addUserToChannel(req, res, db));

    // Route to remove a user from a channel
    router.post('/channels/:groupId/:channelId/removeUser', (req, res) => channelController.removeUserFromChannel(req, res, db));
    
    return router;
};
