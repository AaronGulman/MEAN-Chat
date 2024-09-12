/**
 * @description Get all users
 * @route GET /api/users
 * @access Public
 */
exports.getUsers = (req, res, db) => {
  db.collection('Users').find({}).toArray((err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve users' });
    }
    res.status(200).json(users);
  });
};

/**
 * @description Create a new user
 * @route POST /api/users
 * @access Public
 */
exports.createUser = (req, res, db) => {
  const { id, username, email, password, roles, groups, interested } = req.body;

  const newUser = {
    id,
    username,
    email,
    password,
    roles: roles || [],
    groups: groups || [],
    interested: interested || []
  };

  db.collection('Users').insertOne(newUser, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to create user' });
    }
    res.status(200).json(result.ops[0]);
  });
};

/**
 * @description Get a single user by ID
 * @route GET /api/users/:id
 * @access Public
 */
exports.getUserById = (req, res, db) => {
  const userId = req.params.id;

  db.collection('Users').findOne({ id: userId }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve user' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  });
};

/**
 * @description Get a single user by Username
 * @route GET /api/users/username/:username
 * @access Public
 */
exports.getUserByUsername = (req, res, db) => {
  const username = req.params.username;

  db.collection('Users').findOne({ username }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve user' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  });
};

/**
 * @description Update a user by ID
 * @route POST /api/users/:id/update
 * @access Public
 */
exports.updateUser = (req, res, db) => {
  const userId = req.params.id;
  const updateData = req.body;

  db.collection('Users').updateOne({ id: userId }, { $set: updateData }, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to update user' });
    }
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  });
};

/**
 * @description Delete a user by ID
 * @route DELETE /api/users/:id
 * @access Public
 */
exports.deleteUser = (req, res, db) => {
  const userId = req.params.id;

  db.collection('Users').deleteOne({ id: userId }, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
};


/**
 * @description Add a group to a user
 * @route POST /api/users/:id/groups/:groupId
 * @access Public
 */
exports.addGroupToUser = (req, res, db) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;

  db.collection('Users').updateOne(
    { id: userId },
    { $addToSet: { groups: groupId } }, 
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to add group to user' });
      }
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: `Group ${groupId} added to user ${userId}` });
    }
  );
};

/**
 * @description Remove a group from a user
 * @route POST /api/users/:id/groups/:groupId/remove
 * @access Public
 */
exports.removeGroupFromUser = (req, res, db) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;

  db.collection('Users').updateOne(
    { id: userId },
    { $pull: { groups: groupId } }, 
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to remove group from user' });
      }
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: `Group ${groupId} removed from user ${userId}` });
    }
  );
};

/**
 * @description Add interest to a user
 * @route POST /api/users/:id/interests/:groupId
 * @access Public
 */
exports.addInterestToUser = (req, res, db) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;

  db.collection('Users').updateOne(
    { id: userId },
    { $addToSet: { interested: groupId } },
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to add interest to user' });
      }
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: `Interest ${groupId} added to user ${userId}` });
    }
  );
};

/**
 * @description Remove interest from a user
 * @route POST /api/users/:id/interests/:groupId/remove
 * @access Public
 */
exports.removeInterestFromUser = (req, res, db) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;

  db.collection('Users').updateOne(
    { id: userId },
    { $pull: { interested: groupId } },
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to remove interest from user' });
      }
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: `Interest ${groupId} removed from user ${userId}` });
    }
  );
};


/**
 * @description Promote a user
 * @route POST /api/users/:id/promote
 * @access Public
 */
exports.promoteUser = (req, res, db) => {
  const userId = req.params.id;

  db.collection('Users').findOne({ id: userId }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve user' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check the user's current role and promote them
    if (user.roles.includes('user')) {
      db.collection('Users').updateOne(
        { id: userId },
        { $set: { roles: ['admin'] } },
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to promote user' });
          }
          res.status(200).json({ message: `User ${userId} promoted to admin` });
        }
      );
    } else if (user.roles.includes('admin')) {
      db.collection('Users').updateOne(
        { id: userId },
        { $set: { roles: ['superadmin'] } },
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to promote user' });
          }
          res.status(200).json({ message: `User ${userId} promoted to superadmin` });
        }
      );
    } else {
      res.status(400).json({ message: `User ${userId} cannot be promoted further` });
    }
  });
};

/**
 * @description Demote a user
 * @route POST /api/users/:id/demote
 * @access Public
 */
exports.demoteUser = (req, res, db) => {
  const userId = req.params.id;

  db.collection('Users').findOne({ id: userId }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve user' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check the user's current role and demote them
    if (user.roles.includes('superadmin')) {
      // Superadmin cannot be demoted
      res.status(400).json({ message: `User ${userId} is a superadmin and cannot be demoted` });
    } else if (user.roles.includes('admin')) {
      db.collection('Users').updateOne(
        { id: userId },
        { $set: { roles: ['user'] } },
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to demote user' });
          }
          res.status(200).json({ message: `User ${userId} demoted to user` });
        }
      );
    } else {
      res.status(400).json({ message: `User ${userId} cannot be demoted further` });
    }
  });
};
