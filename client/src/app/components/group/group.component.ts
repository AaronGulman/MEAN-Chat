import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/chat.service'; 
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
  group: Group = new Group('', '');
  role: string = '';
  selectedNav: string = 'channels';
  newChannelName: string = '';
  newChannelDescription: string = '';
  currentGroupRole: string = '';
  currentUser: User = new User('', '', '','');

  constructor(
    private groupService: GroupService,
    private channelService: ChannelService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private uploadService: UploadService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const groupId = params['id'];
      this.loadGroup(groupId);
    });
  }

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
          if(!user.avatarPath){
            this.currentUser.avatarPath = "/assets/avatar.jpg";
          }else{
            this.uploadService.getFile(user.avatarPath).subscribe(
              (blob) => {
                const objectURL = URL.createObjectURL(blob);
                this.currentUser.avatarPath = objectURL;
              });
          }
          this.role = user.roles.includes('superadmin') ? 'superadmin' : user.roles.includes('admin') ? 'admin' : 'user';
  
          // Use forkJoin to fetch both the group and the channels simultaneously
          forkJoin([
            this.groupService.getGroupById(groupId),
            this.channelService.getChannels(groupId)
          ]).subscribe(
            ([group, channels]) => {
              this.group = group;
              this.group.channels = channels;  // Assuming channels are added to the group object
              this.currentGroupRole = this.getGroupRole(user.id);
              console.log(this.group);
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

    this.channelService.createChannel(this.newChannelName, this.group.id, this.newChannelDescription).subscribe(
      (newChannel) => {
        this.groupService.addChannelToGroup(this.group.id, newChannel.id).subscribe(
          () => {
            this.loadGroup(this.group.id);
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

  updateGroup() {
    if (!this.currentUser) return;

    this.groupService.updateGroup(this.group.id, {
      name: this.group.name,
      description: this.group.description
    }).subscribe(
      (updatedGroup) => {

        alert('Group details updated');
      },
      (error) => console.error('Failed to update group:', error)
    );
  }

  getGroupRole(userId: string): string {
    if (this.group.admins.some(admin => admin.id === userId)) {
      return 'Admin';
    } else if (this.group.members.some(member => member.id === userId)) {
      return 'User';
    } else {
      return 'Not a member';
    }
  }

  selectChannel(channel: Channel) {
    this.router.navigate(['/channel/' + this.group.id + '/' + channel.id]);
  }

  confirmDeleteGroup() {
    const confirmDelete = confirm('Are you sure you want to delete this group? This action cannot be undone.');
    if (confirmDelete) {
      this.deleteGroup();
    }
  }

  deleteGroup() {
    this.groupService.deleteGroup(this.group.id).subscribe(
      () => {
        alert('Group successfully deleted');
        this.router.navigate(['/dashboard']);
      },
      (error) => console.error('Failed to delete group:', error)
    );
  }

  canPromote(user: User): boolean {
    return user.roles.includes('user') || user.roles.includes('admin');
  }
  
  isCurrentUserAdmin(): boolean {
    return this.group.admins.some(admin => admin.id === this.currentUser?.id);
  }

  promoteUser(user: User): void {
    this.groupService.promoteToAdmin(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error promoting user to admin:', error)
    );
  }

  demoteUser(user: User): void {
    this.groupService.demoteAdmin(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error demoting admin:', error)
    );
  }

  banUser(user: User) {
    if(user.roles.includes('superadmin')){
      alert("You cannot ban a superadmin");
    }else if (confirm(`Ban ${user.username}?`)) {
      this.groupService.banUserFromGroup(this.group.id, user.id).subscribe(
        () => {
          this.loadGroup(this.group.id);
        },
        (error) => console.error('Error banning user:', error)
      );
    }
    
  }

  approveUser(user: User) {
    this.groupService.approveInterestedUser(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error approving user:', error)
    );
  }

  denyUser(user: User) {
    this.groupService.denyInterestedUser(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error denying user:', error)
    );
  }

  removeUserFromGroup(user: User) {
    this.groupService.removeUserFromGroup(this.group.id, user.id).subscribe(
      () => {
        this.loadGroup(this.group.id);
      },
      (error) => console.error('Error removing user from group:', error)
    );
  }

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

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
