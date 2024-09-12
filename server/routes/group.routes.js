const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller.js');



module.exports = (db) => {
    // Route to get all groups
    router.get('/groups', (req, res) => groupController.getAllGroups(req, res, db));

    // Route to create a new group
    router.post('/groups', (req, res) => groupController.createGroup(req, res, db));

    // Route to get a group by ID
    router.get('/groups/:id', (req, res) => groupController.getGroupById(req, res, db));

    // Route to update a group by ID
    router.post('/groups/:id/update', (req, res) => groupController.updateGroup(req, res, db));

    // Route to delete a group by ID
    router.delete('/groups/:id', (req, res) => groupController.deleteGroup(req, res, db));

    // Route to add a channel to a group
    router.post('/groups/:id/channels', (req, res) => groupController.addChannelToGroup(req, res, db));

    // Route to remove a channel from a group
    router.delete('/groups/:id/channels/:channelId', (req, res) => groupController.removeChannelFromGroup(req, res, db));

    // Route to add a user to a group
    router.post('/groups/:id/users/:userId', (req, res) => groupController.addUserToGroup(req, res, db));

    // Route to remove a user from a group
    router.delete('/groups/:id/users/:userId', (req, res) => groupController.removeUserFromGroup(req, res, db));

    // Route to promote a user to admin
    router.post('/groups/:id/users/:userId/promote', (req, res) => groupController.promoteToAdmin(req, res, db));

    // Route to demote an admin from a group
    router.post('/groups/:id/users/:userId/demote', (req, res) => groupController.demoteAdmin(req, res, db));

    // Route to register a user as interested in a group
    router.post('/groups/:id/users/:userId/interested', (req, res) => groupController.registerUserToGroup(req, res, db));

    // Route to approve an interested user
    router.post('/groups/:id/users/:userId/approve', (req, res) => groupController.approveInterestedUser(req, res, db));

    // Route to deny an interested user
    router.delete('/groups/:id/users/:userId/deny', (req, res) => groupController.denyInterestedUser(req, res, db));

    // Route to ban a user from a group
    router.post('/groups/:id/users/:userId/ban', (req, res) => groupController.banUserFromGroup(req, res, db));
    return router;
};
