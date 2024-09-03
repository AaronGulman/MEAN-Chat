import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/chat.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { Channel } from '../../models/channel.model';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.css'
})
export class ChannelComponent implements OnInit{
  channel: Channel = new Channel('', '', '', '');
  role: string = '';
  selectedNav: string = 'channel';
  channelId: string = "";
  group: Group = new Group("","");
  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private authService: AuthService,
    private channelService: ChannelService,
    private router: Router,
    private route: ActivatedRoute 
  ) {}


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelId = params['channelId'];
      console.log(params['groupId']);
      this.group = this.groupService.getGroupById(params['groupId']) || new Group("","");
      this.loadChannel(this.group.id,this.channelId);
    });
  }


  loadChannel(groupId:string, channelId: string) {
    const loggedInUser = this.authService.getLoggedInUser();
    const user = this.userService.getUserByUsername(loggedInUser);
    this.role = user?.roles.includes('superadmin') ? 'superadmin' : user?.roles.includes('admin') ? 'admin' : 'user';
    this.channel = this.channelService.getChannelById(groupId,channelId) || new Channel('', '', '', '');
  }

  selectNavItem(navItem: string) {
    this.selectedNav = navItem;
  }

  goBack() {
    console.log(this.group);
    this.router.navigate(['/group/'+this.group.id]);
  }


  isCurrentUserAdmin(): boolean {
    const loggedInUser = this.authService.getLoggedInUser();
    if (typeof loggedInUser === 'string') {
      const currentUser = this.userService.getUserByUsername(loggedInUser);
      return this.group.admins.some(admin => admin.id === currentUser?.id);
    }
    return false;
  }

  confirmDeleteChannel() {
    const confirmDelete = confirm("Are you sure you want to delete this chanel? This action cannot be undone.");
    if (confirmDelete) {
      this.deleteChannel();
    }
  }

  deleteChannel(){
    const success = this.channelService.deleteChannel(this.group.id,this.channel.id);
    if (success) {
      this.groupService.removeChannelFromGroup(this.group.id,this.channelId);
      alert("Channel successfully deleted");
      this.goBack();
    } else {
      alert("Failed to delete channel");
    }
  }

  updateChannel(){
    const updatedChannel = this.channelService.updateChannel(this.group.id, this.channel.id,{ name: this.channel.name,description: this.channel.description })
    if(updatedChannel){
      this.channel = updatedChannel;
      alert("Channel details updated");
    }else{
      alert("Failed to update channel");
    }
  }

}
