import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/channel.service'; 
import { UploadService } from '../../services/upload.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { Channel } from '../../models/channel.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class GroupComponent implements OnInit {
  // State variables
  group: Group = new Group('', '');
  role: string = '';
  selectedNav: string = 'channels'; // Default selected tab
  newChannelName: string = '';
  newChannelDescription: string = '';
  currentGroupRole: string = '';
  currentUser: User = new User('', '', '', '');
  availableUser: User[] = []; // Users that are not members or admins of the group

  constructor(
    private groupService: GroupService,
    private channelService: ChannelService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private uploadService: UploadService,
  ) {}

  // Initialize component and load group details
  ngOnInit() {
    this.route.params.subscribe(params => {
      const groupId = params['id'];
      this.loadGroup(groupId);
    });
  }

  // Load users available to be added to the group
  loadAvailableUsers() {
    this.userService.getUsers().subscribe(
      (users) => {
        // Filter out users that are already members or admins of the group
        this.availableUser = users.filter(user => 
          !this.group.members.some(member => member.id === user.id) && 
          !this.group.admins.some(admin => admin.id === user.id)
        );
      },
      (error) => console.error('Error loading all users:', error)
    );
  }

  // Load group information, channels, and set current user information
  loadGroup(groupId: string) {
    const loggedInUser = this.authService.getLoggedInUser();
    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }
  
    this.userService.getUserByUsername(loggedInUser).subscribe(
      (user) => {
        if (user) {
          this.currentUser = user;

          // Set default avatar if none is provided
          if (!user.avatarPath) {
            this.currentUser.avatarPath = "/assets/avatar.jpg";
          } else {
            this.uploadService.getFile(user.avatarPath).subscribe(
              (blob) => {
                const objectURL = URL.createObjectURL(blob);
                this.currentUser.avatarPath = objectURL;
              }
            );
          }

          // Determine the role of the current user
          this.role = user.roles.includes('superadmin') ? 'superadmin' : user.roles.includes('admin') ? 'admin' : 'user';

          // Load group and channels
          forkJoin([
            this.groupService.getGroupById(groupId),
            this.channelService.getChannels(groupId)
          ]).subscribe(
            ([group, channels]) => {
              this.group = group;
              this.group.channels = channels;
              this.currentGroupRole = this.getGroupRole(user.id);

              // Automatically promote superadmins to admin in the group
              this.group.members
                .filter(user => user.roles.includes("superadmin"))
                .forEach(superadminUser => {
                  this.groupService.promoteToAdmin(this.group.id, superadminUser.id);
                });

              this.loadAvailableUsers(); // Load users that can be added to the group
            },
            (error) => console.error('Error loading group or channels:', error)
          );
        } else {
          this.router.navigate(['/login']);
        }
      },
      (error) => console.error('Error loading user:', error)
    );
  }

  // Select the navigation tab (e.g., channels, members)
  selectNavItem(navItem: string) {
    this.selectedNav = navItem;
  }

  // Open the "Create Channel" modal
  openCreateChannelModal() {
    const modalElement = document.getElementById('createChannelModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Close the "Create Channel" modal
  closeCreateChannelModal() {
    const modalElement = document.getElementById('createChannelModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  // Create a new channel in the group
  createChannel() {
    if (!this.newChannelName.trim() || !this.newChannelDescription.trim()) {
      return; // Do not proceed if the name or description is empty
    }

    this.channelService.createChannel(this.newChannelName, this.group.id, this.newChannelDescription).subscribe(
      (newChannel) => {
        this.groupService.addChannelToGroup(this.group.id, newChannel.id).subscribe(
          () => {
            this.loadGroup(this.group.id); // Reload the group to see the new channel
            this.newChannelName = '';
            this.newChannelDescription = '';
            this.closeCreateChannelModal();
          },
          (error) => console.error('Error adding channel to group:', error)
        );
      },
      (error) => console.error('Error creating channel:', error)
    );
  }

  // Update group information such as name or description
  updateGroup() {
    if (!this.currentUser) return;

    this.groupService.updateGroup(this.group.id, {
      name: this.group.name,
      description: this.group.description
    }).subscribe(
      () => {
        alert('Group details updated');
      },
      (error) => console.error('Failed to update group:', error)
    );
  }

  // Get the user's role in the group
  getGroupRole(userId: string): string {
    if (this.group.admins.some(admin => admin.id === userId)) {
      return 'Admin';
    } else if (this.group.members.some(member => member.id === userId)) {
      return 'User';
    } else {
      return 'Not a member';
    }
  }

  // Navigate to a specific channel in the group
  selectChannel(channel: Channel) {
    this.router.navigate(['/channel/' + this.group.id + '/' + channel.id]);
  }

  // Confirm before deleting the group
  confirmDeleteGroup() {
    const confirmDelete = confirm('Are you sure you want to delete this group? This action cannot be undone.');
    if (confirmDelete) {
      this.deleteGroup();
    }
  }

  // Delete the group
  deleteGroup() {
    this.groupService.deleteGroup(this.group.id).subscribe(
      () => {
        alert('Group successfully deleted');
        this.router.navigate(['/dashboard']);
      },
      (error) => console.error('Failed to delete group:', error)
    );
  }

  // Check if the user can be promoted to admin
  canPromote(user: User): boolean {
    return user.roles.includes('user') || user.roles.includes('admin');
  }

  // Check if the current user is an admin
  isCurrentUserAdmin(): boolean {
    return this.group.admins.some(admin => admin.id === this.currentUser?.id) || this.currentUser.roles[0] === "superadmin";
  }

  // Check if the current user is part of the channel
  isCurrentUserInChannel(channel: Channel): boolean {
    return Array.isArray(channel.users) && channel.users.some(userId => userId === this.currentUser.id);
  }

  // Promote a user to admin
  promoteUser(user: User): void {
    this.groupService.promoteToAdmin(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error promoting user to admin:', error)
    );
  }

  // Demote an admin to a regular member
  demoteUser(user: User): void {
    this.groupService.demoteAdmin(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error demoting admin:', error)
    );
  }

  // Ban a user from the group
  banUser(user: User) {
    if (user.roles.includes('superadmin')) {
      alert("You cannot ban a superadmin");
    } else if (confirm(`Ban ${user.username}?`)) {
      this.groupService.banUserFromGroup(this.group.id, user.id).subscribe(
        () => {
          this.loadGroup(this.group.id);
        },
        (error) => console.error('Error banning user:', error)
      );
    }
  }

  // Approve a user to join the group
  approveUser(user: User) {
    this.groupService.approveInterestedUser(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error approving user:', error)
    );
  }

  // Deny a user's request to join the group
  denyUser(user: User) {
    this.groupService.denyInterestedUser(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error denying user:', error)
    );
  }

  // Remove a user from the group
  removeUserFromGroup(user: User) {
    this.groupService.removeUserFromGroup(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error removing user from group:', error)
    );
  }

  // Leave the group
  leaveGroup() {
    const confirmLeave = confirm('Are you sure you want to leave this group?');
    if (!confirmLeave) return;

    if (this.group.admins.length === 1) {
      this.userService.getUserByUsername('super').subscribe((superUser) => {
        if (superUser) {
          this.groupService.addUserToGroup(this.group.id, superUser.id).subscribe(() => {
            this.userService.addGroupToUser(superUser.id, this.group.id).subscribe(() => {
              this.userService.removeInterestedGroupFromUser(superUser.id, this.group.id).subscribe(() => {
                this.denyUser(superUser);
                this.groupService.promoteToAdmin(this.group.id, superUser.id);
              });
            });
          });
        }
      });
    }

    if (this.currentUser) {
      this.removeUserFromGroup(this.currentUser);
      this.userService.removeGroupFromUser(this.currentUser.id, this.group.id).subscribe(() => {
        this.goBack();
      });
    }
  }

  // Add a user to the group
  addUser(user: User) {
    this.groupService.addUserToGroup(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error adding user:', error)
    );
  }

  // Go back to the dashboard
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
