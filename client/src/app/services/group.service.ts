import { Injectable } from '@angular/core';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { User } from '../models/user.model';
import { UserService } from './user.service'; // Make sure to import UserService

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private localStorageKey = 'groups';

  constructor(private userService: UserService) {}

  // Retrieve all groups from local storage
  private getGroups(): Group[] {
    const groups = localStorage.getItem(this.localStorageKey);
    return groups ? JSON.parse(groups) : [];
  }

  // Save groups to local storage
  private saveGroups(groups: Group[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(groups));
  }

  // Create a new group (can be done by Group Admin or Super Admin)
  createGroup(name: string, description = "", admin: User[]): Group {
    const id = Date.now().toString();
    const newGroup = new Group(id, name, description, admin);
    const groups = this.getGroups();
    groups.push(newGroup);
    this.saveGroups(groups);
    return newGroup;
  }

  // Update an existing group
  updateGroup(groupId: string, updatedData: Partial<Group>, user: User): Group | null {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group) {
      if (this.isSuperAdmin(user) || (group.admins.includes(user) && group.admins.some(admin => admin.id === user.id))) {
        const updatedGroup = { ...group, ...updatedData };
        const index = groups.findIndex(g => g.id === groupId);
        groups[index] = updatedGroup;
        this.saveGroups(groups);
        return updatedGroup;
      }
    }
    return null;
  }

  // Delete a group by ID (only by the creator or Super Admin)
  deleteGroup(groupId: string, user: User): boolean {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group) {
      if (this.isSuperAdmin(user) || (group.admins.includes(user) && group.admins.some(admin => admin.id === user.id))) {
        const updatedGroups = groups.filter(g => g.id !== groupId);
        if (groups.length !== updatedGroups.length) {
          this.saveGroups(updatedGroups);
          this.removeGroupFromUsers(groupId);
          return true;
        }
      }
    }
    return false;
  }

  // Find a group by ID
  getGroupById(groupId: string): Group | null {
    const groups = this.getGroups();
    return groups.find(group => group.id === groupId) || null;
  }

  // Add a channel to a group
  addChannelToGroup(groupId: string, channel: Channel, user: User): Group | null {
    const group = this.getGroupById(groupId);

    if (group && (this.isSuperAdmin(user) || (group.admins.includes(user) && group.admins.some(admin => admin.id === user.id)))) {
      group.channels.push(channel);
      this.updateGroup(groupId, { channels: group.channels }, user);
      return group;
    }
    return null;
  }

  // Add a user to a group
  addUserToGroup(groupId: string, userId: string, currentUser: User): Group | null {
    const group = this.getGroupById(groupId);
    const user = this.userService.getUserById(userId);

    if (group && user) {
      if (this.isSuperAdmin(currentUser) || (group.admins.includes(currentUser) && group.admins.some(admin => admin.id === currentUser.id))) {
        // Add user to group
        if (!group.admins.some(admin => admin.id === userId)) {
          group.admins.push(user);
          this.updateGroup(groupId, { admins: group.admins }, currentUser);
        }

        // Add group to user
        this.userService.addGroupToUser(userId, group);
        return group;
      }
    }
    return null;
  }

  // Remove a user from a group
  removeUserFromGroup(groupId: string, userId: string, currentUser: User): boolean {
    const group = this.getGroupById(groupId);
    const user = this.userService.getUserById(userId);

    if (group && user) {
      if (this.isSuperAdmin(currentUser) || (group.admins.includes(currentUser) && group.admins.some(admin => admin.id === currentUser.id))) {
        // Remove user from group
        group.admins = group.admins.filter(admin => admin.id !== userId);
        this.updateGroup(groupId, { admins: group.admins }, currentUser);

        // Remove group from user
        this.userService.removeGroupFromUser(userId, groupId);
        return true;
      }
    }
    return false;
  }

  // Promote a user to admin (only Super Admin)
  promoteToAdmin(groupId: string, user: User, currentUser: User): Group | null {
    if (!this.isSuperAdmin(currentUser)) {
      return null; // Only Super Admin can promote users
    }

    const group = this.getGroupById(groupId);
    if (group && !group.admins.includes(user)) {
      group.admins.push(user);
      this.updateGroup(groupId, { admins: group.admins }, currentUser);
      return group;
    }
    return null;
  }

  // Demote an admin from a group (only Super Admin or the admin themselves)
  demoteAdmin(groupId: string, userId: string, currentUser: User): Group | null {
    const group = this.getGroupById(groupId);
    if (group && (this.isSuperAdmin(currentUser) || (currentUser.id === userId))) {
      group.admins = group.admins.filter(admin => admin.id !== userId);
      this.updateGroup(groupId, { admins: group.admins }, currentUser);
      return group;
    }
    return null;
  }

  // Remove group from all users
  private removeGroupFromUsers(groupId: string): void {
    const users = this.userService.getUsers();
    users.forEach(user => {
      user.groups = user.groups.filter(group => group.id !== groupId);
      this.userService.updateUser(user.id, { groups: user.groups });
    });
  }

  // Check if a user is a super admin
  private isSuperAdmin(user: User): boolean {
    return user.roles.includes('superadmin');
  }
}
