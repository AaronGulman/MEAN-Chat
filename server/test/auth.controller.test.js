const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const fs = require('fs');
const { expect } = chai;
const { app } = require('../server');

chai.use(chaiHttp);

// Mock file paths and user data
const testUserFilePath = path.join(__dirname, '../users.json');

// Helper function to reset the test user file
const resetTestUserFile = () => {
  const initialData = [];
  fs.writeFileSync(testUserFilePath, JSON.stringify(initialData, null, 2), 'utf8');
};


describe('Auth Controller', () => {
  beforeEach(() => {
    resetTestUserFile();
  });

  after(() => {
    resetTestUserFile();
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', (done) => {
      chai
        .request(app)
        .post('/api/register')
        .send({ username: 'newuser', email: 'newuser@test.com', password: 'password123' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'User created successfully');
          expect(res.body).to.have.property('valid', true);
          done();
        });
    });

    it('should not register an existing user', (done) => {
      chai
        .request(app)
        .post('/api/register')
        .send({ username: 'testuser', email: 'testuser@test.com', password: 'password' })
        .end(() => {
          chai
            .request(app)
            .post('/api/register')
            .send({ username: 'testuser', email: 'testuser@test.com', password: 'password' })
            .end((err, res) => {
              expect(res).to.have.status(400);
              expect(res.body).to.have.property('message', 'User already exists');
              done();
            });
        });
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully with valid credentials', (done) => {
      chai
        .request(app)
        .post('/api/register')
        .send({ username: 'testuser', email: 'testuser@test.com', password: 'password' })
        .end(() => {
          chai
            .request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'password' })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.property('username', 'testuser');
              expect(res.body).to.have.property('valid', true);
              done();
            });
        });
    });

    it('should not login with invalid credentials', (done) => {
      chai
        .request(app)
        .post('/api/register')
        .send({ username: 'testuser', email: 'testuser@test.com', password: 'password' })
        .end(() => {
          chai
            .request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'wrongpassword' })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.property('valid', false);
              expect(res.body).to.have.property('message', 'Invalid credentials');
              done();
            });
        });
    });
  });
});
