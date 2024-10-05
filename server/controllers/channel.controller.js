const { ObjectId } = require('mongodb');
const Channel = require('../models/channel.model');

/**
 * @description Get all channels for a specific group
 * @route GET /api/channels/:groupId
 * @access Public
 */
exports.getChannels = async (req, res, db) => {
  const groupId = req.params.groupId;

  try {
    const channels = await db.collection('Channels').find({ groupId }).toArray();
    res.status(200).json(channels);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve channels', error: err.message });
  }
};

/**
 * @description Create a new channel for a specific group
 * @route POST /api/channels/:groupId
 * @access Public
 */
exports.createChannel = async (req, res, db) => {
  const groupId = req.params.groupId;
  const { name, description } = req.body;

  const newChannel = new Channel(Date.now().toString(), name, groupId, description);

  try {
    const result = await db.collection('Channels').insertOne(newChannel);
    // Update the group to include the new channel ID
    await db.collection('Groups').updateOne(
      { id: groupId },
      { $addToSet: { channels: newChannel.id } }
    );
    res.status(201).json(newChannel);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create channel', error: err.message });
  }
};

/**
 * @description Get a single channel by ID for a specific group
 * @route GET /api/channels/:groupId/:channelId
 * @access Public
 */
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

/**
 * @description Update an existing channel by ID for a specific group
 * @route PUT /api/channels/:groupId/:channelId
 * @access Public
 */
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

/**
 * @description Delete a channel by ID for a specific group
 * @route DELETE /api/channels/:groupId/:channelId
 * @access Public
 */
exports.deleteChannel = async (req, res, db) => {
  const channelId = req.params.channelId;
  const groupId = req.params.groupId;

  try {
    const result = await db.collection('Channels').deleteOne({ id: channelId, groupId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Remove the channel ID from the group's channel list
    await db.collection('Groups').updateOne(
      { id: groupId },
      { $pull: { channels: channelId } }
    );
    res.status(200).json({ message: 'Channel deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete channel', error: err.message });
  }
};
