import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Get all users from the backend
   * @returns Observable of type User array containing all users
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  /**
   * Get a user by ID
   * @param id - The ID of the user
   * @returns Observable of type User containing the user details
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get a user by username
   * @param username - The username of the user
   * @returns Observable of type User containing the user details
   */
  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/username/${username}`);
  }

  /**
   * Create a new user
   * @param username - The username of the user
   * @param email - The email of the user
   * @param password - The password of the user
   * @param roles - An array of roles for the user (default is ['user'])
   * @param groups - An array of groups for the user (default is empty)
   * @returns Observable of type User containing the created user details
   */
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

  /**
   * Update a user by ID
   * @param id - The ID of the user
   * @param updatedData - The updated user data
   * @returns Observable containing the response from the server
   */
  updateUser(id: string, updatedData: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/update`, updatedData);
  }

  /**
   * Delete a user by ID
   * @param id - The ID of the user to be deleted
   * @returns Observable containing the response from the server
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Add a group to a user
   * @param userId - The ID of the user
   * @param groupId - The ID of the group to be added
   * @returns Observable containing the response from the server
   */
  addGroupToUser(userId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/groups/${groupId}`, {});
  }

  /**
   * Remove a group from a user
   * @param userId - The ID of the user
   * @param groupId - The ID of the group to be removed
   * @returns Observable containing the response from the server
   */
  removeGroupFromUser(userId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/groups/${groupId}/remove`, {});
  }

  /**
   * Add an interest group to a user
   * @param userId - The ID of the user
   * @param groupId - The ID of the interest group to be added
   * @returns Observable containing the response from the server
   */
  addInterestedGroupToUser(userId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/interests/${groupId}`, {});
  }

  /**
   * Remove an interest group from a user
   * @param userId - The ID of the user
   * @param groupId - The ID of the interest group to be removed
   * @returns Observable containing the response from the server
   */
  removeInterestedGroupFromUser(userId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/interests/${groupId}/remove`, {});
  }

  /**
   * Promote a user
   * @param userId - The ID of the user to be promoted
   * @returns Observable containing the response from the server
   */
  promoteUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/promote`, {});
  }

  /**
   * Demote a user
   * @param userId - The ID of the user to be demoted
   * @returns Observable containing the response from the server
   */
  demoteUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/demote`, {});
  }

  /**
   * Set logged-in user in session storage
   * @param username - The username of the logged-in user
   */
  setLoggedInUser(username: string): void {
    sessionStorage.setItem('loggedInUser', JSON.stringify(username));
  }

  /**
   * Clear logged-in user from session storage
   */
  clearLoggedInUser(): void {
    sessionStorage.removeItem('loggedInUser');
  }
}
