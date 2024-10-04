import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/chat.service'; // Renamed to match the previous service
import { Router, ActivatedRoute } from '@angular/router';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { Channel } from '../../models/channel.model';
import { Message } from '../../models/message';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.css'
})
export class ChannelComponent implements OnInit {
  channel: Channel = new Channel('', '', '', '');
  role: string = '';
  selectedNav: string = 'channel';
  channelId: string = '';
  group: Group = new Group('', '');
  currentUser: User | undefined;
  messages: Message[] = [];
  newMessage: string = "";

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private authService: AuthService,
    private channelService: ChannelService,
    private socketService: SocketService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelId = params['channelId'];
      this.loadGroup(params['groupId']);
    });
  }

  // Load the group details
  loadGroup(groupId: string) {
    this.groupService.getGroupById(groupId).subscribe(
      (group) => {
        this.group = group;
        this.loadChannel(this.group.id, this.channelId);
      },
      (error) => console.error('Error loading group:', error)
    );
  }

  // Load the channel details
  loadChannel(groupId: string, channelId: string) {
    const loggedInUser = this.authService.getLoggedInUser();
    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserByUsername(loggedInUser).subscribe(
      (user) => {
        if (user) {
          this.currentUser = user;
          this.role = user.roles.includes('superadmin') ? 'superadmin' : user.roles.includes('admin') ? 'admin' : 'user';

          this.channelService.getChannelById(groupId, channelId).subscribe(
            (channel) => {
              this.channel = channel;
            },
            (error) => console.error('Error loading channel:', error)
          );
        }
      },
      (error) => console.error('Error loading user:', error)
    );
    this.socketService.joinChannel(channelId);
    this.socketService.getMessage().subscribe((message) => {
      this.messages.push(message);
    });
  }


  sendMessage(){
    const message = new Message(this.channelId,this.authService.getLoggedInUser(),this.newMessage,new Date());
    this.socketService.sendMessage(message);
    
  }

  selectNavItem(navItem: string) {
    this.selectedNav = navItem;
  }

  goBack() {
    this.router.navigate(['/group/' + this.group.id]);
    this.socketService.leaveChannel(this.channelId);
  }

  // Check if the current user is an admin of the group
  isCurrentUserAdmin(): boolean {
    return this.group.admins.some(admin => admin.id === this.currentUser?.id);
  }

  confirmDeleteChannel() {
    const confirmDelete = confirm('Are you sure you want to delete this channel? This action cannot be undone.');
    if (confirmDelete) {
      this.deleteChannel();
    }
  }

  deleteChannel() {
    this.channelService.deleteChannel(this.group.id, this.channel.id).subscribe(
      () => {
        this.groupService.removeChannelFromGroup(this.group.id, this.channelId).subscribe(
          () => {
            alert('Channel successfully deleted');
            this.goBack();
          },
          (error) => console.error('Error removing channel from group:', error)
        );
      },
      (error) => console.error('Error deleting channel:', error)
    );
  }

  updateChannel() {
    this.channelService.updateChannel(this.group.id, this.channel.id, {
      name: this.channel.name,
      description: this.channel.description
    }).subscribe(
      (updatedChannel) => {
        this.channel = updatedChannel;
        alert('Channel details updated');
        this.loadChannel(this.group.id,this.channelId);
      },
      (error) => console.error('Failed to update channel:', error)
    );
  }
}
