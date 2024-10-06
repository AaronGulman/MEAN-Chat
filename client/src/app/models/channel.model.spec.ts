import { Channel } from './channel.model';

describe('Channel', () => {
  it('should create an instance', () => {
    expect(new Channel("1", "Channel 1", "group1", "A channel description")).toBeTruthy();
  });

  it('should have correct properties assigned', () => {
    const channel = new Channel("1", "Channel 1", "group1", "A channel description");
    expect(channel.id).toBe("1");
    expect(channel.name).toBe("Channel 1");
    expect(channel.groupId).toBe("group1");
    expect(channel.description).toBe("A channel description");
  });
});