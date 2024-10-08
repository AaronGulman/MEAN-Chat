import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { ChannelService } from './channel.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Channel } from '../models/channel.model';


describe('ChannelService', () => {
  let service: ChannelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        ChannelService,
      ],
    });
    service = TestBed.inject(ChannelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all channels for a specific group', () => {
    const groupId = '1';
    const mockChannels: Channel[] = [
      { id: 'channel1', name: 'Channel 1', groupId: groupId, description: 'Description 1' },
      { id: 'channel2', name: 'Channel 2', groupId: groupId, description: 'Description 2' },
    ];

    service.getChannels(groupId).subscribe((channels: Channel[]) => {
      expect(channels.length).toBe(2);
      expect(channels).toEqual(mockChannels);
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/channels/${groupId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockChannels);
  });

  it('should create a new channel for a specific group', () => {
    const groupId = '1';
    const mockChannel: Channel = { id: 'channel1', name: 'New Channel', groupId: groupId, description: 'A new channel' };

    service.createChannel('New Channel', groupId, 'A new channel').subscribe((channel: Channel) => {
      expect(channel).toEqual(mockChannel);
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/channels/${groupId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'New Channel', groupId: groupId, description: 'A new channel' });
    req.flush(mockChannel);
  });

  it('should update an existing channel for a specific group', () => {
    const groupId = '1';
    const channelId = 'channel1';
    const updatedData: Partial<Channel> = { name: 'Updated Channel' };
    const mockChannel: Channel = { id: channelId, name: 'Updated Channel', groupId: groupId, description: 'Description 1' };

    service.updateChannel(groupId, channelId, updatedData).subscribe((channel: Channel) => {
      expect(channel).toEqual(mockChannel);
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/channels/${groupId}/${channelId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(updatedData);
    req.flush(mockChannel);
  });

  it('should delete a channel by ID for a specific group', () => {
    const groupId = '1';
    const channelId = 'channel1';

    service.deleteChannel(groupId, channelId).subscribe((response: any) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/channels/${groupId}/${channelId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should find a channel by ID for a specific group', () => {
    const groupId = '1';
    const channelId = 'channel1';
    const mockChannel: Channel = { id: channelId, name: 'Channel 1', groupId: groupId, description: 'Description 1' };

    service.getChannelById(groupId, channelId).subscribe((channel: Channel) => {
      expect(channel).toEqual(mockChannel);
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/channels/${groupId}/${channelId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockChannel);
  });
});