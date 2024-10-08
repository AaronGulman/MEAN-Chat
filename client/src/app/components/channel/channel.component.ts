import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, Renderer2, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/channel.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { Channel } from '../../models/channel.model';
import { Message } from '../../models/message';
import { SocketService } from '../../services/socket.service';
import { UploadService } from '../../services/upload.service';
import { PeerService } from '../../services/peer.service';

interface VideoElement {
  muted: boolean;
  srcObject: MediaStream;
  userId: string;
}

const gdmOptions = {
  video: true,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
  }
};

const gumOptions = {
  audio: true,
  video: {
    width: { ideal: 640 },
    height: { ideal: 360 },
  }
};

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }), // Initial state: slide in from left
        animate('0.3s ease-out', style({ transform: 'translateX(0)', opacity: 1 })) // End state
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate('0.4s ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.4s ease-in', style({ transform: 'scale(0.5)', opacity: 0 }))
      ])
    ])
  ]
})
export class ChannelComponent implements OnInit {
  channel: Channel = new Channel('', '', '', '');
  channelMembers: User[] = [];
  availableMembers: User[] = [];
  role: string = '';
  selectedNav: string = 'channel';
  channelId: string = '';
  group: Group = new Group('', '');
  currentUser: User = new User('', '', '', '');
  newMessage: string = '';
  uploadFiles: File[] = [];
  @ViewChild('chatHistory') chatHistory!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  messageSignal = signal<Message[]>([]);
  isCallStarted = false;
  ownID: string = '';
  currentCall: any;
  peerList: string[] = [];
  currentStream: any;
  videos: VideoElement[] = [];
  calls: any[] = [];
  private isListenerAdded = false;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private authService: AuthService,
    private channelService: ChannelService,
    private socketService: SocketService,
    private peerService: PeerService,
    private uploadService: UploadService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ) {}

  // Initialize component and load group/channel data
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelId = params['channelId'];
      this.loadGroup(params['groupId']);
    });
    this.ownID = this.peerService.myPeerId;
  }

  // Load group data based on groupId
  loadGroup(groupId: string) {
    this.groupService.getGroupById(groupId).subscribe(group => {
      this.group = group;
      this.loadChannel(this.group.id, this.channelId);
    });
  }

  // Load channel data based on groupId and channelId
  loadChannel(groupId: string, channelId: string) {
    const loggedInUser = this.authService.getLoggedInUser();
    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.userService.getUserByUsername(loggedInUser).subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.setUserAvatarPath(user);
        this.socketService.joinChannel(channelId, this.currentUser);
        this.socketService.getPeerID().subscribe(peerID => this.handlePeerID(peerID));
        this.role = this.determineUserRole(user);
        this.channelService.getChannelById(groupId, channelId).subscribe(response => this.initializeChannel(response));
      }
    });
    this.socketService.getMessage().subscribe(message => this.handleIncomingMessage(message));
  }

  // Set user's avatar path or use a default one
  private setUserAvatarPath(user: User) {
    if (!user.avatarPath) {
      this.currentUser.avatarPath = "/assets/avatar.jpg";
    } else {
      this.uploadService.getFile(user.avatarPath).subscribe(blob => {
        const objectURL = URL.createObjectURL(blob);
        this.currentUser.avatarPath = objectURL;
      });
    }
  }

  // Handle peer ID logic for streaming purposes
  private handlePeerID(peerID: string) {
    if (peerID !== this.ownID) {
      if (this.peerList.includes(peerID)) {
        this.peerList = this.peerList.filter(id => id !== peerID);
      } else {
        this.peerList.push(peerID);
      }
    }
  }

  // Determine the role of the user in the channel
  private determineUserRole(user: User) {
    return user.roles.includes('superadmin') ? 'superadmin' : user.roles.includes('admin') ? 'admin' : 'user';
  }

  // Initialize channel data including channel info and messages
  private initializeChannel(response: { channel: Channel; messages: Message[] }) {
    this.channel = response.channel;
    this.messageSignal.set(response.messages);
    this.updateMessagesWithAvatar(response.messages);
    this.loadMembers();
  }

  // Update messages to include avatars for the users who sent them
  private updateMessagesWithAvatar(messages: Message[]) {
    messages.forEach(message => {
      if (message.uploadUrl) {
        this.fetchMessageFiles(message);
      }
      this.userService.getUserByUsername(message.userId).subscribe(messageUser => {
        if (messageUser.avatarPath) {
          this.uploadService.getFile(messageUser.avatarPath).subscribe(blob => {
            const objectURL = URL.createObjectURL(blob);
            message.avatarPath = objectURL;
          });
        }
      });
    });
  }

  // Fetch files attached to a message
  private fetchMessageFiles(message: any) {
    message.uploadUrl.forEach((url: any, index: any) => {
      this.uploadService.getFile(url).subscribe(blob => {
        const objectURL = URL.createObjectURL(blob);
        message.uploadUrl![index] = objectURL;
      });
    });
  }

  // Handle incoming messages from the socket
  private handleIncomingMessage(message: Message) {
    if (message.uploadUrl) {
      this.fetchMessageFiles(message);
    }
    this.userService.getUserByUsername(message.userId).subscribe(messageUser => {
      if (messageUser.avatarPath) {
        this.uploadService.getFile(messageUser.avatarPath).subscribe(blob => {
          const objectURL = URL.createObjectURL(blob);
          message.avatarPath = objectURL;
        });
      }
    });
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
    this.messageSignal.update(messages => [...messages, message]);
  }

  // Auto-scroll chat to the bottom when new messages arrive
  private autoScrollEffect = effect(() => {
    const messages = this.messageSignal();
    this.scrollToBottom();
  });

  // Scroll to the bottom of the chat history
  scrollToBottom(): void {
    if (this.chatHistory) {
      const element = this.chatHistory.nativeElement;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  // Handle file selection for message attachments
  onFileSelected(event: any) {
    this.uploadFiles = Array.from(event.target.files);
  }

  // Send a message in the channel
  sendMessage() {
    if (this.uploadFiles.length > 0) {
      this.uploadService.uploadFiles(this.uploadFiles).subscribe(response => {
        const uploadedUrls = response.data.map((file: any) => file.filename);
        const message = new Message(this.channelId, this.authService.getLoggedInUser(), this.newMessage, new Date(), uploadedUrls);
        this.socketService.sendMessage(message, this.currentUser);
        this.resetMessageInput();
      });
    } else {
      const message = new Message(this.channelId, this.authService.getLoggedInUser(), this.newMessage, new Date());
      this.socketService.sendMessage(message, this.currentUser);
      this.resetMessageInput();
    }
  }

  // Reset the message input field and clear attachments
  private resetMessageInput() {
    this.newMessage = '';
    this.uploadFiles = [];
    this.fileInput.nativeElement.value = '';
  }

  // Select the navigation item
  selectNavItem(navItem: string) {
    this.selectedNav = navItem;
  }

  // Navigate back to the group view and leave the channel
  goBack() {
    this.router.navigate(['/group/' + this.group.id]);
    this.socketService.leaveChannel(this.channelId, this.currentUser);
  }

  // Check if the current user is an admin
  isCurrentUserAdmin(): boolean {
    return this.group.admins.some(admin => admin.id === this.currentUser.id);
  }

  // Confirm and delete the channel
  confirmDeleteChannel() {
    if (confirm('Are you sure you want to delete this channel? This action cannot be undone.')) {
      this.deleteChannel();
    }
  }

  // Delete the current channel
  deleteChannel() {
    this.channelService.deleteChannel(this.group.id, this.channel.id).subscribe(() => {
      this.groupService.removeChannelFromGroup(this.group.id, this.channelId).subscribe(() => {
        alert('Channel successfully deleted');
        this.goBack();
      });
    });
  }

  // Update the channel's details
  updateChannel() {
    this.channelService.updateChannel(this.group.id, this.channel.id, {
      name: this.channel.name,
      description: this.channel.description
    }).subscribe(updatedChannel => {
      this.channel = updatedChannel;
      alert('Channel details updated');
      this.loadChannel(this.group.id, this.channelId);
    });
  }

  // Add a user to the channel
  addUserToChannel(member: User) {
    const confirmAdd = confirm(`Are you sure you want to add ${member.username} to the channel?`);
    if (confirmAdd) {
      this.channelService.addUserToChannel(this.group.id, this.channelId, member.id).subscribe(
        () => {
          alert(`${member.username} has been added to the channel successfully.`);
          this.loadChannel(this.group.id, this.channelId);
        },
        (error) => {
          console.error('Error adding user to channel:', error);
        }
      );
    }
  }
  
  // Remove a user from the channel
  removeUserFromChannel(member: User) {
    const confirmRemove = confirm(`Are you sure you want to remove ${member.username} from the channel?`);
    if (confirmRemove) {
      this.channelService.removeUserFromChannel(this.group.id, this.channelId, member.id).subscribe(
        () => {
          alert(`${member.username} has been removed from the channel.`);
          this.loadChannel(this.group.id, this.channelId);
        },
        (error) => {
          console.error('Error removing user from channel:', error);
        }
      );
    }
  }
  
  // Leave the channel
  leaveChannel() {
    const confirmLeave = confirm('Are you sure you want to leave the channel?');
    if (confirmLeave) {
      this.channelService.removeUserFromChannel(this.group.id, this.channelId, this.currentUser.id).subscribe(
        () => {
          this.goBack();
        },
        (error) => {
          console.error('Error removing user from channel:', error);
        }
      );
    }
  }

  // Load the members of the channel
  loadMembers() {
    const channelUserIds = this.channel.users || [];
    this.channelMembers = this.group.members.filter(user => channelUserIds.includes(user.id));
    this.availableMembers = this.group.members.filter(user => !channelUserIds.includes(user.id));
  }

  // Add the user's own video to the video list
  addMyVideo(stream: MediaStream) {
    this.videos.push({
      muted: true,
      srcObject: stream,
      userId: this.peerService.myPeerId
    });
  }

  // Add another user's video to the video list
  addOtherUserVideo(userId: string, stream: MediaStream) {
    const newVideo: VideoElement = { muted: false, srcObject: stream, userId };
    const index = this.videos.findIndex(video => video.userId === userId);
    if (index !== -1) {
      this.videos[index] = newVideo;
    } else {
      this.videos.push(newVideo);
    }
  }

  // Set up the listener for incoming calls
  private setupCallListener(): void {
    if (this.isListenerAdded) return;
    this.isListenerAdded = true;
    this.peerService.myPeer.on('call', (call: any) => this.handleIncomingCall(call));
  }

  // Handle an incoming call
  private handleIncomingCall(call: any): void {
    if (this.currentStream) {
      call.answer(this.currentStream);
    } else {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        this.currentStream = stream;
        this.addMyVideo(this.currentStream);
        call.answer(this.currentStream);
      }).catch(error => call.close());
    }
    this.addCallListeners(call);
  }

  // Initiate a call to another peer
  calling(peerID: string): void {
    if (!this.isReadyToCall(peerID)) return;
    const call = this.peerService.myPeer.call(peerID, this.currentStream, { metadata: { peerId: this.peerService.myPeerId } });
    this.currentCall = call;
    this.calls.push(call);
    this.addCallListeners(call, peerID);
  }

  // Check if the user is ready to call another peer
  private isReadyToCall(peerID: string): boolean {
    if (!this.currentStream || peerID === this.ownID || this.calls.some(call => call.peer === peerID)) {
      alert('Cannot start a call. Check your setup.');
      return false;
    }
    return confirm(`Do you want to call ${peerID}?`);
  }

  // Add listeners for the call (handle remote streams and call closure)
  private addCallListeners(call: any, peerID: string = ''): void {
    call.on('stream', (remoteStream: MediaStream) => this.addOtherUserVideo(peerID || call.metadata.peerId, remoteStream));
    call.on('close', () => {
      this.videos = this.videos.filter(video => video.userId !== (peerID || call.metadata.peerId));
      this.calls = this.calls.filter((c: any) => c !== call);
    });
  }

  // End an ongoing call
  endCall(): void {
    this.calls.forEach(call => call.close());
    this.cleanupStreams();
    this.isCallStarted = false;
    this.socketService.peerID(this.peerService.myPeerId);
    if (this.peerService.myPeer && !this.peerService.myPeer.disconnected) {
      this.peerService.myPeer.disconnect();
    }
    this.peerList = this.peerList.filter(peerID => peerID !== this.ownID);
  }

  // Clean up media streams after ending the call
  private cleanupStreams(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track: any) => track.stop());
      this.currentStream = null;
    }
    this.videos = [];
  }

  // Start streaming (either camera or screen)
  private async startStreaming(getMediaStream: () => Promise<MediaStream>) {
    try {
      this.currentStream = await getMediaStream();
      this.addMyVideo(this.currentStream);
      if (this.peerService.myPeer.disconnected) {
        await this.peerService.myPeer.reconnect();
      }
      this.socketService.peerID(this.peerService.myPeerId);
      this.setupCallListener();
      this.isCallStarted = true;
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }

  // Stream the user's camera
  async streamCamera() {
    await this.startStreaming(() => navigator.mediaDevices.getUserMedia(gumOptions));
  }

  // Stream the user's screen
  async streamScreen() {
    await this.startStreaming(() => navigator.mediaDevices.getDisplayMedia(gdmOptions));
  }
}
