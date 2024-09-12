const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');



module.exports = (db) => {
    // Route to get all users
    router.get('/users', (req, res) => userController.getAllUsers(req, res, db));

    // Route to create a new user
    router.post('/users', (req, res) => userController.createUser(req, res, db));

    // Route to get a user by ID
    router.get('/users/:id', (req, res) => userController.getUserById(req, res, db));

    // Route to update a user by ID
    router.post('/users/:id/update', (req, res) => userController.updateUser(req, res, db));

    // Route to delete a user by ID
    router.delete('/users/:id', (req, res) => userController.deleteUser(req, res, db));

    // Route to add a group to a user
    router.post('/users/:id/groups/:groupId', (req, res) => userController.addGroupToUser(req, res, db));

    // Route to remove a group from a user
    router.post('/users/:id/groups/:groupId/remove', (req, res) => userController.removeGroupFromUser(req, res, db));

    // Route to add interest to a user
    router.post('/users/:id/interests/:groupId', (req, res) => userController.addInterestToUser(req, res, db));

    // Route to remove interest from a user
    router.post('/users/:id/interests/:groupId/remove', (req, res) => userController.removeInterestFromUser(req, res, db));

    // Route to promote a user
    router.post('/users/:id/promote', (req, res) => userController.promoteUser(req, res, db));

    // Route to demote a user
    router.post('/users/:id/demote', (req, res) => userController.demoteUser(req, res, db));
    return router;
};
