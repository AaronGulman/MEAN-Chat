const fs = require('fs');
const path = require('path');

// File paths for storing groups and users
const groupFilePath = path.join(__dirname, '../groups.json');
const userFilePath = path.join(__dirname, '../users.json');

// Helper function to read data from JSON files
const readData = (filePath) => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
};

// Helper function to write data to JSON files
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Get all groups and populate banned users
exports.getAllGroups = (req, res) => {
  try {
    const groups = readData(groupFilePath);
    const users = readData(userFilePath);

    // Populate banned users with full user details
    const populatedGroups = groups.map(group => {
      if (group.banned && group.banned.length > 0) {
        group.banned = group.banned.map(userId => users.find(user => user.id === userId)).filter(Boolean);
      }
      return group;
    });

    res.status(200).json(populatedGroups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve groups', error: err.message });
  }
};

// Create a new group
exports.createGroup = (req, res) => {
  const { name, description, admin } = req.body;
  const groups = readData(groupFilePath);

  const newGroup = {
    id: Date.now().toString(), // Unique group ID
    name,
    description,
    admins: [admin.id],
    members: [],
    channels: [],
    interested: [],
    banned: [],
  };

  try {
    groups.push(newGroup);
    writeData(groupFilePath, groups);
    res.status(201).json({ message: 'Group created', newGroup });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', error: err.message });
  }
};

// Get a group by ID and populate user details
exports.getGroupById = (req, res) => {
  const groupId = req.params.id;
  try {
    const groups = readData(groupFilePath);
    const group = groups.find(group => group.id === groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Populate users in the group with full user details
    const users = readData(userFilePath);
    group.interested = group.interested.map(userId => users.find(user => user.id === userId)).filter(Boolean);
    group.members = group.members.map(userId => users.find(user => user.id === userId)).filter(Boolean);
    group.admins = group.admins.map(userId => users.find(user => user.id === userId)).filter(Boolean);
    group.banned = group.banned.map(userId => users.find(user => user.id === userId)).filter(Boolean);

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve group', error: err.message });
  }
};

// Update group information
exports.updateGroup = (req, res) => {
  const groupId = req.params.id;
  const updateData = req.body;

  try {
    const groups = readData(groupFilePath);
    const index = groups.findIndex(group => group.id === groupId);
    if (index === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[index] = { ...groups[index], ...updateData };
    writeData(groupFilePath, groups);
    res.status(200).json({ message: 'Group updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update group', error: err.message });
  }
};

// Delete a group and update user data accordingly
exports.deleteGroup = (req, res) => {
  const groupId = req.params.id;

  try {
    let groups = readData(groupFilePath);
    const group = groups.find(group => group.id === groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Update related users to remove references to the deleted group
    let users = readData(userFilePath);
    users = users.map(user => {
      user.groups = user.groups.filter(id => id !== groupId);
      user.roles = user.roles.filter(role => role !== 'admin' || !group.admins.includes(user.id));
      user.interested = user.interested.filter(id => id !== groupId);
      return user;
    });
    writeData(userFilePath, users);

    // Delete the group
    groups = groups.filter(group => group.id !== groupId);
    writeData(groupFilePath, groups);
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete group', error: err.message });
  }
};

// Add a channel to a group
exports.addChannelToGroup = (req, res) => {
  const groupId = req.params.id;
  const { channelId } = req.body;

  try {
    const groups = readData(groupFilePath);
    const index = groups.findIndex(group => group.id === groupId);
    if (index === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[index].channels = [...new Set([...groups[index].channels, channelId])];
    writeData(groupFilePath, groups);
    res.status(200).json({ message: `Channel ${channelId} added to group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add channel to group', error: err.message });
  }
};

// Remove a channel from a group
exports.removeChannelFromGroup = (req, res) => {
  const groupId = req.params.id;
  const channelId = req.params.channelId;

  try {
    const groups = readData(groupFilePath);
    const index = groups.findIndex(group => group.id === groupId);
    if (index === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[index].channels = groups[index].channels.filter(id => id !== channelId);
    writeData(groupFilePath, groups);
    res.status(200).json({ message: `Channel ${channelId} removed from group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove channel from group', error: err.message });
  }
};

// Add a user to a group and update their groups list
exports.addUserToGroup = (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[groupIndex].members = [...new Set([...groups[groupIndex].members, userId])];
    writeData(groupFilePath, groups);

    const users = readData(userFilePath);
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].groups = [...new Set([...users[userIndex].groups, groupId])];
      writeData(userFilePath, users);
    }

    res.status(200).json({ message: `User ${userId} added to group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add user to group', error: err.message });
  }
};

// Remove a user from a group
exports.removeUserFromGroup = (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Remove user from members and admins lists of the group
    groups[groupIndex].members = groups[groupIndex].members.filter(id => id !== userId);
    groups[groupIndex].admins = groups[groupIndex].admins.filter(id => id !== userId);
    writeData(groupFilePath, groups);

    // Update user data to remove group reference
    const users = readData(userFilePath);
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].groups = users[userIndex].groups.filter(id => id !== groupId);
      writeData(userFilePath, users);
    }

    res.status(200).json({ message: `User ${userId} removed from group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove user from group', error: err.message });
  }
};

// Promote a user to an admin in the group
exports.promoteToAdmin = (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[groupIndex].admins = [...new Set([...groups[groupIndex].admins, userId])];
    groups[groupIndex].members = groups[groupIndex].members.filter(id => id !== userId);
    writeData(groupFilePath, groups);

    res.status(200).json({ message: `User ${userId} promoted to admin in group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to promote user to admin', error: err.message });
  }
};

// Demote an admin to a member in the group
exports.demoteAdmin = (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[groupIndex].admins = groups[groupIndex].admins.filter(id => id !== userId);
    groups[groupIndex].members = [...new Set([...groups[groupIndex].members, userId])];
    writeData(groupFilePath, groups);

    res.status(200).json({ message: `User ${userId} demoted from admin in group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to demote admin', error: err.message });
  }
};

// Register a user as interested in joining a group
exports.registerUserToGroup = (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[groupIndex].interested = [...new Set([...groups[groupIndex].interested, userId])];
    writeData(groupFilePath, groups);
    res.status(200).json({ message: `User ${userId} registered as interested in group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register user to group', error: err.message });
  }
};

// Approve a user interested in joining the group
exports.approveInterestedUser = (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Move user from interested to members list
    groups[groupIndex].interested = groups[groupIndex].interested.filter(id => id !== userId);
    groups[groupIndex].members = [...new Set([...groups[groupIndex].members, userId])];
    writeData(groupFilePath, groups);

    // Update user to add group reference
    const users = readData(userFilePath);
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].interested = users[userIndex].interested.filter(id => id !== groupId);
      users[userIndex].groups = [...new Set([...users[userIndex].groups, groupId])];
      writeData(userFilePath, users);
    }

    res.status(200).json({ message: `User ${userId} approved for group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve user', error: err.message });
  }
};

// Deny a user interested in joining the group
exports.denyInterestedUser = (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[groupIndex].interested = groups[groupIndex].interested.filter(id => id !== userId);
    writeData(groupFilePath, groups);

    // Update user to remove interest reference
    const users = readData(userFilePath);
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].interested = users[userIndex].interested.filter(id => id !== groupId);
      writeData(userFilePath, users);
    }

    res.status(200).json({ message: `User ${userId} denied from group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deny user', error: err.message });
  }
};

// Ban a user from a group
exports.banUserFromGroup = (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  try {
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Add user to banned list and remove from members
    groups[groupIndex].banned = [...new Set([...groups[groupIndex].banned, userId])];
    groups[groupIndex].members = groups[groupIndex].members.filter(id => id !== userId);
    writeData(groupFilePath, groups);

    // Update user to remove group reference
    const users = readData(userFilePath);
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].groups = users[userIndex].groups.filter(id => id !== groupId);
      writeData(userFilePath, users);
    }

    res.status(200).json({ message: `User ${userId} banned from group ${groupId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to ban user', error: err.message });
  }
};
