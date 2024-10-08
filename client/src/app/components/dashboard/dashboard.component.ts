declare var bootstrap: any; // Declares a global variable for Bootstrap, used to control modals
import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { UploadService } from '../../services/upload.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Component state variables
  username: string = '';
  user: User = new User('', '', '', '');
  groups: Group[] = [];
  interestedGroups: Group[] = [];
  availableGroups: Group[] = [];
  newGroupName: string = '';
  newGroupDescription: string = '';
  canCreateGroup: boolean = false;
  role: string = '';
  selectedNav: string = 'groups';
  registrationStatus: { [groupId: string]: string } = {};
  allUsers: User[] = [];
  socket_disconnect: any;
  newAvatarFile: any;
  banned: { user: User, bannedGroups: string[]} [] = [];

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private authService: AuthService,
    private socketService: SocketService,
    private uploadService: UploadService,
    private router: Router
  ) {}

  // Called on component initialization
  ngOnInit() {
    // Get the logged-in user
    const loggedInUser = this.authService.getLoggedInUser();
    if (!loggedInUser) {
      // Redirect to login if user is not logged in
      this.router.navigate(['/login']);
      return;
    }
  
    // Load user information and their related groups
    this.userService.getUserByUsername(loggedInUser).subscribe(
      (user) => {
        if (user) {
          this.user = user;
          this.username = user.username;

          // Set user avatar or default avatar
          if (!user.avatarPath) {
            this.user.avatarPath = "/assets/avatar.jpg";
          } else {
            this.uploadService.getFile(user.avatarPath).subscribe(
              (blob) => {
                const objectURL = URL.createObjectURL(blob);
                this.user.avatarPath = objectURL;
              });
          }

          // Determine user's role
          this.role = user.roles.includes('superadmin') ? 'superadmin' : user.roles.includes('admin') ? 'admin' : 'user';

          // Load user's groups and interested groups using forkJoin
          const groupObservables = user.groups ? user.groups.map(groupId => this.groupService.getGroupById(groupId)) : [];
          const interestedGroupObservables = user.interested ? user.interested.map(groupId => this.groupService.getGroupById(groupId)) : [];
  
          forkJoin(groupObservables).subscribe(
            (groups: Group[]) => {
              this.groups = groups;
            },
            (error) => console.error('Error fetching groups:', error)
          );

          forkJoin(interestedGroupObservables).subscribe(
            (interestedGroups: Group[]) => {
              this.interestedGroups = interestedGroups;
            },
            (error) => console.error('Error fetching interested groups:', error)
          );
  
          // Determine if the user can create groups
          this.canCreateGroup = this.role === 'superadmin' || this.role === 'admin';
          this.loadAllUsers();
          this.loadAvailableGroups();
          this.socket_disconnect = this.socketService.initSocket(); // Initialize socket connection
        } else {
          // Redirect to login if user is not found
          this.router.navigate(['/login']);
        }
      },
      (error) => console.error('Error loading user by username:', error)
    );
  }

  // Load available groups that the user can join
  loadAvailableGroups() {
    this.groupService.getGroups().subscribe(
      (allGroups) => {
        const userInterestedGroups = this.interestedGroups;
        this.registrationStatus = userInterestedGroups.reduce((status, group) => {
          status[group.id] = 'Pending';
          return status;
        }, {} as { [groupId: string]: string });

        this.availableGroups = allGroups.filter(group => {
          const isUserMember = this.groups.some(userGroup => userGroup.id === group.id); 
          const isUserInterested = userInterestedGroups.some(interestedGroup => interestedGroup.id === group.id); 
          const isUserBanned = group.banned && group.banned.some(bannedUser => bannedUser.id === this.user.id);
          this.updateBannedUsers(group);

          // Show only groups that the user is not already a member or interested in and not banned from
          return !isUserMember && (!isUserInterested || this.registrationStatus[group.id] === 'Pending') && !isUserBanned;
        });

        // Set default registration status for available groups
        this.availableGroups.forEach(group => {
          if (!(group.id in this.registrationStatus)) {
            this.registrationStatus[group.id] = 'Register';
          }
        });
      },
      (error) => console.error('Error loading available groups:', error)
    );
  }

  // Load all users for administration purposes
  loadAllUsers() {
    this.userService.getUsers().subscribe(
      (users) => {
        this.allUsers = users;
      },
      (error) => console.error('Error loading all users:', error)
    );
  }

  // Handle avatar selection
  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.avatarPath = e.target.result; // Display new avatar immediately
      };
      reader.readAsDataURL(file);
    }
  }

  // Create a new group
  createGroup() {
    if (!this.newGroupName.trim() || !this.newGroupDescription.trim()) {
      return; // Do not create a group if name or description is empty
    }

    this.groupService.createGroup(this.newGroupName, this.newGroupDescription, this.user).subscribe(
      (response) => {
        const newGroup = response.newGroup;
        if (newGroup && newGroup.id) {
          // Add group to the user's group list after creation
          this.userService.addGroupToUser(this.user.id, newGroup.id).subscribe(
            () => {
              console.log('Group created and added to user:', newGroup.id);
              this.groups.push(newGroup);
              this.newGroupName = '';
              this.newGroupDescription = '';
              this.closeCreateGroupModal();
            },
            (error) => console.error('Error adding group to user:', error)
          );
        } else {
          console.error('Failed to create group.');
        }
      },
      (error) => console.error('Error creating group:', error)
    );
  }

  // Update the list of banned users in groups
  private updateBannedUsers(group: Group) {
    if (group.banned && group.banned.length > 0) {
      group.banned.forEach((bannedUser) => {
        const existingBannedEntry = this.banned.find(entry => entry.user.id === bannedUser.id);
        if (existingBannedEntry) {
          existingBannedEntry.bannedGroups.push(group.name);
        } else {
          this.banned.push({ user: bannedUser, bannedGroups: [group.name] });
        }
      });
    }
  }

  // Register the user for a group
  registerGroup(group: Group) {
    if (this.role === 'superadmin') {
      // If user is superadmin, join the group directly as an admin
      this.groupService.promoteToAdmin(group.id, this.user.id).subscribe(
        () => {
          this.userService.addGroupToUser(this.user.id, group.id).subscribe(
            () => {
              this.groups.push(group);
              console.log('Superadmin joined group directly:', group.name);
              this.groupService.promoteToAdmin(group.id, this.user.id);
            }
          );
        },
        (error) => console.error('Error adding superadmin to group:', error)
      );
    } else {
      // Otherwise, register the user as interested in joining the group
      this.groupService.registerUserToGroup(group.id, this.user.id).subscribe(
        (groupUpdate) => {
          this.registrationStatus[group.id] = 'Pending';
          this.interestedGroups.push(group);
          this.userService.addInterestedGroupToUser(this.user.id, group.id).subscribe(
            () => {
              this.loadAvailableGroups();
              this.closeRegisterGroupModal();
            },
            (error) => console.error('Error adding interest to user:', error)
          );
        },
        (error) => console.error('Error registering user to group:', error)
      );
    }
  }

  // Update user details, including avatar if provided
  updateUser() {
    const updatedData: any = {
      email: this.user.email,
      password: this.user.password
    };

    if (this.newAvatarFile) {
      this.uploadService.uploadFiles([this.newAvatarFile]).subscribe(
        (response: any) => {
          if (response && response.data && response.data.length > 0) {
            const uploadedUrls = response.data.map((file: any) => file.filename);
            updatedData.avatarPath = uploadedUrls;
          }
          this.updateUserData(updatedData);
        },
        (error) => console.error('Error uploading avatar:', error)
      );
    } else {
      this.updateUserData(updatedData);
    }
  }

  // Send updated user data to the backend
  updateUserData(updatedData: any) {
    this.userService.updateUser(this.user.id, updatedData).subscribe(
      () => {
        alert('Details Updated');
        this.selectedNav = 'groups';
      },
      (error) => console.error('Error updating user:', error)
    );
  }

  // Delete user account
  deleteUser(user: User) {
    if (confirm('Are you sure you want to delete this account?')) {
      this.userService.deleteUser(user.id).subscribe(
        () => {
          if (this.role === 'superadmin' && this.selectedNav === 'users') {
            this.loadUsers();
          } else {
            this.logout();
          }
        },
        (error) => console.error('Error deleting user:', error)
      );
    }
  }

  // Promote a user to a higher role
  promoteUser(user: User): void {
    if (this.canPromote(user)) {
      this.userService.promoteUser(user.id).subscribe(
        () => this.loadUsers(),
        (error) => console.error('Error promoting user:', error)
      );
    }
  }

  // Demote a user from their current role
  demoteUser(user: User): void {
    if (this.canDemote(user)) {
      this.userService.demoteUser(user.id).subscribe(
        () => this.loadUsers(),
        (error) => console.error('Error demoting user:', error)
      );
    }
  }

  // Check if the user can be promoted
  canPromote(user: User): boolean {
    return user.roles.includes('user') || user.roles.includes('admin');
  }

  // Check if the user can be demoted
  canDemote(user: User): boolean {
    return user.roles.includes('admin');
  }

  // Load all users for administrative purposes
  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users) => {
        this.allUsers = users;
      },
      (error) => console.error('Error loading users:', error)
    );
  }

  // Logout the current user
  logout() {
    this.authService.clearLoggedInUser();
    this.socket_disconnect();
    this.router.navigate(['/login']);
  }

  // Helper to control Bootstrap modals
  private toggleModal(modalId: string, action: 'show' | 'hide') {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      action === 'show' ? modal.show() : modal.hide();
    }
  }

  // Show the "create group" modal
  openCreateGroupModal() {
    this.toggleModal('createGroupModal', 'show');
  }

  // Hide the "create group" modal
  closeCreateGroupModal() {
    this.toggleModal('createGroupModal', 'hide');
  }

  // Show the "register group" modal
  openRegisterGroupModal() {
    this.toggleModal('registerGroupModal', 'show');
  }

  // Hide the "register group" modal
  closeRegisterGroupModal() {
    this.toggleModal('registerGroupModal', 'hide');
  }

  // Set the selected navigation item
  selectNavItem(navItem: string) {
    this.selectedNav = navItem;
  }

  // Navigate to the selected group
  selectGroup(group: Group) {
    this.router.navigate(['/group', group.id]);
  }
}
