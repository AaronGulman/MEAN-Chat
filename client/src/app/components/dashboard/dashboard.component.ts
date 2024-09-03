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
    private router: Router
  ) {}

  ngOnInit() {
    const loggedInUser = this.authService.getLoggedInUser();
    console.log("1");
    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.userService.getUserByUsername(loggedInUser);
    if (user) {
      this.user = user;
      this.username = user.username;
      this.role = user.roles.includes('superadmin') ? 'superadmin' : user.roles.includes('admin') ? 'admin' : 'user';
      this.groups = user.groups ? user.groups.map(group => this.groupService.getGroupById(group)).filter(group => group !== null) as Group[] : [];
      this.interestedGroups = user.interested
      ? user.interested.map(groupId => this.groupService.getGroupById(groupId)).filter(group => group !== null) as Group[]
      : [];
      this.canCreateGroup = this.role === 'superadmin' || this.role === 'admin';
      this.loadAllUsers();
    } else {
      this.router.navigate(['/login']);
    }

    this.loadAvailableGroups();
  }

  loadAvailableGroups() {
    const allGroups = this.groupService.getGroups();
    const userInterestedGroups = this.interestedGroups;

    this.registrationStatus = userInterestedGroups.reduce((status, group) => {
      status[group.id] = 'Pending';
      return status;
    }, {} as { [groupId: string]: string });

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
    this.router.navigate(['/group', group.id]);
  }

  createGroup() {
    if (!this.newGroupName.trim() || !this.newGroupDescription.trim()) {
      return;
    }

    const newGroup = this.groupService.createGroup(this.newGroupName, this.newGroupDescription, [this.user]);
    if (newGroup) {
      this.userService.addGroupToUser(this.user.id, newGroup.id);
      this.groups.push(newGroup);
      this.newGroupName = '';
      this.newGroupDescription = '';
      this.closeCreateGroupModal();
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

  private toggleModal(modalId: string, action: 'show' | 'hide') {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      action === 'show' ? modal.show() : modal.hide();
    }
  }

  registerGroup(group: Group) {
    const success = this.groupService.registerUserToGroup(group.id, this.user.id);
    if (success) {
      this.registrationStatus[group.id] = 'Pending';
      this.interestedGroups.push(group);
      this.userService.addInterestToUser(this.user.id, group.id);
      this.closeRegisterGroupModal();
    } else {
      console.error('User is already interested or registration failed');
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
    alert('Details Updated');
    this.selectedNav = 'groups';
  }

  deleteUser(user: User) {
    if (confirm('Are you sure you want to delete this account?')) {
      this.userService.deleteUser(user.id);
      if (this.role === 'superadmin' && this.selectedNav === 'users') {
        this.loadUsers();
      } else {
        this.logout();
      }
    }
  }
  canPromote(user: User): boolean {
    return user.roles.includes('user') || user.roles.includes('admin');
  }

  canDemote(user: User): boolean {
    return user.roles.includes('admin');
  }

  promoteUser(user: User): void {
    if (this.canPromote(user)) {
      this.userService.promoteUser(user.id);
      this.loadUsers();
    }
  }

  demoteUser(user: User): void {
    if (this.canDemote(user)) {
      this.userService.demoteUser(user.id);
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.allUsers = this.userService.getUsers();
  }
}
