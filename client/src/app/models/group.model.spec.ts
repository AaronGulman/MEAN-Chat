import { Group } from './group.model';
import { User } from './user.model';
import { Channel } from './channel.model';

describe('Group', () => {
  it('should create an instance', () => {
    expect(new Group("1", "Group 1")).toBeTruthy();
  });

  it('should have correct properties assigned', () => {
    const admin = new User("1", "adminUser", "admin@example.com", "password");
    const member = new User("2", "memberUser", "member@example.com", "password");
    const channel = new Channel("1", "Channel 1", "group1", "Channel description");
    const group = new Group(
      "1",
      "Group 1",
      "A group description",
      [admin],
      [member],
      [channel],
      [member],
      []
    );

    expect(group.id).toBe("1");
    expect(group.name).toBe("Group 1");
    expect(group.description).toBe("A group description");
    expect(group.admins.length).toBe(1);
    expect(group.admins[0]).toEqual(admin);
    expect(group.members.length).toBe(1);
    expect(group.members[0]).toEqual(member);
    expect(group.channels.length).toBe(1);
    expect(group.channels[0]).toEqual(channel);
    expect(group.interested.length).toBe(1);
    expect(group.interested[0]).toEqual(member);
    expect(group.banned.length).toBe(0);
  });
});