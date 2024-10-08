import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  // Base URL for the channel-related API requests
  private apiUrl = 'https://localhost:3000/api/channels';

  constructor(private http: HttpClient) {}

  /**
   * @description Retrieve all channels for a specific group from the backend.
   * @param groupId - The ID of the group whose channels are to be retrieved
   * @returns Observable of type Channel[] containing the list of channels
   */
  getChannels(groupId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.apiUrl}/${groupId}`);
  }

  /**
   * @description Create a new channel for a specific group.
   * @param name - The name of the channel to be created
   * @param groupId - The ID of the group for which the channel is to be created
   * @param description - Optional description for the channel
   * @returns Observable of type Channel containing the created channel details
   */
  createChannel(name: string, groupId: string, description: string = ''): Observable<Channel> {
    const newChannel = { name, groupId, description };
    return this.http.post<Channel>(`${this.apiUrl}/${groupId}`, newChannel);
  }

  /**
   * @description Update an existing channel for a specific group.
   * @param groupId - The ID of the group that the channel belongs to
   * @param channelId - The ID of the channel to be updated
   * @param updatedData - Partial data to update the channel with
   * @returns Observable of type Channel containing the updated channel details
   */
  updateChannel(groupId: string, channelId: string, updatedData: Partial<Channel>): Observable<Channel> {
    return this.http.post<Channel>(`${this.apiUrl}/${groupId}/${channelId}`, updatedData);
  }

  /**
   * @description Delete a channel by ID for a specific group.
   * @param groupId - The ID of the group that the channel belongs to
   * @param channelId - The ID of the channel to be deleted
   * @returns Observable of type void indicating that the channel has been deleted
   */
  deleteChannel(groupId: string, channelId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}/${channelId}`);
  }

  /**
   * @description Find a channel by ID for a specific group.
   * @param groupId - The ID of the group that the channel belongs to
   * @param channelId - The ID of the channel to be retrieved
   * @returns Observable of type Channel containing the channel details
   */
  getChannelById(groupId: string, channelId: string): Observable<any> {
    return this.http.get<Channel>(`${this.apiUrl}/${groupId}/${channelId}`);
  }

  /**
   * @description Add a user to a specific channel.
   * @param groupId - The ID of the group that the channel belongs to
   * @param channelId - The ID of the channel to which the user should be added
   * @param userId - The ID of the user to be added to the channel
   * @returns Observable containing the server response for the add user action
   */
  addUserToChannel(groupId: string, channelId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${groupId}/${channelId}/addUser`, { userId });
  }

  /**
   * @description Remove a user from a specific channel.
   * @param groupId - The ID of the group that the channel belongs to
   * @param channelId - The ID of the channel from which the user should be removed
   * @param userId - The ID of the user to be removed from the channel
   * @returns Observable containing the server response for the remove user action
   */
  removeUserFromChannel(groupId: string, channelId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${groupId}/${channelId}/removeUser`, { userId });
  }
}
