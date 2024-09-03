// channel.service.ts
import { Injectable } from '@angular/core';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  constructor() {}

  // Retrieve all channels for a specific group from local storage
  getChannels(groupId: string): Channel[] {
    const channels = localStorage.getItem(this.getLocalStorageKey(groupId));
    return channels ? JSON.parse(channels) : [];
  }

  // Save channels to local storage for a specific group
  private saveChannels(groupId: string, channels: Channel[]): void {
    localStorage.setItem(this.getLocalStorageKey(groupId), JSON.stringify(channels));
  }

  // Generate the local storage key based on the group ID with '-channel' suffix
  private getLocalStorageKey(groupId: string): string {
    return `${groupId}-channel`;
  }

  // Create a new channel for a specific group
  createChannel(name: string, groupId: string, description: string = ""): Channel {
    const id = Date.now().toString();
    const newChannel = new Channel(id, name, groupId, description);
    const channels = this.getChannels(groupId);
    channels.push(newChannel);
    this.saveChannels(groupId, channels);
    return newChannel;
  }

  // Update an existing channel for a specific group
  updateChannel(groupId: string, id: string, updatedData: Partial<Channel>): Channel | null {
    const channels = this.getChannels(groupId);
    const index = channels.findIndex(channel => channel.id === id);
    if (index !== -1) {
      const updatedChannel = { ...channels[index], ...updatedData };
      channels[index] = updatedChannel;
      this.saveChannels(groupId, channels);
      return updatedChannel;
    }
    return null;
  }

  // Delete a channel by ID for a specific group
  deleteChannel(groupId: string, id: string): boolean {
    const channels = this.getChannels(groupId);
    const updatedChannels = channels.filter(channel => channel.id !== id);
    if (channels.length !== updatedChannels.length) {
      this.saveChannels(groupId, updatedChannels);
      return true;
    }
    return false;
  }

  // Find a channel by ID for a specific group
  getChannelById(groupId: string, id: string): Channel | null {
    const channels = this.getChannels(groupId);
    return channels.find(channel => channel.id === id) || null;
  }
}
