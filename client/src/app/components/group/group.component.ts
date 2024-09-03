import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/chat.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { Channel } from '../../models/channel.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class GroupComponent implements OnInit {
  group: Group = new Group('', '');
  role: string = '';
  selectedNav: string = 'channels';
  newChannelName: string = '';
  newChannelDescription: string = '';

  constructor(
    private groupService: GroupService,
    private channelService: ChannelService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const groupId = params['id'];
      this.loadGroup(groupId);
    });
  }

  loadGroup(groupId: string) {
    const loggedInUser = this.authService.getLoggedInUser();
    if (typeof loggedInUser === 'string') {
      const user = this.userService.getUserByUsername(loggedInUser);
      this.role = user?.roles.includes('superadmin') ? 'superadmin' : user?.roles.includes('admin') ? 'admin' : 'user';
      this.group = this.groupService.getGroupById(groupId) || new Group('', '');
    }
    console.log(this.group);
  }

  selectNavItem(navItem: string) {
    this.selectedNav = navItem;
  }

  openCreateChannelModal() {
    const modalElement = document.getElementById('createChannelModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeCreateChannelModal() {
    const modalElement = document.getElementById('createChannelModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  createChannel() {
    if (!this.newChannelName.trim() || !this.newChannelDescription.trim()) {
      return;
    }

    const loggedInUser = this.authService.getLoggedInUser();
    if (typeof loggedInUser === 'string') {
      const user = this.userService.getUserByUsername(loggedInUser);
      if (user && (this.role === 'admin' || this.role === 'superadmin')) {
        const newChannel = this.channelService.createChannel(this.newChannelName,this.group.id);
        this.groupService.addChannelToGroup(this.group.id, newChannel);
        this.group.channels.push(newChannel);
        this.newChannelName = '';
        this.newChannelDescription = '';
        this.closeCreateChannelModal();
      }
    }
  }

  joinChannel(channel: Channel) {
    // Implement join channel logic here
  }

  updateGroup() {
    const loggedInUser = this.authService.getLoggedInUser();
    if (typeof loggedInUser === 'string') {
      const user = this.userService.getUserByUsername(loggedInUser);
      if (user) {
        const updatedGroup = this.groupService.updateGroup(this.group.id, { description: this.group.description });
        if (updatedGroup) {
          this.group = updatedGroup;
          alert("Group details updated");
        } else {
          alert("Failed to update group");
        }
      }
    }
  }

  confirmDeleteGroup() {
    const confirmDelete = confirm("Are you sure you want to delete this group? This action cannot be undone.");
    if (confirmDelete) {
      this.deleteGroup();
    }
  }


  deleteGroup() {
    const loggedInUser = this.authService.getLoggedInUser();
    if (typeof loggedInUser === 'string') {
      const user = this.userService.getUserByUsername(loggedInUser);
      if (user) {
        const success = this.groupService.deleteGroup(this.group.id);
        if (success) {
          alert("Group successfully deleted");
          this.router.navigate(['/dashboard']);
        } else {
          alert("Failed to delete group");
        }
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
    if (user.roles.includes('user') || user.roles.includes('admin')) {
      this.userService.promoteUser(user.id);
    }
  }

  demoteUser(user: User): void {
    if (user.roles.includes('admin')) {
      this.userService.demoteUser(user.id);
    }
  }


  goBack() {
    this.router.navigate(['/dashboard']);
  }
  

  banUser(user: User){

  }
  
  approveUser(user: User){
    this.groupService.approveInterestedUser(this.group.id,user.id);
    this.loadGroup(this.group.id);
    }

  denyUser(user: User){
    this.groupService.denyInterestedUser(this.group.id,user.id);
    this.loadGroup(this.group.id);
  }

  removeUserFromGroup(user: User){
    this.groupService.removeUserFromGroup(this.group.id,user.id);
    this.loadGroup(this.group.id);
  }
}
