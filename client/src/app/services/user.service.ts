import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users'; // Update with your backend URL

  constructor(private http: HttpClient) {}

  // Get all users from the backend
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  // Get a user by ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Get a user by username
  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/username/${username}`);
  }

  // Create a new user
  createUser(username: string, email: string, password: string, roles: string[] = ['user'], groups: string[] = []): Observable<User> {
    const newUser: Partial<User> = {
      username,
      email,
      password,
      roles,
      groups
    };
    return this.http.post<User>(this.apiUrl, newUser);
  }

  // Update a user by ID
  updateUser(id: string, updatedData: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/update`, updatedData);
  }

  // Delete a user by ID
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Add a group to a user
  addGroupToUser(userId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/groups/${groupId}`, {});
  }

  // Remove a group from a user
  removeGroupFromUser(userId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/groups/${groupId}/remove`, {});
  }

  // Add an interest group to a user
  addInterestedGroupToUser(userId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/interests/${groupId}`, {});
  }

  // Remove an interest from a user
  removeInterestedGroupFromUser(userId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/interests/${groupId}/remove`, {});
  }

  // Promote a user
  promoteUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/promote`, {});
  }

  // Demote a user
  demoteUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/demote`, {});
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
