// test/mockData.js
const mockGroups = [
    {
      id: 'group1',
      name: 'Group 1',
      description: 'First group',
      admins: ['user1'],
      members: ['user1', 'user2'],
      channels: ['channel1'],
      interested: ['user3'],
      banned: [],
    },
    {
      id: 'group2',
      name: 'Group 2',
      description: 'Second group',
      admins: ['user2'],
      members: ['user2'],
      channels: ['channel2'],
      interested: [],
      banned: ['user3'],
    },
  ];
  
  const mockUsers = [
    { id: 'user1', username: 'User One', email: 'user1@example.com', groups: ['group1'], interested: [], roles: ['admin'] },
    { id: 'user2', username: 'User Two', email: 'user2@example.com', groups: ['group2'], interested: [], roles: ['admin'] },
    { id: 'user3', username: 'User Three', email: 'user3@example.com', groups: [], interested: ['group1'], roles: [] },
  ];
  
  module.exports = { mockGroups, mockUsers };
  