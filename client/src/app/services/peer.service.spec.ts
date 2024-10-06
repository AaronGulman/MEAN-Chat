import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { PeerService } from './peer.service';
import { Peer } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';

describe('PeerService', () => {
  let service: PeerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
      ],
      providers: [PeerService]
    });
    service = TestBed.inject(PeerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a unique peer ID', () => {
    expect(service.myPeerId).toBeTruthy();
    expect(typeof service.myPeerId).toBe('string');
  });

  it('should initialize a Peer instance with correct configuration', () => {
    expect(service.myPeer).toBeTruthy();
    expect(service.myPeer instanceof Peer).toBeTrue();
    expect(service.myPeer.id).toBe(service.myPeerId);
    expect(service.myPeer.options).toEqual(
      jasmine.objectContaining({
        host: 'localhost',
        secure: true,
        port: 3001,
        path: '/'
      })
    );
  });

  it('should emit a connection event when a peer connects', (done) => {
    service.myPeer.on('connection', (connection: any) => {
      expect(connection.peer).toBe('connected-peer-id');
      done();
    });

    // Simulate a peer connection
    service.myPeer.emit('connection', { peer: 'connected-peer-id' });
  });

  it('should handle incoming data', (done) => {
    const mockConnection = {
      on: (event: string, callback: Function) => {
        if (event === 'data') {
          callback('test-data');
        }
      }
    } as any;

    service.myPeer.on('connection', (connection: any) => {
      connection.on('data', (data: any) => {
        expect(data).toBe('test-data');
        done();
      });
    });

    // Simulate data reception
    service.myPeer.emit('connection', mockConnection);
  });
});