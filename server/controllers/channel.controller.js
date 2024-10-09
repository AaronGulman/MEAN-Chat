const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const Channel = require('../models/channel.model');

// File paths for storing groups and users
const groupFilePath = path.join(__dirname, '../groups.json');

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

// Get all channels for a specific group
exports.getChannels = async (req, res, db) => {
  const groupId = req.params.groupId;

  try {
    const channels = await db.collection('Channels').find({ groupId }).toArray();
    res.status(200).json(channels);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve channels', error: err.message });
  }
};

// Create a new channel for a specific group
exports.createChannel = async (req, res, db) => {
  const groupId = req.params.groupId;
  const { name, description } = req.body;

  const newChannel = new Channel(Date.now().toString(), name, groupId, description);

  try {
    // Insert the new channel into MongoDB
    await db.collection('Channels').insertOne(newChannel);

    // Update the group JSON file to include the new channel ID
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[groupIndex].channels.push(newChannel.id);
    writeData(groupFilePath, groups);

    res.status(201).json(newChannel);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create channel', error: err.message });
  }
};

// Get a single channel by ID for a specific group
exports.getChannelById = async (req, res, db) => {
  const channelId = req.params.channelId;
  const groupId = req.params.groupId;

  try {
    const channel = await db.collection('Channels').findOne({ id: channelId, groupId });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Retrieve messages for the channel
    const messages = await db.collection('Messages').find({ channelId }).toArray();

    res.status(200).json({ channel, messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve channel', error: err.message });
  }
};

// Update an existing channel by ID for a specific group
exports.updateChannel = async (req, res, db) => {
  const channelId = req.params.channelId;
  const groupId = req.params.groupId;
  const updateData = req.body;

  try {
    const result = await db.collection('Channels').updateOne(
      { id: channelId, groupId },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.status(200).json({ message: 'Channel updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update channel', error: err.message });
  }
};

// Delete a channel by ID for a specific group
exports.deleteChannel = async (req, res, db) => {
  const channelId = req.params.channelId;
  const groupId = req.params.groupId;

  try {
    const result = await db.collection('Channels').deleteOne({ id: channelId, groupId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Remove the channel ID from the group JSON file
    const groups = readData(groupFilePath);
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }

    groups[groupIndex].channels = groups[groupIndex].channels.filter(id => id !== channelId);
    writeData(groupFilePath, groups);

    res.status(200).json({ message: 'Channel deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete channel', error: err.message });
  }
};

// Add a user to a channel
exports.addUserToChannel = async (req, res, db) => {
  const { groupId, channelId } = req.params;
  const { userId } = req.body;

  try {
    const channel = await db.collection('Channels').findOne({ id: channelId, groupId });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    channel.users = channel.users || [];

    if (channel.users.includes(userId)) {
      return res.status(400).json({ message: 'User already in the channel' });
    }

    await db.collection('Channels').updateOne(
      { id: channelId, groupId },
      { $push: { users: userId } }
    );

    res.status(200).json({ message: 'User added to channel successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add user to channel', error: err.message });
  }
};

// Remove a user from a channel
exports.removeUserFromChannel = async (req, res, db) => {
  const { groupId, channelId } = req.params;
  const { userId } = req.body;

  try {
    const channel = await db.collection('Channels').findOne({ id: channelId, groupId });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    channel.users = channel.users || [];

    if (!channel.users.includes(userId)) {
      return res.status(400).json({ message: 'User not found in the channel' });
    }
    await db.collection('Channels').updateOne(
      { id: channelId, groupId },
      { $pull: { users: userId } }
    );

    res.status(200).json({ message: 'User removed from channel successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove user from channel', error: err.message });
  }
};
