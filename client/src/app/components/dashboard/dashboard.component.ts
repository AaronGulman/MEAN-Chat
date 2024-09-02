declare var bootstrap: any; // Declare bootstrap globally

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
  groups: Group[] = [];
  selectedGroup: Group | null = null;
  newGroupName: string = '';
  newGroupDescription: string = ''; // Added for description
  canCreateGroup: boolean = false;

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

    this.username = loggedInUser;

    if (typeof loggedInUser === 'string') {
      const user = this.userService.getUserByUsername(loggedInUser);
      if (user) {
        this.groups = user.groups || [];
        console.log(user);
        this.canCreateGroup = user.roles.includes('superadmin') || user.roles.includes('admin');
      }
    }

  }

  selectGroup(group: Group) {
    this.selectedGroup = group;
    // Uncomment and update the following lines as necessary
    // this.groupService.getGroupChannels(group.id).subscribe((data) => {
    //   this.channels = data;
    // });
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
          this.userService.addGroupToUser(user.id,newGroup);
          this.groups.push(newGroup);
          this.newGroupName = ''; // Clear the input field
          this.newGroupDescription = ''; // Clear the description field
          this.closeCreateGroupModal(); // Close the modal
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

  logout() {
    this.authService.clearLoggedInUser(); // Clear session storage
    this.router.navigate(['/login']); // Redirect to login page
  }
}
