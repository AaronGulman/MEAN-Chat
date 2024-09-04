// user.route.js

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

// Route to get all users
router.get('/users', userController.getAllUsers);

// Route to create a new user
router.post('/users', userController.createUser);

// Route to get a user by ID
router.get('/users/:id', userController.getUserById);

// Route to update a user by ID
router.post('/users/:id/update', userController.updateUser);

// Route to delete a user by ID
router.delete('/users/:id', userController.deleteUser);

// Route to add a group to a user
router.post('/users/:id/groups/:groupId', userController.addGroupToUser);

// Route to remove a group from a user
router.post('/users/:id/groups/:groupId/remove', userController.removeGroupFromUser);

// Route to add interest to a user
router.post('/users/:id/interests/:groupId', userController.addInterestToUser);

// Route to remove interest from a user
router.post('/users/:id/interests/:groupId/remove', userController.removeInterestFromUser);

// Route to promote a user
router.post('/users/:id/promote', userController.promoteUser);

// Route to demote a user
router.post('/users/:id/demote', userController.demoteUser);

module.exports = router;
