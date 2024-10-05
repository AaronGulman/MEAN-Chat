const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const fs = require('fs');
const { expect } = chai;
const { app } = require('../server');

chai.use(chaiHttp);

// Mock file paths
const testGroupFilePath = path.join(__dirname, '../groups.json');
const testUserFilePath = path.join(__dirname, '../users.json');

// Helper function to reset the mock data files
const resetTestFiles = () => {
  const initialGroups = [
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
  ];

  const initialUsers = [
    { id: 'user1', username: 'User One', email: 'user1@example.com', groups: ['group1'], interested: [], roles: ['admin'] },
    { id: 'user2', username: 'User Two', email: 'user2@example.com', groups: ['group1'], interested: [], roles: ['member'] },
    { id: 'user3', username: 'User Three', email: 'user3@example.com', groups: [], interested: ['group1'], roles: [] },
  ];

  fs.writeFileSync(testGroupFilePath, JSON.stringify(initialGroups, null, 2), 'utf8');
  fs.writeFileSync(testUserFilePath, JSON.stringify(initialUsers, null, 2), 'utf8');
};

// Reset the test files before and after each test
beforeEach(() => {
  resetTestFiles();
});

after(() => {
  resetTestFiles();
});

describe('Group Controller', () => {
  describe('GET /api/groups', () => {
    it('should return all groups', (done) => {
      chai.request(app)
        .get('/api/groups')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array').that.has.length(1);
          const group = res.body[0];
          expect(group).to.have.property('id', 'group1');
          done();
        });
    });
  });

  describe('GET /api/groups/:id', () => {
    it('should get a single group by ID', (done) => {
      chai.request(app)
        .get('/api/groups/group1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id', 'group1');
          done();
        });
    });

    it('should return 404 if group does not exist', (done) => {
      chai.request(app)
        .get('/api/groups/nonexistent')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message', 'Group not found');
          done();
        });
    });
  });

  describe('POST /api/groups', () => {
    it('should create a new group', (done) => {
      const newGroup = { name: 'New Group', description: 'A new group', admin: { id: 'user3' } };
      chai.request(app)
        .post('/api/groups')
        .send(newGroup)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message', 'Group created');
          expect(res.body.newGroup).to.have.property('name', 'New Group');
          done();
        });
    });
  });

  describe('POST /api/groups/:id/update', () => {
    it('should update an existing group', (done) => {
      const updateData = { name: 'Updated Group Name' };
      chai.request(app)
        .post('/api/groups/group1/update')
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'Group updated successfully');
          done();
        });
    });

    it('should return 404 if group does not exist', (done) => {
      const updateData = { name: 'Updated Group Name' };
      chai.request(app)
        .post('/api/groups/nonexistent/update')
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message', 'Group not found');
          done();
        });
    });
  });

  describe('DELETE /api/groups/:id', () => {
    it('should delete an existing group', (done) => {
      chai.request(app)
        .delete('/api/groups/group1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'Group deleted successfully');
          done();
        });
    });

    it('should return 404 if group does not exist', (done) => {
      chai.request(app)
        .delete('/api/groups/nonexistent')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message', 'Group not found');
          done();
        });
    });
  });

  describe('POST /api/groups/:id/users/:userId', () => {
    it('should add a user to a group', (done) => {
      chai.request(app)
        .post('/api/groups/group1/users/user3')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'User user3 added to group group1');
          done();
        });
    });
  });

  describe('DELETE /api/groups/:id/users/:userId', () => {
    it('should remove a user from a group', (done) => {
      chai.request(app)
        .delete('/api/groups/group1/users/user2')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'User user2 removed from group group1');
          done();
        });
    });
  });

  describe('POST /api/groups/:id/users/:userId/promote', () => {
    it('should promote a user to admin', (done) => {
      chai.request(app)
        .post('/api/groups/group1/users/user2/promote')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'User user2 promoted to admin in group group1');
          done();
        });
    });
  });

  describe('POST /api/groups/:id/users/:userId/demote', () => {
    it('should demote an admin to a user', (done) => {
      chai.request(app)
        .post('/api/groups/group1/users/user1/demote')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'User user1 demoted from admin in group group1');
          done();
        });
    });
  });
});
