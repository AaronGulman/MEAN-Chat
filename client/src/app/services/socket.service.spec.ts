import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { UploadService } from './upload.service';
import { of } from 'rxjs';
import { Message } from '../models/message';
import { User } from '../models/user.model';


describe('SocketService', () => {
  let service: SocketService;
  let uploadServiceSpy: jasmine.SpyObj<UploadService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UploadService', ['upload']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: UploadService, useValue: spy },
      ],
    });
    service = TestBed.inject(SocketService);
    uploadServiceSpy = TestBed.inject(UploadService) as jasmine.SpyObj<UploadService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize socket connection', () => {
    service.initSocket();
    expect(service.socket).toBeTruthy();
  });

  it('should join a channel and send join message', () => {
    const user: User = new User(
      '1',
      'testUser',
      'testUser@example.com',
      'password',
      ['user'],
      [],
      [],
      'path/to/avatar'
    );
    const channelId = 'testChannel';
    spyOn(service, 'sendMessage');

    service.joinChannel(channelId, user);

    expect(service.sendMessage).toHaveBeenCalledWith(
      jasmine.objectContaining({
        channelId: channelId,
        userId: user.username,
        message: `${user.username} has joined the room!`
      }),
      user
    );
  });

  it('should leave a channel and send leave message', () => {
    const user: User = new User(
      '1',
      'testUser',
      'testUser@example.com',
      'password',
      ['user'],
      [],
      [],
      'path/to/avatar'
    );
    const channelId = 'testChannel';
  
    service.initSocket();
    spyOn(service.socket, 'emit');
  
    spyOn(service, 'sendMessage');
    spyOn(service, 'leaveChannel').and.callThrough();
  
    service.leaveChannel(channelId, user);
  
    expect(service.leaveChannel).toHaveBeenCalledWith(channelId, user);
  
    expect(service.sendMessage).toHaveBeenCalledWith(
      jasmine.objectContaining({
        channelId: channelId,
        userId: user.username,
        message: `${user.username} has left the room!`
      }),
      user
    );
  
    expect(service.socket.emit).toHaveBeenCalledWith('leaveChannel', { channelId });
  });

  it('should send a message to a channel', () => {
    const user: User = new User(
      '1',
      'testUser',
      'testUser@example.com',
      'password',
      ['user'],
      [],
      [],
      'path/to/avatar'
    );
    const message: Message = {
      channelId: 'testChannel',
      userId: user.username,
      message: 'Hello World',
      timestamp: new Date(),
      uploadUrl: [],
      avatarPath: user.avatarPath
    };
    spyOn(service, 'initSocket').and.callThrough();
    spyOn(service, 'joinChannel').and.callThrough();

    service.sendMessage(message, user);

    expect(service.initSocket).toHaveBeenCalled();
    expect(service.joinChannel).toHaveBeenCalledWith(message.channelId, user);
  });

  it('should receive messages from the server', (done) => {
    const mockMessage: Message = {
      channelId: 'testChannel',
      userId: 'testUser',
      message: 'Hello',
      timestamp: new Date(),
      uploadUrl: [],
      avatarPath: 'path/to/avatar'
    };

    service.initSocket();
    spyOn(service.socket, 'on').and.callFake((event: string, callback: (data: Message) => void) => {
      if (event === 'receiveMessage') {
        callback(mockMessage);
      }
    });

    service.getMessage().subscribe((message) => {
      expect(message).toEqual(mockMessage);
      done();
    });
  });

  it('should emit peerID', () => {
    service.initSocket();
    spyOn(service.socket, 'emit');
    const peerID = 'testPeerID';

    service.peerID(peerID);

    expect(service.socket.emit).toHaveBeenCalledWith('peerID', peerID);
  });

  it('should receive peerID from server', (done) => {
    const mockPeerID = 'testPeerID';

    service.initSocket();
    spyOn(service.socket, 'on').and.callFake((event: string, callback: (data: string) => void) => {
      if (event === 'peerID') {
        callback(mockPeerID);
      }
    });

    service.getPeerID().subscribe((peerID) => {
      expect(peerID).toBe(mockPeerID);
      done();
    });
  });
});