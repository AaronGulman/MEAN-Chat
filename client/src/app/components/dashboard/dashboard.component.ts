declare var bootstrap: any;
import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';

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
  selectedGroup: Group | null = null;
  newGroupName: string = '';
  newGroupDescription: string = '';
  canCreateGroup: boolean = false;
  role: string = '';
  selectedNav: string = 'groups';
  registrationStatus: { [groupId: string]: string } = {};
  allUsers: User[] = []; // Added to store all users

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const loggedInUser = this.authService.getLoggedInUser();
    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (typeof loggedInUser === 'string') {
      const user = this.userService.getUserByUsername(loggedInUser);
      this.user = user || new User('', '', '', '');
      if (user) {
        this.username = user.username;
        this.role = user.roles.includes('superadmin') ? 'superadmin' : user.roles.includes('admin') ? 'admin' : 'user';
        this.groups = user.groups || [];
        this.interestedGroups = user.interested || [];
        this.canCreateGroup = this.role === 'superadmin' || this.role === 'admin';
        this.loadAllUsers(); // Load all users on initialization
      }
    }

    this.loadAvailableGroups();
  }

  loadAvailableGroups() {
    const allGroups = this.groupService.getGroups();
    const user = this.userService.getUserByUsername(this.username);
    const userInterestedGroups = user?.interested || [];

    this.interestedGroups = userInterestedGroups;
    this.registrationStatus = {};

    userInterestedGroups.forEach(group => {
      this.registrationStatus[group.id] = 'Pending';
    });

    this.availableGroups = allGroups.filter(group => {
      const isUserMember = this.groups.some(userGroup => userGroup.id === group.id);
      const isUserInterested = userInterestedGroups.some(interestedGroup => interestedGroup.id === group.id);
      const isPending = this.registrationStatus[group.id] === 'Pending';

      return !isUserMember && (!isUserInterested || isPending);
    });

    this.availableGroups.forEach(group => {
      if (!(group.id in this.registrationStatus)) {
        this.registrationStatus[group.id] = 'Register';
      }
    });
  }

  loadAllUsers() {
    this.allUsers = this.userService.getUsers();
  }

  selectNavItem(navItem: string) {
    this.selectedNav = navItem;
  }

  selectGroup(group: Group) {
    this.selectedGroup = group;
  }

  createGroup() {
    if (!this.newGroupName.trim() || !this.newGroupDescription.trim()) {
      return;
    }

    const loggedInUser = this.authService.getLoggedInUser();
    if (typeof loggedInUser === 'string') {
      const user = this.userService.getUserByUsername(loggedInUser);
      if (user) {
        const newGroup = this.groupService.createGroup(this.newGroupName, this.newGroupDescription, [user]);
        if (newGroup) {
          this.userService.addGroupToUser(user.id, newGroup);
          this.groups.push(newGroup);
          this.newGroupName = '';
          this.newGroupDescription = '';
          this.closeCreateGroupModal();
        }
      }
    }
  }

  openCreateGroupModal() {
    const modalElement = document.getElementById('createGroupModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeCreateGroupModal() {
    const modalElement = document.getElementById('createGroupModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  openRegisterGroupModal() {
    const modalElement = document.getElementById('registerGroupModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeRegisterGroupModal() {
    const modalElement = document.getElementById('registerGroupModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  registerGroup(group: Group) {
    const user = this.userService.getUserByUsername(this.username);
    if (user) {
      const success = this.groupService.registerUserToGroup(group.id, user.id);
      if (success) {
        this.registrationStatus[group.id] = 'Pending';
        this.interestedGroups.push(group);
        this.userService.addInterestToUser(user.id, group);
        this.closeRegisterGroupModal();
      } else {
        console.error('User is already interested or registration failed');
      }
    } else {
      console.error('User not found');
    }
  }

  logout() {
    this.authService.clearLoggedInUser();
    this.router.navigate(['/login']);
  }

  updateUser() {
    const updatedData = {
      email: this.user.email,
      password: this.user.password
    };
    this.userService.updateUser(this.user.id, updatedData);
    alert("Details Updated");
    this.selectedNav = "groups";
  }

  deleteUser(user: User) {
    const confirmDelete = confirm('Are you sure you want to delete this account?');
    if (confirmDelete) {
      this.userService.deleteUser(user.id);
      if(this.role === "superadmin" && this.selectedNav === "users"){
        this.loadUsers();
      }else{
        this.logout();
      }
    }
  }


  canPromote(user: User): boolean {
    // User can be promoted if they are either a 'user' or 'admin'
    return user.roles.includes('user') || user.roles.includes('admin');
  }


  
  canDemote(user: User): boolean {
    return user.roles.includes('admin');
  }
  promoteUser(user: User): void {
    if (user.roles.includes('user') || user.roles.includes('admin')) {
      // Promote user to admin
      this.userService.promoteUser(user.id);
      // Refresh user list
      this.loadUsers();
    }
  }

  // Demote a user from admin to user
  demoteUser(user: User): void {
    if (user.roles.includes('admin')) {
      // Demote user to user
      this.userService.demoteUser(user.id);
      // Refresh user list
      this.loadUsers();
    }
  }


  loadUsers(): void {
    this.allUsers = this.userService.getUsers();
  }
}
