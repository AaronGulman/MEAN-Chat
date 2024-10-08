const fs = require('fs');
const path = require('path');

// File path for storing users data
const userFilePath = path.join(__dirname, '../users.json');

// Helper function to read data from JSON file
const readData = () => {
  if (fs.existsSync(userFilePath)) {
    const data = fs.readFileSync(userFilePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
};

// Helper function to write data to JSON file
const writeData = (data) => {
  fs.writeFileSync(userFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// Get all users
exports.getUsers = (req, res) => {
  try {
    const users = readData();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve users', error: err.message });
  }
};

// Create a new user
exports.createUser = (req, res) => {
  const { username, email, password, roles, groups, interested } = req.body;
  const users = readData();

  // Create a new user object with the data provided in the request
  const newUser = {
    id: Date.now().toString(), // Unique ID for the user
    username,
    email,
    password,
    roles: roles || [], // Default to an empty array if no roles are provided
    groups: groups || [], // Default to an empty array if no groups are provided
    interested: interested || [] // Default to an empty array if no interests are provided
  };

  try {
    users.push(newUser);
    writeData(users); // Write the updated users list back to the JSON file
    res.status(200).json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

// Get a user by ID
exports.getUserById = (req, res) => {
  const userId = req.params.id;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve user', error: err.message });
  }
};

// Get a user by username
exports.getUserByUsername = (req, res) => {
  const username = req.params.username;
  try {
    const users = readData();
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve user', error: err.message });
  }
};

// Update a user by ID
exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;
  try {
    const users = readData();
    const index = users.findIndex(user => user.id === userId);
    if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user with the new data
    users[index] = { ...users[index], ...updateData };
    writeData(users);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// Delete a user by ID
exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  try {
    let users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out the user to delete and write back the new list
    users = users.filter(user => user.id !== userId);
    writeData(users);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// Add a group to a user
exports.addGroupToUser = (req, res) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the group to the user's list of groups if it doesn't already exist
    if (!user.groups.includes(groupId)) {
      user.groups.push(groupId);
      writeData(users);
    }
    res.status(200).json({ message: `Group ${groupId} added to user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add group to user', error: err.message });
  }
};

// Remove a group from a user
exports.removeGroupFromUser = (req, res) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the group from the user's list of groups
    user.groups = user.groups.filter(group => group !== groupId);
    writeData(users);
    res.status(200).json({ message: `Group ${groupId} removed from user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove group from user', error: err.message });
  }
};

// Add an interest to a user
exports.addInterestToUser = (req, res) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the interest to the user's list of interests if it doesn't already exist
    if (!user.interested.includes(groupId)) {
      user.interested.push(groupId);
      writeData(users);
    }
    res.status(200).json({ message: `Interest ${groupId} added to user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add interest to user', error: err.message });
  }
};

// Remove an interest from a user
exports.removeInterestFromUser = (req, res) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the interest from the user's list of interests
    user.interested = user.interested.filter(interest => interest !== groupId);
    writeData(users);
    res.status(200).json({ message: `Interest ${groupId} removed from user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove interest from user', error: err.message });
  }
};

// Promote a user (user -> admin -> superadmin)
exports.promoteUser = (req, res) => {
  const userId = req.params.id;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Promote user role step-by-step
    if (user.roles.includes('user')) {
      user.roles = ['admin'];
    } else if (user.roles.includes('admin')) {
      user.roles = ['superadmin'];
    } else {
      return res.status(400).json({ message: `User ${userId} cannot be promoted further` });
    }

    writeData(users);
    res.status(200).json({ message: `User ${userId} promoted successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to promote user', error: err.message });
  }
};

// Demote a user (superadmin -> admin -> user)
exports.demoteUser = (req, res) => {
  const userId = req.params.id;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Demote user role step-by-step
    if (user.roles.includes('superadmin')) {
      return res.status(400).json({ message: `User ${userId} is a superadmin and cannot be demoted` });
    } else if (user.roles.includes('admin')) {
      user.roles = ['user'];
    } else {
      return res.status(400).json({ message: `User ${userId} cannot be demoted further` });
    }

    writeData(users);
    res.status(200).json({ message: `User ${userId} demoted successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to demote user', error: err.message });
  }
};
