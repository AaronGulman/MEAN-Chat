// In-memory store to simulate localStorage
const store = {};

// Helper functions
const getLocalStorageKey = (groupId) => `${groupId}-channel`;

// Retrieve all channels for a specific group
const getChannels = (req, res) => {
  const { groupId } = req.params;
  const key = getLocalStorageKey(groupId);
  const channels = store[key] || [];
  res.json(channels);
};

// Save channels to in-memory store
const saveChannels = (groupId, channels) => {
  const key = getLocalStorageKey(groupId);
  store[key] = channels;
};

// Create a new channel
const createChannel = (req, res) => {
  const { name, groupId, description = "" } = req.body;
  const id = Date.now().toString();
  const newChannel = { id, name, groupId, description };
  const key = getLocalStorageKey(groupId);
  const channels = store[key] || [];
  channels.push(newChannel);
  saveChannels(groupId, channels);
  res.status(201).json(newChannel);
};

// Update an existing channel
const updateChannel = (req, res) => {
  const { groupId, id } = req.params;
  const updatedData = req.body;
  const key = getLocalStorageKey(groupId);
  let channels = store[key] || [];
  const index = channels.findIndex(channel => channel.id === id);
  if (index !== -1) {
    channels[index] = { ...channels[index], ...updatedData };
    saveChannels(groupId, channels);
    res.json(channels[index]);
  } else {
    res.status(404).json({ message: 'Channel not found' });
  }
};

// Delete a channel by ID
const deleteChannel = (req, res) => {
  const { groupId, id } = req.params;
  const key = getLocalStorageKey(groupId);
  let channels = store[key] || [];
  const updatedChannels = channels.filter(channel => channel.id !== id);
  if (channels.length !== updatedChannels.length) {
    saveChannels(groupId, updatedChannels);
    res.json({ message: 'Channel deleted' });
  } else {
    res.status(404).json({ message: 'Channel not found' });
  }
};

// Find a channel by ID
const getChannelById = (req, res) => {
  const { groupId, id } = req.params;
  const key = getLocalStorageKey(groupId);
  const channels = store[key] || [];
  const channel = channels.find(channel => channel.id === id);
  if (channel) {
    res.json(channel);
  } else {
    res.status(404).json({ message: 'Channel not found' });
  }
};

// Export controller functions
module.exports = {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  getChannelById
};
