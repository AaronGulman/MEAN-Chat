import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { User } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = 'http://localhost:3000/api/groups'; // Update with your backend URL

  constructor(private http: HttpClient, private userService: UserService) {}

  // Retrieve all groups from the backend
  public getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  // Retrieve a group by ID
  public getGroupById(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${groupId}`);
  }

  // Create a new group
  public createGroup(name: string, description: string = '', admin: User): Observable<any> {
    const newGroup = { name, description, admin};
    return this.http.post<Group>(this.apiUrl, newGroup);
  }

  // Update a group by ID
  public updateGroup(groupId: string, updatedData: Partial<Group>): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/update`, updatedData);
  }

  // Delete a group by ID
  public deleteGroup(groupId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}`);
  }

  // Add a channel to a group
  public addChannelToGroup(groupId: string, channelId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/channels`, { channelId });
  }

  // Remove a channel from a group
  public removeChannelFromGroup(groupId: string, channelId: string): Observable<Group> {
    return this.http.delete<Group>(`${this.apiUrl}/${groupId}/channels/${channelId}`);
  }

  // Add a user to a group
  public addUserToGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}`, {});
  }

  // Remove a user from a group
  public removeUserFromGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.delete<Group>(`${this.apiUrl}/${groupId}/users/${userId}`);
  }

  // Promote a user to admin
  public promoteToAdmin(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/promote`, {});
  }

  // Demote an admin from a group
  public demoteAdmin(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/demote`, {});
  }

  // Register a user as interested in a group
  public registerUserToGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/interested`, {});
  }

  // Approve an interested user and move them to members
  public approveInterestedUser(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/approve`, {});
  }

  // Deny an interested user and remove them from interested
  public denyInterestedUser(groupId: string, userId: string): Observable<Group> {
    return this.http.delete<Group>(`${this.apiUrl}/${groupId}/users/${userId}/deny`);
  }

  // Ban a user from a group
  public banUserFromGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/ban`, {});
  }
}
