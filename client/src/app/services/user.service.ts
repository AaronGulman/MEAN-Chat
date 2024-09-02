import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private localStorageKey = 'users';

  constructor() {
    if(!this.getUserByUsername("super")){
      this.initializeDefaultUsers();
    }
  }

  // Initialize default users
  private initializeDefaultUsers(): void {
    const superUser = new User(
      Date.now().toString(), // Generate a unique ID for the super user
      'super',
      'super@example.com',
      '123',
      ['superadmin'],
      []
    );
    const users = this.getUsers();
    this.saveUsers([...users, superUser]);
  }

  // Retrieve all users from local storage
  getUsers(): User[] {
    const users = localStorage.getItem(this.localStorageKey);
    return users ? JSON.parse(users) : [];
  }

  // Save users to local storage
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(users));
  }

  // Create a new user
  createUser(username: string, email: string, password: string, roles: string[] = ['user'], groups: Group[] = []): User | null {
    const existingUser = this.getUserByUsername(username);
    if (existingUser) {
      return null;
    }

    const id = Date.now().toString();
    const newUser = new User(id, username, email, password, roles, groups);
    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  // Update an existing user
  updateUser(id: string, updatedData: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      const updatedUser = { ...users[index], ...updatedData };
      users[index] = updatedUser;
      this.saveUsers(users);
      return updatedUser;
    }
    return null;
  }

  // Delete a user by ID
  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const updatedUsers = users.filter(user => user.id !== id);
    if (users.length !== updatedUsers.length) {
      this.saveUsers(updatedUsers);
      return true;
    }
    return false;
  }

  // Find a user by ID
  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  // Find a user by username
  getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.username === username) || null;
  }

  // Add a group to a user
  addGroupToUser(userId: string, group: Group): User | null {
    const user = this.getUserById(userId);
    if (user) {
      if (!user.groups.some(g => g.id === group.id)) {
        user.groups.push(group);
        this.updateUser(userId, { groups: user.groups });
      }
      return user;
    }
    return null;
  }

  // Remove a group from a user
  removeGroupFromUser(userId: string, groupId: string): User | null {
    const user = this.getUserById(userId);
    if (user) {
      user.groups = user.groups.filter(group => group.id !== groupId);
      this.updateUser(userId, { groups: user.groups });
      return user;
    }
    return null;
  }

  // Delete all users
  deleteAllUsers(): void {
    localStorage.removeItem(this.localStorageKey);
  }

  // Set logged-in user in session storage
  setLoggedInUser(username: string): void {
    sessionStorage.setItem('loggedInUser', JSON.stringify(username));
  }

  // Clear logged-in user from session storage
  clearLoggedInUser(): void {
    sessionStorage.removeItem('loggedInUser');
  }
}
