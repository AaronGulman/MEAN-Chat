import { Injectable } from '@angular/core';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { User } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private localStorageKey = 'groups';

  constructor(private userService: UserService) {}

  // Retrieve all groups from local storage
  public getGroups(): Group[] {
    const groups = localStorage.getItem(this.localStorageKey);
    return groups ? JSON.parse(groups) : [];
  }

  // Save groups to local storage
  private saveGroups(groups: Group[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(groups));
  }

  // Create a new group
  createGroup(name: string, description: string = "", admin: User[] = [], channels: Channel[] = []): Group {
    const id = Date.now().toString();
    const newGroup = new Group(id, name, description, admin, [], channels, []);
    const groups = this.getGroups();
    groups.push(newGroup);
    this.saveGroups(groups);
    return newGroup;
  }

  // Update an existing group
  updateGroup(groupId: string, updatedData: Partial<Group>): Group | null {
    const groups = this.getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex !== -1) {
      const group = groups[groupIndex];
      const updatedGroup = { ...group, ...updatedData };
      groups[groupIndex] = updatedGroup;
      this.saveGroups(groups);
      return updatedGroup;
    }
    return null;
  }

  // Delete a group by ID
  deleteGroup(groupId: string): boolean {
    const groups = this.getGroups();
    const updatedGroups = groups.filter(g => g.id !== groupId);
    
    if (groups.length !== updatedGroups.length) {
      this.saveGroups(updatedGroups);
      this.removeGroupFromUsers(groupId);
      return true;
    }
    return false;
  }

  // Find a group by ID
  getGroupById(groupId: string): Group | null {
    const groups = this.getGroups();
    return groups.find(group => group.id === groupId) || null;
  }

  // Add a channel to a group
  addChannelToGroup(groupId: string, channel: Channel): Group | null {
    const group = this.getGroupById(groupId);
    if (group) {
      if (!group.channels) {
        group.channels = [];
      }
      group.channels.push(channel);
      return this.updateGroup(groupId, { channels: group.channels });
    }
    return null;
  }

  // Remove a channel from a group
  removeChannelFromGroup(groupId: string, channelId: string): Group | null {
    const group = this.getGroupById(groupId);
    if (group) {
      if (!group.channels) {
        group.channels = [];
      }
      group.channels = group.channels.filter(channel => channel.id !== channelId);
      return this.updateGroup(groupId, { channels: group.channels });
    }
    return null;
  }

  // Add a user to a group
  addUserToGroup(groupId: string, userId: string): Group | null {
    const group = this.getGroupById(groupId);
    const user = this.userService.getUserById(userId);

    if (group && user) {
      if (!group.admins.some(admin => admin.id === userId)) {
        group.admins.push(user);
        this.updateGroup(groupId, { admins: group.admins });
      }

      this.userService.addGroupToUser(userId, group.id);
      return group;
    }
    return null;
  }

  // Remove a user from a group
  removeUserFromGroup(groupId: string, userId: string): boolean {
    const group = this.getGroupById(groupId);
    const user = this.userService.getUserById(userId);

    if (group && user) {
      group.admins = group.admins.filter(admin => admin.id !== userId);
      this.updateGroup(groupId, { admins: group.admins });

      this.userService.removeGroupFromUser(userId, groupId);
      return true;
    }
    return false;
  }

  // Promote a user to admin
  promoteToAdmin(groupId: string, userId: string): Group | null {
    const group = this.getGroupById(groupId);
    const user = this.userService.getUserById(userId);

    if (group && user && !group.admins.some(admin => admin.id === userId)) {
      group.admins.push(user);
      return this.updateGroup(groupId, { admins: group.admins });
    }
    return null;
  }

  // Demote an admin from a group
  demoteAdmin(groupId: string, userId: string): Group | null {
    const group = this.getGroupById(groupId);
    if (group) {
      group.admins = group.admins.filter(admin => admin.id !== userId);
      return this.updateGroup(groupId, { admins: group.admins });
    }
    return null;
  }

  // Remove group from all users
  private removeGroupFromUsers(groupId: string): void {
    const users = this.userService.getUsers();
    users.forEach(user => {
      user.groups = user.groups.filter(group => group !== groupId);
      this.userService.updateUser(user.id, { groups: user.groups });
    });
  }

  // Register a user as interested in a group
  registerUserToGroup(groupId: string, userId: string): boolean {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);
    const user = this.userService.getUserById(userId);
  
    if (group && user) {
      if (!group.interested) {
        group.interested = [];
      }

      if (!group.interested.some(u => u.id === userId)) {
        group.interested.push(user);
        this.saveGroups(groups);
        return true; // Notify success
      } else {
        console.error('User is already interested');
        return false;
      }
    } else {
      console.error('Group or user not found');
      return false;
    }
  }

  // Approve an interested user and move them to members
  approveInterestedUser(groupId: string, userId: string): Group | null {
    const group = this.getGroupById(groupId);
    const user = this.userService.getUserById(userId);

    if (group && user) {
      if (!group.interested) {
        group.interested = [];
      }
      if (!group.members) {
        group.members = [];
      }

      const userIndex = group.interested.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        group.interested.splice(userIndex, 1);
        group.members.push(user);
        this.updateGroup(groupId, { interested: group.interested, members: group.members });
        this.userService.addGroupToUser(userId, group.id);
        this.userService.removeInterestedGroupFromUser(userId,group.id);
      }
    }
    return null;
  }

  // Deny an interested user and remove them from interested
  denyInterestedUser(groupId: string, userId: string): Group | null {
    const group = this.getGroupById(groupId);

    if (group) {
      if (!group.interested) {
        group.interested = [];
      }

      const userIndex = group.interested.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        group.interested.splice(userIndex, 1);
        this.updateGroup(groupId, { interested: group.interested });
        this.userService.removeGroupFromUser(userId, groupId);
      }
    }
    return null;
  }
}
