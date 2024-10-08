import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiUrl = 'https://localhost:3000/api/channels';

  constructor(private http: HttpClient) {}

  // Retrieve all channels for a specific group from the backend
  getChannels(groupId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.apiUrl}/${groupId}`);
  }

  // Create a new channel for a specific group
  createChannel(name: string, groupId: string, description: string = ''): Observable<Channel> {
    const newChannel = { name, groupId, description };
    return this.http.post<Channel>(`${this.apiUrl}/${groupId}`, newChannel);
  }

  // Update an existing channel for a specific group
  updateChannel(groupId: string, channelId: string, updatedData: Partial<Channel>): Observable<Channel> {
    return this.http.post<Channel>(`${this.apiUrl}/${groupId}/${channelId}`, updatedData);
  }

  // Delete a channel by ID for a specific group
  deleteChannel(groupId: string, channelId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}/${channelId}`);
  }

  // Find a channel by ID for a specific group
  getChannelById(groupId: string, channelId: string): Observable<any> {
    return this.http.get<Channel>(`${this.apiUrl}/${groupId}/${channelId}`);
  }

  // Add a user to a specific channel
  addUserToChannel(groupId: string, channelId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${groupId}/${channelId}/addUser`, { userId });
  }

  // Remove a user from a specific channel
  removeUserFromChannel(groupId: string, channelId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${groupId}/${channelId}/removeUser`, { userId });
  }
}
