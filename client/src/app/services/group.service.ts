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
  // Base URL for the group-related API requests
  private apiUrl = 'https://localhost:3000/api/groups';

  constructor(private http: HttpClient, private userService: UserService) {}

  /**
   * @description Retrieve all groups from the backend.
   * @returns Observable of type Group[] containing the list of groups
   */
  public getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  /**
   * @description Retrieve a specific group by ID.
   * @param groupId - The ID of the group to be retrieved
   * @returns Observable of type Group containing the group details
   */
  public getGroupById(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${groupId}`);
  }

  /**
   * @description Create a new group.
   * @param name - The name of the group to be created
   * @param description - Optional description of the group
   * @param admin - The user object representing the admin of the group
   * @returns Observable containing the created group details
   */
  public createGroup(name: string, description: string = '', admin: User): Observable<any> {
    const newGroup = { name, description, admin };
    return this.http.post<Group>(this.apiUrl, newGroup);
  }

  /**
   * @description Update a specific group by ID.
   * @param groupId - The ID of the group to be updated
   * @param updatedData - Partial data containing the updated information for the group
   * @returns Observable of type Group containing the updated group details
   */
  public updateGroup(groupId: string, updatedData: Partial<Group>): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/update`, updatedData);
  }

  /**
   * @description Delete a specific group by ID.
   * @param groupId - The ID of the group to be deleted
   * @returns Observable of type void indicating that the group has been deleted
   */
  public deleteGroup(groupId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}`);
  }

  /**
   * @description Add a channel to a specific group.
   * @param groupId - The ID of the group to which the channel is to be added
   * @param channelId - The ID of the channel to be added
   * @returns Observable of type Group containing the updated group details
   */
  public addChannelToGroup(groupId: string, channelId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/channels`, { channelId });
  }

  /**
   * @description Remove a channel from a specific group.
   * @param groupId - The ID of the group from which the channel is to be removed
   * @param channelId - The ID of the channel to be removed
   * @returns Observable of type Group containing the updated group details
   */
  public removeChannelFromGroup(groupId: string, channelId: string): Observable<Group> {
    return this.http.delete<Group>(`${this.apiUrl}/${groupId}/channels/${channelId}`);
  }

  /**
   * @description Add a user to a specific group.
   * @param groupId - The ID of the group to which the user is to be added
   * @param userId - The ID of the user to be added
   * @returns Observable of type Group containing the updated group details
   */
  public addUserToGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}`, {});
  }

  /**
   * @description Remove a user from a specific group.
   * @param groupId - The ID of the group from which the user is to be removed
   * @param userId - The ID of the user to be removed
   * @returns Observable of type Group containing the updated group details
   */
  public removeUserFromGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.delete<Group>(`${this.apiUrl}/${groupId}/users/${userId}`);
  }

  /**
   * @description Promote a user to an admin in the group.
   * @param groupId - The ID of the group
   * @param userId - The ID of the user to be promoted
   * @returns Observable of type Group containing the updated group details
   */
  public promoteToAdmin(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/promote`, {});
  }

  /**
   * @description Demote an admin to a member in the group.
   * @param groupId - The ID of the group
   * @param userId - The ID of the admin to be demoted
   * @returns Observable of type Group containing the updated group details
   */
  public demoteAdmin(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/demote`, {});
  }

  /**
   * @description Register a user as interested in joining a group.
   * @param groupId - The ID of the group
   * @param userId - The ID of the user expressing interest in joining the group
   * @returns Observable of type Group containing the updated group details
   */
  public registerUserToGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/interested`, {});
  }

  /**
   * @description Approve an interested user and move them to members.
   * @param groupId - The ID of the group
   * @param userId - The ID of the user to be approved
   * @returns Observable of type Group containing the updated group details
   */
  public approveInterestedUser(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/approve`, {});
  }

  /**
   * @description Deny an interested user and remove them from the interested list.
   * @param groupId - The ID of the group
   * @param userId - The ID of the user to be denied
   * @returns Observable of type Group containing the updated group details
   */
  public denyInterestedUser(groupId: string, userId: string): Observable<Group> {
    return this.http.delete<Group>(`${this.apiUrl}/${groupId}/users/${userId}/deny`);
  }

  /**
   * @description Ban a user from a group.
   * @param groupId - The ID of the group
   * @param userId - The ID of the user to be banned
   * @returns Observable of type Group containing the updated group details
   */
  public banUserFromGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/users/${userId}/ban`, {});
  }
}
