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
      const newChannel = this.channelService.createChannel(this.newChannelName,this.group.id,this.newChannelDescription);
      this.groupService.addChannelToGroup(this.group.id, newChannel);
      this.group.channels.push(newChannel);
      this.newChannelName = '';
      this.newChannelDescription = '';
      this.closeCreateChannelModal();
    }
  }


  updateGroup() {
    const loggedInUser = this.authService.getLoggedInUser();
    if (typeof loggedInUser === 'string') {
      const user = this.userService.getUserByUsername(loggedInUser);
      if (user) {
        const updatedGroup = this.groupService.updateGroup(this.group.id, { name: this.group.name,description: this.group.description });
        if (updatedGroup) {
          this.group = updatedGroup;
          alert("Group details updated");
        } else {
          alert("Failed to update group");
        }
      }
    }
  }

  selectChannel(channel: Channel) {
    console.log(channel);
    this.router.navigate(['/channel'+ '/' + this.group.id+'/'+channel.id]);
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


  // Check if the current user is an admin of the group
  isCurrentUserAdmin(): boolean {
    const loggedInUser = this.authService.getLoggedInUser();
    if (typeof loggedInUser === 'string') {
      const currentUser = this.userService.getUserByUsername(loggedInUser);
      return this.group.admins.some(admin => admin.id === currentUser?.id);
    }
    return false;
  }


  canPromote(user: User): boolean {
    return user.roles.includes('user') || user.roles.includes('admin');
  }

  canDemote(user: User): boolean {
    return user.roles.includes('admin');
  }

  promoteUser(user: User): void {
    //this.userService.promoteUser(user.id);
    this.groupService.promoteToAdmin(this.group.id,user.id);
    this.group = this.groupService.getGroupById(this.group.id) || new Group('', '');
  }

  demoteUser(user: User): void {
    //this.userService.demoteUser(user.id);
    this.groupService.demoteAdmin(this.group.id,user.id);
    this.group = this.groupService.getGroupById(this.group.id) || new Group('', '');
  }


  goBack() {
    this.router.navigate(['/dashboard']);
  }
  

  banUser(user: User){
    this.removeUserFromGroup(user);
    this.groupService.banUserFromGroup(this.group.id, user.id);
  }
  
  approveUser(user: User){
    this.groupService.approveInterestedUser(this.group.id,user.id);
    this.group = this.groupService.getGroupById(this.group.id) || new Group('', '');
    }

  denyUser(user: User){
    this.groupService.denyInterestedUser(this.group.id,user.id);
    this.group = this.groupService.getGroupById(this.group.id) || new Group('', '');
  }

  removeUserFromGroup(user: User){
    this.groupService.removeUserFromGroup(this.group.id,user.id);
    this.group = this.groupService.getGroupById(this.group.id) || new Group('', '');
  }

  leaveGroup(){
    const confirmDelete = confirm("Are you sure you want to leave this group?");
    if(!confirmDelete){return;}
    const superUser = this.userService.getUserByUsername('super');
    const loggedInUser = this.authService.getLoggedInUser();
    const user = this.userService.getUserByUsername(loggedInUser);
    if(user && superUser){
      if(this.group.admins.length === 1){
        this.groupService.addUserToGroup(this.group.id,superUser.id);
        this.userService.addGroupToUser(superUser.id,this.group.id);
        this.userService.removeInterestedGroupFromUser(superUser.id,this.group.id);
        this.denyUser(superUser);
      }
      this.removeUserFromGroup(user);
      this.userService.removeGroupFromUser(user.id,this.group.id);
    }
    this.group = this.groupService.getGroupById(this.group.id) || new Group('', '');
    this.goBack();
  }

  getUsernameById(userId: string): string {
    const user = this.userService.getUserById(userId);
    return user ? user.username : 'Unknown';
}
}
