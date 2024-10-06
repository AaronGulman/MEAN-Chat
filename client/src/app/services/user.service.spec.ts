import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UserService } from './user.service';
import { User } from '../models/user.model';


describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all users', () => {
    const mockUsers: User[] = [
      { id: '1', username: 'user1', email: 'user1@example.com', password: 'password1', roles: ['user'], groups: [], interested: [], avatarPath: '' },
      { id: '2', username: 'user2', email: 'user2@example.com', password: 'password2', roles: ['user'], groups: [], interested: [], avatarPath: '' },
    ];

    service.getUsers().subscribe((users) => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should retrieve a user by ID', () => {
    const mockUser: User = { id: '1', username: 'user1', email: 'user1@example.com', password: 'password1', roles: ['user'], groups: [], interested: [], avatarPath: '' };

    service.getUserById('1').subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should create a new user', () => {
    const mockUser: User = { id: '1', username: 'newUser', email: 'newUser@example.com', password: 'password', roles: ['user'], groups: [], interested: [], avatarPath: '' };

    service.createUser('newUser', 'newUser@example.com', 'password').subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'newUser', email: 'newUser@example.com', password: 'password', roles: ['user'], groups: [] });
    req.flush(mockUser);
  });

  it('should update a user by ID', () => {
    const updatedData: Partial<User> = { username: 'updatedUser' };
    const mockUser: User = { id: '1', username: 'updatedUser', email: 'user1@example.com', password: 'password1', roles: ['user'], groups: [], interested: [], avatarPath: '' };

    service.updateUser('1', updatedData).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/users/1/update');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(updatedData);
    req.flush(mockUser);
  });

  it('should delete a user by ID', () => {
    service.deleteUser('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('https://localhost:3000/api/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should add a group to a user', () => {
    const userId = '1';
    const groupId = 'group1';
    const mockResponse = { success: true };

    service.addGroupToUser(userId, groupId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/users/${userId}/groups/${groupId}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should remove a group from a user', () => {
    const userId = '1';
    const groupId = 'group1';
    const mockResponse = { success: true };

    service.removeGroupFromUser(userId, groupId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/users/${userId}/groups/${groupId}/remove`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should promote a user', () => {
    const userId = '1';
    const mockResponse = { success: true };

    service.promoteUser(userId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/users/${userId}/promote`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should demote a user', () => {
    const userId = '1';
    const mockResponse = { success: true };

    service.demoteUser(userId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/users/${userId}/demote`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});