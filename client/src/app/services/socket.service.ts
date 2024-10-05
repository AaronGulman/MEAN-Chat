import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';
import { Message } from '../models/message';
import { User } from '../models/user.model';
import { UploadService } from './upload.service';

const SERVER_URL = 'https://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor(private uploadService: UploadService) {}

  // Initialize socket connection
  initSocket() {
    this.socket = io(SERVER_URL);
    return () => {
      this.socket.disconnect();
    };
  }

  // Join a specific channel
  joinChannel(channelId: string, user : User) {
    if (!this.socket) {
      this.initSocket();
    }
    this.socket.emit('joinChannel', { channelId });
    // Send a "joined the room" message after joining the channel
    const joinMessage: Message = {
      channelId: channelId,
      userId: user.username,
      message: `${user.username} has joined the room!`,
      timestamp: new Date(),
      uploadUrl: [],
      avatarPath: user.avatarPath
    };
    this.sendMessage(joinMessage,user);
  }

  // Leave a specific channel
  leaveChannel(channelId: string, user : User) {
    if (this.socket) {
      const leaveMessage: Message = {
        channelId: channelId,
        userId: user.username,
        message: `${user.username} has left the room!`,
        timestamp: new Date(),
        uploadUrl: [],
        avatarPath: user.avatarPath
      };
      this.sendMessage(leaveMessage,user);
      this.socket.emit('leaveChannel', { channelId });
    }
  }

  // Send a message to a channel
  sendMessage(message: Message, user: User) {
    if (!this.socket) {
      this.initSocket();
      this.joinChannel(message.channelId,user);
    }
    const { channelId, userId, message: messageData, uploadUrl } = message;
    const timeStamp = Date.now();
    this.socket.emit('sendMessage', {
      channelId,
      userId,
      message: messageData,
      timeStamp,
      uploadUrl
    });
  }

  // Listen for messages from the server
  getMessage(): Observable<Message> {
    return new Observable((observer) => {
      if (!this.socket) {
        this.initSocket();
      }
      this.socket.on('receiveMessage', (data: Message) => {
        observer.next(data);
      });
    });
  }
}
