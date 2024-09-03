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
  user: User = new User('','','','');
  groups: Group[] = [];
  interestedGroups: Group[] = [];
  availableGroups: Group[] = [];
  selectedGroup: Group | null = null;
  newGroupName: string = '';
  newGroupDescription: string = '';
  canCreateGroup: boolean = false;
  role: string = '';
  selectedNav: string = 'groups';
  registrationStatus: { [groupId: string]: string } = {}; // Track registration status

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

    // Initialize user data
    if (typeof loggedInUser === 'string') {
      const user = this.userService.getUserByUsername(loggedInUser);
      this.user = user || new User('','','','');
      if (user) {
        this.username = user.username;
        this.role = user.roles.includes('superadmin') ? 'superadmin' : user.roles.includes('admin') ? 'admin' : 'user';
        this.groups = user.groups || [];
        this.interestedGroups = user.interested || []; // Initialize interested groups
        this.canCreateGroup = this.role === 'superadmin' || this.role === 'admin';
      }
    }

    this.loadAvailableGroups();


  }

  loadAvailableGroups() {
    const allGroups = this.groupService.getGroups();
    const user = this.userService.getUserByUsername(this.username);
    const userInterestedGroups = user?.interested || [];

    // Set interestedGroups
    this.interestedGroups = userInterestedGroups;

    // Initialize registrationStatus for all groups
    this.registrationStatus = {};

    // Set registration status for interested groups
    userInterestedGroups.forEach(group => {
        this.registrationStatus[group.id] = 'Pending'; // Assuming interested groups are in 'Pending' status
    });

    // Determine available groups
    this.availableGroups = allGroups.filter(group => {
        const isUserMember = this.groups.some(userGroup => userGroup.id === group.id);
        const isUserInterested = userInterestedGroups.some(interestedGroup => interestedGroup.id === group.id);
        const isPending = this.registrationStatus[group.id] === 'Pending';

        // Show group if:
        // 1. User is not a member of the group
        // 2. User is not interested in the group, or if the group is in 'Pending' status
        return !isUserMember && (!isUserInterested || isPending);
    });

    console.log(this.availableGroups);

    // Set registration status for available groups
    this.availableGroups.forEach(group => {
        if (!(group.id in this.registrationStatus)) {
            this.registrationStatus[group.id] = 'Register';
        }
    });
}


  
  

  selectNavItem(navItem: string) {
    this.selectedNav = navItem;
    // Add any additional logic needed when a navigation item is selected
  }

  selectGroup(group: Group) {
    this.selectedGroup = group;
    // Add logic to handle group selection if needed
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
        this.registrationStatus[group.id] = 'Pending'; // Update registration status
        this.interestedGroups.push(group); // Optionally add the group to the user's list
        this.userService.addInterestToUser(user.id, group); // Add to interests
        this.closeRegisterGroupModal(); // Close the modal
      } else {
        console.error('User is already interested or registration failed');
        // Handle failure case if needed
      }
    } else {
      console.error('User not found');
      // Handle the case where the user is not found, e.g., show an error message
    }
  }



  logout() {
    this.authService.clearLoggedInUser(); // Clear session storage
    this.router.navigate(['/login']); // Redirect to login page
  }


  updateUser() {
    const updatedData = {
      email: this.user.email,
      password: this.user.password
    };
    this.userService.updateUser(this.user.id,updatedData);
    alert("Details Updated");
    this.selectedNav = "groups";
  }

  deleteUser() {
    const confirmDelete = confirm('Are you sure you want to delete your account?');
    if (confirmDelete) {
      this.userService.deleteUser(this.user.id);
      this.logout();
    }
  }
}
