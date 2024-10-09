import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';
import { Peer } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  // Unique identifier for the current peer, generated using UUID
  myPeerId = uuidv4();

  // Instance of the Peer object representing the current peer connection
  myPeer: any;

  // Stream object for the user's camera
  streamCamera: any;

  // Stream object for the user's screen sharing
  streamScreen: any;

  constructor() {
    // Initialize a new Peer connection with a unique peer ID and connection settings
    this.myPeer = new Peer(this.myPeerId, {
      host: "localhost",   // PeerJS server host
      secure: true,        // Use secure (HTTPS) connection
      port: 3001,          // Port number for the PeerJS server
      path: "/"            // Path for the PeerJS connection
    });
  }
}
