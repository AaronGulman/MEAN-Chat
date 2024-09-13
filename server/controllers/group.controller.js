const { ObjectId } = require('mongodb');
const { removeInterestFromUser } = require('./user.controller');

/**
 * @description Get all groups
 * @route GET /api/groups
 * @access Public
 */
exports.getAllGroups = async (req, res, db) => {
  try {
    // Fetch all groups
    const groups = await db.collection('Groups').find({}).toArray();

    // Iterate over each group and populate banned users
    const populatedGroups = await Promise.all(
      groups.map(async (group) => {
        if (group.banned && group.banned.length > 0) {
          const bannedUsers = await Promise.all(
            group.banned.map(async (userId) => {
              return await db.collection('Users').findOne({ id: userId });
            })
          );
          group.banned = bannedUsers.filter(user => user !== null && user !== undefined);
        }
        return group;
      })
    );

    res.status(200).json(populatedGroups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve groups', error: err.message });
  }
};


/**
 * @description Create a new group
 * @route POST /api/groups
 * @access Public
 */
exports.createGroup = async (req, res, db) => {
  const { name, description, admin } = req.body;
  const newGroup = {
    id: Date.now().toString(),
    name,
    description,
    admins: [admin.id],
    members: [],
    channels: [],
    interested: [],
    banned: [],
  };

  try {
    const result = await db.collection('Groups').insertOne(newGroup);
    res.status(201).json({ message: 'Group created', newGroup });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', error: err.message });
  }
};

/**
 * @description Get a single group by ID
 * @route GET /api/groups/:id
 * @access Public
 */
exports.getGroupById = async (req, res, db) => {
  const groupId = req.params.id;
  
  try {
    const group = await db.collection('Groups').findOne({ id: groupId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Populate interested users
    if (group.interested && group.interested.length > 0) {
      const interestedUsers = await Promise.all(
        group.interested.map(async (userId) => {
          return await db.collection('Users').findOne({ id: userId });
        })
      );
      group.interested = interestedUsers;
    }

    // Populate member users
    if (group.members && group.members.length > 0) {
      const memberUsers = await Promise.all(
        group.members.map(async (userId) => {
          return await db.collection('Users').findOne({ id: userId });
        })
      );
      group.members = memberUsers;
    }

    // Check if admins exist, if not, add the "super" user
    if (!group.admins || group.admins.length === 0) {
      const superUser = await db.collection('Users').findOne({ username: 'super' });

      if (!superUser) {
        return res.status(500).json({ message: 'Super user not found' });
      }

      // Add super user to the admins array
      group.admins = [superUser.id];
      
      // Update the group in the database to reflect this change
      await db.collection('Groups').updateOne({ id: groupId }, { $set: { admins: group.admins } });
    }

    // Populate admin users
    const adminUsers = await Promise.all(
      group.admins.map(async (userId) => {
        return await db.collection('Users').findOne({ id: userId });
      })
    );
    group.admins = adminUsers;

    // Populate banned users
    if (group.banned && group.banned.length > 0) {
      const bannedUsers = await Promise.all(
        group.banned.map(async (userId) => {
          return await db.collection('Users').findOne({ id: userId });
        })
      );
      group.banned = bannedUsers.filter(user => user !== null && user !== undefined);
    }

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve group', error: err.message });
  }
};




/**
 * @description Update a group by ID
 * @route POST /api/groups/:id/update
 * @access Public
 */
exports.updateGroup = async (req, res, db) => {
  const groupId = req.params.id;
  const updateData = req.body;

  try {
    const result = await db.collection('Groups').updateOne({ id: groupId }, { $set: updateData });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ message: 'Group updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update group', error: err.message });
  }
};

/**
 * @description Delete a group by ID
 * @route DELETE /api/groups/:id
 * @access Public
 */
exports.deleteGroup = async (req, res, db) => {
  const groupId = req.params.id;

  try {
    // Find the group to delete
    const group = await db.collection('Groups').findOne({ id: groupId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Remove the group from members, admins, and interested users
    const updateMembers = db.collection('Users').updateMany(
      { id: { $in: group.members } },
      { $pull: { groups: groupId } }
    );
    
    const updateAdmins = db.collection('Users').updateMany(
      { id: { $in: group.admins } },
      { $pull: { groups: groupId, roles: 'admin' } }
    );

    const updateInterested = db.collection('Users').updateMany(
      { id: { $in: group.interested } },
      { $pull: { interested: groupId } }
    );

    // Wait for all user updates to complete
    await Promise.all([updateMembers, updateAdmins, updateInterested]);

    // Delete the group from the Groups collection
    const result = await db.collection('Groups').deleteOne({ id: groupId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json({ message: 'Group deleted successfully and removed from all users' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete group', error: err.message });
  }
};


/**
 * @description Add a channel to a group
 * @route POST /api/groups/:id/channels
 * @access Public
 */
exports.addChannelToGroup = async (req, res, db) => {
  const groupId = req.params.id;
  const { channelId } = req.body;

  try {
    const result = await db.collection('Groups').updateOne(
      { id: groupId },
      { $addToSet: { channels: channelId } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ message: `Channel ${channelId} added to group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add channel to group', error: err.message });
  }
};

/**
 * @description Remove a channel from a group
 * @route DELETE /api/groups/:id/channels/:channelId
 * @access Public
 */
exports.removeChannelFromGroup = async (req, res, db) => {
  const groupId = req.params.id;
  const channelId = req.params.channelId;

  try {
    const result = await db.collection('Groups').updateOne(
      { id: groupId },
      { $pull: { channels: channelId } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ message: `Channel ${channelId} removed from group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove channel from group', error: err.message });
  }
};

/**
 * @description Add a user to a group
 * @route POST /api/groups/:id/users/:userId
 * @access Public
 */
exports.addUserToGroup = async (req, res, db) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const result = await db.collection('Groups').updateOne(
      { id: groupId },
      { $addToSet: { members: userId } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ message: `User ${userId} added to group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add user to group', error: err.message });
  }
};

/**
 * @description Remove a user from a group
 * @route DELETE /api/groups/:id/users/:userId
 * @access Public
 */
exports.removeUserFromGroup = async (req, res, db) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    // Perform both updates concurrently
    const [groupResult, userResult] = await Promise.all([
      db.collection('Groups').updateOne({ id: groupId }, { $pull: { members: userId, admins: userId } }),
      db.collection('Users').updateOne({ id: userId }, { $pull: { groups: groupId } })
    ]);

    // Check if the group was found and updated
    if (groupResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the user was found and updated
    if (userResult.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: `User ${userId} removed from group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove user from group', error: err.message });
  }
};


/**
 * @description Promote a user to admin in a group
 * @route POST /api/groups/:id/users/:userId/promote
 * @access Public
 */
exports.promoteToAdmin = async (req, res, db) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const result = await db.collection('Groups').updateOne(
      { id: groupId },
      { $addToSet: { admins: userId },
        $pull: { members: userId }  
      },
      
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ message: `User ${userId} promoted to admin in group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to promote user to admin', error: err.message });
  }
};

/**
 * @description Demote an admin in a group
 * @route POST /api/groups/:id/users/:userId/demote
 * @access Public
 */
exports.demoteAdmin = async (req, res, db) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const result = await db.collection('Groups').updateOne(
      { id: groupId },
      { $pull: { admins: userId },
        $addToSet: { members: userId } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ message: `User ${userId} demoted from admin in group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to demote admin', error: err.message });
  }
};

/**
 * @description Register a user as interested in a group
 * @route POST /api/groups/:id/users/:userId/interested
 * @access Public
 */
exports.registerUserToGroup = async (req, res, db) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const result = await db.collection('Groups').updateOne(
      { id: groupId },
      { $addToSet: { interested: userId } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ message: `User ${userId} registered as interested in group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register user to group', error: err.message });
  }
};

/**
 * @description Approve an interested user and move them to members
 * @route POST /api/groups/:id/users/:userId/approve
 * @access Public
 */
exports.approveInterestedUser = async (req, res, db) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    // Update the group: remove the user from "interested" and add them to "members"
    const groupUpdate = db.collection('Groups').updateOne(
      { id: groupId },
      {
        $pull: { interested: userId },
        $addToSet: { members: userId },
      }
    );

    // Remove the group from the user's "interested" list and add it to their "groups" list
    const userUpdate = db.collection('Users').updateOne(
      { id: userId },
      {
        $pull: { interested: groupId },
        $addToSet: { groups: groupId },
      }
    );

    // Perform both updates concurrently
    const [groupResult, userResult] = await Promise.all([groupUpdate, userUpdate]);

    // Check if the group was found and updated
    if (groupResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the user was found and updated
    if (userResult.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: `User ${userId} approved for group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve user', error: err.message });
  }
};


/**
 * @description Deny an interested user and remove them from interested
 * @route DELETE /api/groups/:id/users/:userId/deny
 * @access Public
 */
exports.denyInterestedUser = async (req, res, db) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    // Update the group: remove the user from "interested"
    const groupUpdate = db.collection('Groups').updateOne(
      { id: groupId },
      { $pull: { interested: userId } }
    );

    // Update the user: remove the group from the user's "interested" list
    const userUpdate = db.collection('Users').updateOne(
      { id: userId },
      { $pull: { interested: groupId } }
    );

    // Perform both updates concurrently
    const [groupResult, userResult] = await Promise.all([groupUpdate, userUpdate]);

    // Check if the group was found and updated
    if (groupResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the user was found and updated
    if (userResult.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: `User ${userId} denied from group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deny user', error: err.message });
  }
};

/**
 * @description Ban a user from a group
 * @route POST /api/groups/:id/users/:userId/ban
 * @access Public
 */
exports.banUserFromGroup = async (req, res, db) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    // Perform both updates concurrently
    const [groupResult, userResult] = await Promise.all([
      db.collection('Groups').updateOne({ id: groupId }, {
        $addToSet: { banned: userId },  // Add the user to the banned array
        $pull: { members: userId }      // Remove the user from the members array
      }),
      db.collection('Users').updateOne({ id: userId }, { $pull: { groups: groupId } })
    ]);

    // Check if the group was found and updated
    if (groupResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the user was found and updated
    if (userResult.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: `User ${userId} banned from group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to ban user', error: err.message });
  }
};

