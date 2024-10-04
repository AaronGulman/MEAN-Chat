import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';
import { Message } from '../models/message';
import { UploadService } from './upload.service';

const SERVER_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor(private uploadService: UploadService) { }

  // Initialize socket connection
  initSocket() {
    this.socket = io(SERVER_URL);
    return () => { this.socket.disconnect(); };
  }

  // Join a specific channel
  joinChannel(channelId: string) {
    if (!this.socket) {
      this.initSocket();
    }
    this.socket.emit('joinChannel', { channelId });
  }

  // Leave a specific channel
  leaveChannel(channelId: string) {
    if (this.socket) {
      this.socket.emit('leaveChannel', { channelId });
    }
  }

  // Send a message to a channel
  sendMessage(message: Message) {
    if (!this.socket) {
      this.initSocket();
      this.joinChannel(message.channelId);
    }
    const { channelId, userId, message: messageData, uploadUrl } = message;
    const timeStamp = Date.now();
    this.socket.emit('sendMessage', { channelId, userId, message: messageData, timeStamp, uploadUrl });
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
