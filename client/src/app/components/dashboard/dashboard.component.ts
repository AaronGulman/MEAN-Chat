declare var bootstrap: any;
import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
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

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit() {
    const loggedInUser = this.authService.getLoggedInUser();
    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }
  
    this.userService.getUserByUsername(loggedInUser).subscribe(
      (user) => {
        if (user) {
          this.user = user;
          this.username = user.username;
          this.role = user.roles.includes('superadmin') ? 'superadmin' : user.roles.includes('admin') ? 'admin' : 'user';
  
          // Create an array of observables for the groups and interested groups
          const groupObservables = user.groups ? user.groups.map(groupId => this.groupService.getGroupById(groupId)) : [];
          const interestedGroupObservables = user.interested ? user.interested.map(groupId => this.groupService.getGroupById(groupId)) : [];
  
          // Use forkJoin to wait for all the group observables to complete
          forkJoin(groupObservables).subscribe(
            (groups: Group[]) => {
              this.groups = groups;
            },
            (error) => console.error('Error fetching groups:', error)
          );
  
          // Use forkJoin to wait for all the interested group observables to complete
          forkJoin(interestedGroupObservables).subscribe(
            (interestedGroups: Group[]) => {
              this.interestedGroups = interestedGroups;
            },
            (error) => console.error('Error fetching interested groups:', error)
          );
  
          this.canCreateGroup = this.role === 'superadmin' || this.role === 'admin';
          this.loadAllUsers();
          this.loadAvailableGroups();
          this.socketService.initSocket();
        } else {
          this.router.navigate(['/login']);
        }
      },
      (error) => console.error('Error loading user by username:', error)
    );
  
    
  }

  // Helper method to get a group by ID using GroupService
  getGroupById(groupId: string): Group {
    let fetchedGroup: Group = new Group('', '');
    this.groupService.getGroupById(groupId).subscribe(
      (group) => {
        fetchedGroup = group;
      },
      (error) => console.error('Error fetching group:', error)
    );
    return fetchedGroup;
  }

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
          
          return !isUserMember && (!isUserInterested || this.registrationStatus[group.id] === 'Pending') && !isUserBanned;
        });
  
        
        this.availableGroups.forEach(group => {
          if (!(group.id in this.registrationStatus)) {
            this.registrationStatus[group.id] = 'Register';
          }
        });
      },
      (error) => console.error('Error loading available groups:', error)
    );
  }
  

  loadAllUsers() {
    this.userService.getUsers().subscribe(
      (users) => {
        this.allUsers = users;
      },
      (error) => console.error('Error loading all users:', error)
    );
  }

  createGroup() {
    if (!this.newGroupName.trim() || !this.newGroupDescription.trim()) {
      return;
    }
  
    this.groupService.createGroup(this.newGroupName, this.newGroupDescription, this.user).subscribe(
      (response) => {
        // Access newGroup from the response object
        const newGroup = response.newGroup;
        
        if (newGroup && newGroup.id) {
          this.userService.addGroupToUser(this.user.id, newGroup.id).subscribe(
            () => {
              console.log('Group created and added to user:', newGroup.id);
              this.groups.push(newGroup); // Add new group to local groups list
              this.newGroupName = ''; // Reset form fields
              this.newGroupDescription = '';
              this.closeCreateGroupModal(); // Close modal
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

  registerGroup(group: Group) {
    this.groupService.registerUserToGroup(group.id, this.user.id).subscribe(
      (groupUpdate) => {
        this.registrationStatus[group.id] = 'Pending';
        this.interestedGroups.push(group);
        this.userService.addInterestedGroupToUser(this.user.id, group.id).subscribe(
          () => {
            this.closeRegisterGroupModal();
          },
          (error) => console.error('Error adding interest to user:', error)
        );
      },
      (error) => console.error('Error registering user to group:', error)
    );
  }

  updateUser() {
    const updatedData = {
      email: this.user.email,
      password: this.user.password
    };

    this.userService.updateUser(this.user.id, updatedData).subscribe(
      () => {
        alert('Details Updated');
        this.selectedNav = 'groups';
      },
      (error) => console.error('Error updating user:', error)
    );
  }

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

  promoteUser(user: User): void {
    if (this.canPromote(user)) {
      this.userService.promoteUser(user.id).subscribe(
        () => this.loadUsers(),
        (error) => console.error('Error promoting user:', error)
      );
    }
  }

  demoteUser(user: User): void {
    if (this.canDemote(user)) {
      this.userService.demoteUser(user.id).subscribe(
        () => this.loadUsers(),
        (error) => console.error('Error demoting user:', error)
      );
    }
  }

  canPromote(user: User): boolean {
    return user.roles.includes('user') || user.roles.includes('admin');
  }

  canDemote(user: User): boolean {
    return user.roles.includes('admin');
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users) => {
        this.allUsers = users;
      },
      (error) => console.error('Error loading users:', error)
    );
  }

  logout() {
    this.authService.clearLoggedInUser();
    this.router.navigate(['/login']);
  }

  private toggleModal(modalId: string, action: 'show' | 'hide') {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      action === 'show' ? modal.show() : modal.hide();
    }
  }

  openCreateGroupModal() {
    this.toggleModal('createGroupModal', 'show');
  }

  closeCreateGroupModal() {
    this.toggleModal('createGroupModal', 'hide');
  }

  openRegisterGroupModal() {
    this.toggleModal('registerGroupModal', 'show');
  }

  closeRegisterGroupModal() {
    this.toggleModal('registerGroupModal', 'hide');
  }

  selectNavItem(navItem: string) {
    this.selectedNav = navItem;
  }

  selectGroup(group: Group) {
    this.router.navigate(['/group', group.id]);
  }
}
