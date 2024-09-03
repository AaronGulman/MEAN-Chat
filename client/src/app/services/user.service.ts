import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private localStorageKey = 'users';

  constructor() {
    if (!this.getUserByUsername("super")) {
      this.initializeDefaultUsers();
    }
  }

  private initializeDefaultUsers(): void {
    const superUser = new User(
      Date.now().toString(),
      'super',
      'super@example.com',
      '123',
      ['superadmin']
    );
    const users = this.getUsers();
    this.saveUsers([...users, superUser]);
  }

  getUsers(): User[] {
    const users = localStorage.getItem(this.localStorageKey);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(users));
  }

  createUser(username: string, email: string, password: string, roles: string[] = ['user'], groups: string[] = []): User | null {
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

  updateUser(id: string, updatedData: Partial<User>){
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      const updatedUser = { ...users[index], ...updatedData };
      users[index] = updatedUser;
      this.saveUsers(users);
    }
    return null;
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const updatedUsers = users.filter(user => user.id !== id);
    if (users.length !== updatedUsers.length) {
      this.saveUsers(updatedUsers);
      return true;
    }
    return false;
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.username === username) || null;
  }

  addGroupToUser(userId: string, groupId: string) {
    const user = this.getUserById(userId);
    if (user) {
      if (!user.groups.includes(groupId)) {
        user.groups.push(groupId);
        this.updateUser(userId, { groups: user.groups });
      }
    }
  }

  removeGroupFromUser(userId: string, groupId: string){
    const user = this.getUserById(userId);
    if (user) {
      user.groups = user.groups.filter(id => id !== groupId);
      this.updateUser(userId, { groups: user.groups });
    }
  }

  removeInterestedGroupFromUser(userId: string, groupId: string){
    const user = this.getUserById(userId);
    if (user) {
      user.interested = user.interested.filter(id => id !== groupId);
      this.updateUser(userId, { interested: user.interested });
    }
  }

  deleteAllUsers(){
    localStorage.removeItem(this.localStorageKey);
  }

  setLoggedInUser(username: string){
    sessionStorage.setItem('loggedInUser', JSON.stringify(username));
  }

  clearLoggedInUser(){
    sessionStorage.removeItem('loggedInUser');
  }

  addInterestToUser(userId: string, groupId: string){
    const user = this.getUserById(userId);
    if (user) {
      if (!user.interested.includes(groupId)) {
        user.interested.push(groupId);
        this.updateUser(userId, { interested: user.interested });
      }
      return user;
    }
    return null;
  }

  promoteUser(userId: string){
    const user = this.getUserById(userId);
    if (user) {
      if (user.roles.includes('user')) {
        return this.updateUser(userId, { roles: ['admin'] });
      } else if (user.roles.includes('admin')) {
        return this.updateUser(userId, { roles: ['superadmin'] });
      }
    }
    return null;
  }

  demoteUser(userId: string){
    const user = this.getUserById(userId);
    if (user) {
      if (user.roles.includes('superadmin')) {
        return null; // Superadmin cannot be demoted
      }
      if (user.roles.includes('admin')) {
        return this.updateUser(userId, { roles: ['user'] });
      }
    }
    return null;
  }
}
