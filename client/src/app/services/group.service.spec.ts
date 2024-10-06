import { TestBed } from '@angular/core/testing';
import { GroupService } from './group.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';


describe('GroupService', () => {
  let service: GroupService;
  let httpMock: HttpTestingController;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['getUserById']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        GroupService,
        { provide: UserService, useValue: spy },
      ],
    });
    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all groups', () => {
    const mockGroups: Group[] = [
      { id: '1', name: 'Group 1', description: 'Description 1', admins: [], members: [], channels: [], interested: [], banned: [] },
      { id: '2', name: 'Group 2', description: 'Description 2', admins: [], members: [], channels: [], interested: [], banned: [] },
    ];

    service.getGroups().subscribe((groups) => {
      expect(groups.length).toBe(2);
      expect(groups).toEqual(mockGroups);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/groups');
    expect(req.request.method).toBe('GET');
    req.flush(mockGroups);
  });

  it('should retrieve a group by ID', () => {
    const mockGroup: Group = { id: '1', name: 'Group 1', description: 'Description 1', admins: [], members: [], channels: [], interested: [], banned: [] };

    service.getGroupById('1').subscribe((group) => {
      expect(group).toEqual(mockGroup);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/groups/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockGroup);
  });

  it('should create a new group', () => {
    const user: User = new User('1', 'testUser', 'testUser@example.com', 'password');
    const mockGroup: Group = { id: '1', name: 'New Group', description: 'A new group', admins: [user], members: [], channels: [], interested: [], banned: [] };

    service.createGroup('New Group', 'A new group', user).subscribe((group) => {
      expect(group).toEqual(mockGroup);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/groups');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'New Group', description: 'A new group', admin: user });
    req.flush(mockGroup);
  });

  it('should update a group by ID', () => {
    const updatedData: Partial<Group> = { name: 'Updated Group' };
    const mockGroup: Group = { id: '1', name: 'Updated Group', description: 'Description 1', admins: [], members: [], channels: [], interested: [], banned: [] };

    service.updateGroup('1', updatedData).subscribe((group) => {
      expect(group).toEqual(mockGroup);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/groups/1/update');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(updatedData);
    req.flush(mockGroup);
  });

  it('should delete a group by ID', () => {
    service.deleteGroup('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('https://localhost:3000/api/groups/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should add a channel to a group', () => {
    const mockChannel: Channel = { id: 'channel1', name: 'Channel 1', groupId: '1', description: 'Channel description' };
    const mockGroup: Group = { id: '1', name: 'Group 1', description: 'Description 1', admins: [], members: [], channels: [mockChannel], interested: [], banned: [] };

    service.addChannelToGroup('1', 'channel1').subscribe((group) => {
      expect(group).toEqual(mockGroup);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/groups/1/channels');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ channelId: 'channel1' });
    req.flush(mockGroup);
  });

  it('should remove a channel from a group', () => {
    const mockGroup: Group = { id: '1', name: 'Group 1', description: 'Description 1', admins: [], members: [], channels: [], interested: [], banned: [] };

    service.removeChannelFromGroup('1', 'channel1').subscribe((group) => {
      expect(group).toEqual(mockGroup);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/groups/1/channels/channel1');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockGroup);
  });

  it('should add a user to a group', () => {
    const user: User = new User('user1', 'testUser', 'testUser@example.com', 'password');
    const mockGroup: Group = { id: '1', name: 'Group 1', description: 'Description 1', admins: [], members: [user], channels: [], interested: [], banned: [] };

    service.addUserToGroup('1', 'user1').subscribe((group) => {
      expect(group).toEqual(mockGroup);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/groups/1/users/user1');
    expect(req.request.method).toBe('POST');
    req.flush(mockGroup);
  });

  it('should remove a user from a group', () => {
    const mockGroup: Group = { id: '1', name: 'Group 1', description: 'Description 1', admins: [], members: [], channels: [], interested: [], banned: [] };

    service.removeUserFromGroup('1', 'user1').subscribe((group) => {
      expect(group).toEqual(mockGroup);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/groups/1/users/user1');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockGroup);
  });
});