/**
 * @description Get all users
 * @route GET /api/users
 * @access Public
 */
exports.getUsers = async (req, res, db) => {
  try {
    const users = await db.collection('Users').find({}).toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve users', error: err.message });
  }
};

/**
 * @description Create a new user
 * @route POST /api/users
 * @access Public
 */
exports.createUser = async (req, res, db) => {
  const { username, email, password, roles, groups, interested } = req.body;

  const newUser = {
    id : new Date(),
    username,
    email,
    password,
    roles: roles || [],
    groups: groups || [],
    interested: interested || []
  };

  try {
    const result = await db.collection('Users').insertOne(newUser);
    res.status(200).json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

/**
 * @description Get a single user by ID
 * @route GET /api/users/:id
 * @access Public
 */
exports.getUserById = async (req, res, db) => {
  const userId = req.params.id;

  try {
    const user = await db.collection('Users').findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve user', error: err.message });
  }
};

/**
 * @description Get a single user by Username
 * @route GET /api/users/username/:username
 * @access Public
 */
exports.getUserByUsername = async (req, res, db) => {
  const username = req.params.username;

  try {
    const user = await db.collection('Users').findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve user', error: err.message });
  }
};

/**
 * @description Update a user by ID
 * @route POST /api/users/:id/update
 * @access Public
 */
exports.updateUser = async (req, res, db) => {
  const userId = req.params.id;
  const updateData = req.body;

  try {
    const result = await db.collection('Users').updateOne({ id: userId }, { $set: updateData });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

/**
 * @description Delete a user by ID
 * @route DELETE /api/users/:id
 * @access Public
 */
exports.deleteUser = async (req, res, db) => {
  const userId = req.params.id;

  try {
    // Find the user by ID
    const user = await db.collection('Users').findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Iterate through the user's groups and remove the user from all relevant fields
    if (user.groups && user.groups.length > 0) {
      const updateGroups = await db.collection('Groups').updateMany(
        { id: { $in: user.groups } }, // Find all groups the user is a part of
        {
          $pull: {
            members: userId,
            admins: userId,
            banned: userId,
            interested: userId
          }
        }
      );
    }

    // Proceed to delete the user after removing them from all group fields
    const result = await db.collection('Users').deleteOne({ id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return success message, indicating that the user was deleted and groups updated
    res.status(200).json({
      message: 'User deleted successfully and removed from all relevant groups'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};


/**
 * @description Add a group to a user
 * @route POST /api/users/:id/groups/:groupId
 * @access Public
 */
exports.addGroupToUser = async (req, res, db) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;

  try {
    const result = await db.collection('Users').updateOne({ id: userId }, { $addToSet: { groups: groupId } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: `Group ${groupId} added to user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add group to user', error: err.message });
  }
};

/**
 * @description Remove a group from a user
 * @route POST /api/users/:id/groups/:groupId/remove
 * @access Public
 */
exports.removeGroupFromUser = async (req, res, db) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;

  try {
    const result = await db.collection('Users').updateOne({ id: userId }, { $pull: { groups: groupId } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: `Group ${groupId} removed from user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove group from user', error: err.message });
  }
};

/**
 * @description Add interest to a user
 * @route POST /api/users/:id/interests/:groupId
 * @access Public
 */
exports.addInterestToUser = async (req, res, db) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;
  try {
    const result = await db.collection('Users').updateOne({ id: userId }, { $addToSet: { interested: groupId } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: `Interest ${groupId} added to user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add interest to user', error: err.message });
  }
};

/**
 * @description Remove interest from a user
 * @route POST /api/users/:id/interests/:groupId/remove
 * @access Public
 */
exports.removeInterestFromUser = async (req, res, db) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;

  try {
    const result = await db.collection('Users').updateOne({ id: userId }, { $pull: { interested: groupId } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: `Interest ${groupId} removed from user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove interest from user', error: err.message });
  }
};

/**
 * @description Promote a user
 * @route POST /api/users/:id/promote
 * @access Public
 */
exports.promoteUser = async (req, res, db) => {
  const userId = req.params.id;

  try {
    const user = await db.collection('Users').findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.roles.includes('user')) {
      await db.collection('Users').updateOne({ id: userId }, { $set: { roles: ['admin'] } });
      res.status(200).json({ message: `User ${userId} promoted to admin` });
    } else if (user.roles.includes('admin')) {
      await db.collection('Users').updateOne({ id: userId }, { $set: { roles: ['superadmin'] } });
      res.status(200).json({ message: `User ${userId} promoted to superadmin` });
    } else {
      res.status(400).json({ message: `User ${userId} cannot be promoted further` });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to promote user', error: err.message });
  }
};

/**
 * @description Demote a user
 * @route POST /api/users/:id/demote
 * @access Public
 */
exports.demoteUser = async (req, res, db) => {
  const userId = req.params.id;

  try {
    const user = await db.collection('Users').findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.roles.includes('superadmin')) {
      res.status(400).json({ message: `User ${userId} is a superadmin and cannot be demoted` });
    } else if (user.roles.includes('admin')) {
      await db.collection('Users').updateOne({ id: userId }, { $set: { roles: ['user'] } });
      res.status(200).json({ message: `User ${userId} demoted to user` });
    } else {
      res.status(400).json({ message: `User ${userId} cannot be demoted further` });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to demote user', error: err.message });
  }
};
