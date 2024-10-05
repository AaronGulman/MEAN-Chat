const fs = require('fs');
const path = require('path');

// File path for storing users
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

exports.getUsers = (req, res) => {
  try {
    const users = readData();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve users', error: err.message });
  }
};

exports.createUser = (req, res) => {
  const { username, email, password, roles, groups, interested } = req.body;
  const users = readData();

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password,
    roles: roles || [],
    groups: groups || [],
    interested: interested || []
  };

  try {
    users.push(newUser);
    writeData(users);
    res.status(200).json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

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

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;
  try {
    const users = readData();
    const index = users.findIndex(user => user.id === userId);
    if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[index] = { ...users[index], ...updateData };
    writeData(users);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  try {
    let users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    users = users.filter(user => user.id !== userId);
    writeData(users);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

exports.addGroupToUser = (req, res) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.groups.includes(groupId)) {
      user.groups.push(groupId);
      writeData(users);
    }
    res.status(200).json({ message: `Group ${groupId} added to user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add group to user', error: err.message });
  }
};

exports.removeGroupFromUser = (req, res) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.groups = user.groups.filter(group => group !== groupId);
    writeData(users);
    res.status(200).json({ message: `Group ${groupId} removed from user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove group from user', error: err.message });
  }
};

exports.addInterestToUser = (req, res) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.interested.includes(groupId)) {
      user.interested.push(groupId);
      writeData(users);
    }
    res.status(200).json({ message: `Interest ${groupId} added to user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add interest to user', error: err.message });
  }
};

exports.removeInterestFromUser = (req, res) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.interested = user.interested.filter(interest => interest !== groupId);
    writeData(users);
    res.status(200).json({ message: `Interest ${groupId} removed from user ${userId}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove interest from user', error: err.message });
  }
};

exports.promoteUser = (req, res) => {
  const userId = req.params.id;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

exports.demoteUser = (req, res) => {
  const userId = req.params.id;
  try {
    const users = readData();
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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