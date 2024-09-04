const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');

// Route to get all groups
router.get('/groups', groupController.getAllGroups);

// Route to create a new group
router.post('/groups', groupController.createGroup);

// Route to get a group by ID
router.get('/groups/:id', groupController.getGroupById);

// Route to update a group by ID
router.post('/groups/:id/update', groupController.updateGroup);

// Route to delete a group by ID
router.delete('/groups/:id', groupController.deleteGroup);

// Route to add a channel to a group
router.post('/groups/:id/channels', groupController.addChannelToGroup);

// Route to remove a channel from a group
router.delete('/groups/:id/channels/:channelId', groupController.removeChannelFromGroup);

// Route to add a user to a group
router.post('/groups/:id/users/:userId', groupController.addUserToGroup);

// Route to remove a user from a group
router.delete('/groups/:id/users/:userId', groupController.removeUserFromGroup);

// Route to promote a user to admin
router.post('/groups/:id/users/:userId/promote', groupController.promoteToAdmin);

// Route to demote an admin from a group
router.post('/groups/:id/users/:userId/demote', groupController.demoteAdmin);

// Route to register a user as interested in a group
router.post('/groups/:id/users/:userId/interested', groupController.registerUserToGroup);

// Route to approve an interested user
router.post('/groups/:id/users/:userId/approve', groupController.approveInterestedUser);

// Route to deny an interested user
router.delete('/groups/:id/users/:userId/deny', groupController.denyInterestedUser);

// Route to ban a user from a group
router.post('/groups/:id/users/:userId/ban', groupController.banUserFromGroup);

module.exports = router;
