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
  // Socket connection instance
  public socket: any;

  // ID of the connected socket
  public socketId: any;

  constructor(private uploadService: UploadService) {}

  /**
   * @description Initialize socket connection to the server
   * @returns Function to disconnect the socket connection
   */
  initSocket() {
    this.socket = io(SERVER_URL);
    return () => {
      this.socket.disconnect();
    };
  }

  /**
   * @description Join a specific channel and notify other users
   * @param channelId - The ID of the channel to join
   * @param user - The user object containing user details
   */
  joinChannel(channelId: string, user: User) {
    if (!this.socket) {
      this.initSocket();
    }
    // Emit an event to join a channel
    this.socket.emit('joinChannel', { channelId });

    // Send a "joined the room" message to the channel
    const joinMessage: Message = {
      channelId: channelId,
      userId: user.username,
      message: `${user.username} has joined the room!`,
      timestamp: new Date(),
      uploadUrl: [],
      avatarPath: user.avatarPath
    };
    this.sendMessage(joinMessage, user);
  }

  /**
   * @description Leave a specific channel and notify other users
   * @param channelId - The ID of the channel to leave
   * @param user - The user object containing user details
   */
  leaveChannel(channelId: string, user: User) {
    if (this.socket) {
      // Send a "left the room" message to the channel
      const leaveMessage: Message = {
        channelId: channelId,
        userId: user.username,
        message: `${user.username} has left the room!`,
        timestamp: new Date(),
        uploadUrl: [],
        avatarPath: user.avatarPath
      };
      this.sendMessage(leaveMessage, user);
      // Emit an event to leave the channel
      this.socket.emit('leaveChannel', { channelId });
    }
  }

  /**
   * @description Send a message to a channel
   * @param message - The message object containing message details
   * @param user - The user object containing user details
   */
  sendMessage(message: Message, user: User) {
    if (!this.socket) {
      this.initSocket();
      // Rejoin the channel if the socket is re-initialized
      this.joinChannel(message.channelId, user);
    }
    const { channelId, userId, message: messageData, uploadUrl } = message;
    const timeStamp = Date.now();
    // Emit the message to the server
    this.socket.emit('sendMessage', {
      channelId,
      userId,
      message: messageData,
      timeStamp,
      uploadUrl
    });
  }

  /**
   * @description Listen for messages from the server and return as an observable
   * @returns Observable of type Message containing the message details
   */
  getMessage(): Observable<Message> {
    return new Observable((observer) => {
      if (!this.socket) {
        this.initSocket();
      }
      // Listen for the 'receiveMessage' event
      this.socket.on('receiveMessage', (data: Message) => {
        observer.next(data);
      });
    });
  }

  /**
   * @description Emit a peer ID to the server
   * @param peerID - The ID of the peer to emit
   */
  peerID(peerID: string) {
    this.socket.emit('peerID', peerID);
  }

  /**
   * @description Listen for peer ID events from the server and return as an observable
   * @returns Observable of type string containing the peer ID
   */
  getPeerID(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('peerID', (peerID: string) => {
        console.log("PeerID", peerID);
        observer.next(peerID);
      });
    });
  }
}
