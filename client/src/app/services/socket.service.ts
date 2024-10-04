import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';
import { Message } from '../models/message';

const SERVER_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor() { }

  // Initialize socket connection
  initSocket() {
    this.socket = io(SERVER_URL);
    return () => { this.socket.disconnect(); };
  }

  // Join a specific channel
  joinChannel(channelId: string) {
    this.socket.emit('joinChannel', { channelId });
  }

  // Leave a specific channel
  leaveChannel(channelId: string) {
    this.socket.emit('leaveChannel', { channelId });
  }

  // Send a message to a channel
  sendMessage(message: Message) {
    const { channelId, userId, message: messageData } = message;
    const timeStamp = Date.now();
    this.socket.emit('sendMessage', { channelId, userId, message: messageData, timeStamp });
  }

  // Listen for messages from the server
  getMessage(): Observable<Message> {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (data: Message) => {
        observer.next(data);
      });
    });
  }
}
