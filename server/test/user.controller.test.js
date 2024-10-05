const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const fs = require('fs');
const { expect } = chai;
const { app } = require('../server'); // Adjust this import based on your server entry point

chai.use(chaiHttp);

// Mock file paths
const testUserFilePath = path.join(__dirname, '../users.json');

// Helper function to reset the mock data files
const resetTestFiles = () => {
  const initialUsers = [
    { id: 'user1', username: 'User One', email: 'user1@example.com', password: 'pass1', groups: ['group1'], interested: [], roles: ['admin'] },
    { id: 'user2', username: 'User Two', email: 'user2@example.com', password: 'pass2', groups: ['group1'], interested: [], roles: ['user'] },
    { id: 'user3', username: 'User Three', email: 'user3@example.com', password: 'pass3', groups: [], interested: ['group1'], roles: [] },
  ];

  fs.writeFileSync(testUserFilePath, JSON.stringify(initialUsers, null, 2), 'utf8');
};

// Reset the test files before and after each test
beforeEach(() => {
  resetTestFiles();
});

after(() => {
  resetTestFiles();
});



describe('User Controller', () => {
    describe('GET /api/users', () => {
      it('should return all users', (done) => {
        chai.request(app)
          .get('/api/users')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').that.has.length(3);
            const user = res.body[0];
            expect(user).to.have.property('id', 'user1');
            expect(user).to.have.property('username', 'User One');
            done();
          });
      });
    });
  
    describe('GET /api/users/:id', () => {
      it('should return a single user by ID', (done) => {
        chai.request(app)
          .get('/api/users/user1')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('id', 'user1');
            expect(res.body).to.have.property('username', 'User One');
            done();
          });
      });
  
      it('should return 404 if user does not exist', (done) => {
        chai.request(app)
          .get('/api/users/nonexistent')
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'User not found');
            done();
          });
      });
    });
  
    describe('POST /api/users', () => {
      it('should create a new user', (done) => {
        const newUser = { username: 'New User', email: 'newuser@example.com', password: 'newpass', roles: ['user'] };
        chai.request(app)
          .post('/api/users')
          .send(newUser)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('username', 'New User');
            done();
          });
      });
    });
  
    describe('POST /api/users/:id/update', () => {
      it('should update an existing user', (done) => {
        const updateData = { username: 'Updated User One' };
        chai.request(app)
          .post('/api/users/user1/update')
          .send(updateData)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'User updated successfully');
            done();
          });
      });
  
      it('should return 404 if user does not exist', (done) => {
        const updateData = { username: 'Updated User' };
        chai.request(app)
          .post('/api/users/nonexistent/update')
          .send(updateData)
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'User not found');
            done();
          });
      });
    });
  
    describe('DELETE /api/users/:id', () => {
      it('should delete an existing user', (done) => {
        chai.request(app)
          .delete('/api/users/user1')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'User deleted successfully');
            done();
          });
      });
  
      it('should return 404 if user does not exist', (done) => {
        chai.request(app)
          .delete('/api/users/nonexistent')
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'User not found');
            done();
          });
      });
    });
  });

  

  describe('Role Management', () => {
    describe('POST /api/users/:id/promote', () => {
      it('should promote a user to admin', (done) => {
        chai.request(app)
          .post('/api/users/user2/promote')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'User user2 promoted successfully');
            chai.request(app)
              .get('/api/users/user2')
              .end((err, res) => {
                expect(res.body).to.have.property('roles').that.includes('admin');
                done();
              });
          });
      });
  
      it('should return 404 if user does not exist', (done) => {
        chai.request(app)
          .post('/api/users/nonexistent/promote')
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'User not found');
            done();
          });
      });
    });
  
    describe('POST /api/users/:id/demote', () => {
      it('should demote a user from admin to user', (done) => {
        chai.request(app)
          .post('/api/users/user1/demote')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'User user1 demoted successfully');
            chai.request(app)
              .get('/api/users/user1')
              .end((err, res) => {
                expect(res.body).to.have.property('roles').that.includes('user');
                done();
              });
          });
      });
  
      it('should return 400 if user cannot be demoted further', (done) => {
        chai.request(app)
          .post('/api/users/user3/demote')
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message').that.includes('cannot be demoted further');
            done();
          });
      });
    });
  });

  
  describe('Group and Interest Management', () => {
    describe('POST /api/users/:id/groups/:groupId', () => {
      it('should add a group to the user', (done) => {
        chai.request(app)
          .post('/api/users/user3/groups/group1')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Group group1 added to user user3');
            chai.request(app)
              .get('/api/users/user3')
              .end((err, res) => {
                expect(res.body).to.have.property('groups').that.includes('group1');
                done();
              });
          });
      });
  
      it('should return 404 if user does not exist', (done) => {
        chai.request(app)
          .post('/api/users/nonexistent/groups/group1')
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'User not found');
            done();
          });
      });
    });
  
    describe('POST /api/users/:id/groups/:groupId/remove', () => {
      it('should remove a group from the user', (done) => {
        chai.request(app)
          .post('/api/users/user1/groups/group1/remove')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Group group1 removed from user user1');
            chai.request(app)
              .get('/api/users/user1')
              .end((err, res) => {
                expect(res.body).to.have.property('groups').that.does.not.include('group1');
                done();
              });
          });
      });
    });
  
    describe('POST /api/users/:id/interests/:groupId', () => {
      it('should add interest to a user', (done) => {
        chai.request(app)
          .post('/api/users/user2/interests/group1')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Interest group1 added to user user2');
            chai.request(app)
              .get('/api/users/user2')
              .end((err, res) => {
                expect(res.body).to.have.property('interested').that.includes('group1');
                done();
              });
          });
      });
    });
  
    describe('POST /api/users/:id/interests/:groupId/remove', () => {
      it('should remove interest from a user', (done) => {
        chai.request(app)
          .post('/api/users/user3/interests/group1/remove')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Interest group1 removed from user user3');
            chai.request(app)
              .get('/api/users/user3')
              .end((err, res) => {
                expect(res.body).to.have.property('interested').that.does.not.include('group1');
                done();
              });
          });
      });
    });
  });
  