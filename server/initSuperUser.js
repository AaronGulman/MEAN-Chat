const fs = require('fs');
const path = require('path');

const userFilePath = path.join(__dirname, 'users.json');

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

async function initializeSuperUser() {
  try {
    const users = readData();
    const superUser = users.find(user => user.username === 'super');
    if (!superUser) {
      const newSuperUser = {
        id: Date.now().toString(),
        username: 'super',
        email: 'super@admin.com',
        password: '123',
        roles: ['superadmin'],
        groups: [],
        interested: []
      };

      users.push(newSuperUser);
      writeData(users);
    }
  } catch (error) {
    console.error('Failed to initialize super user:', error);
  }
}

module.exports = initializeSuperUser;