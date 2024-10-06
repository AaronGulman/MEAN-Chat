import { Message } from './message';

describe('Message', () => {
  it('should create an instance', () => {
    expect(new Message("channel1", "user1", "Hello, World!", new Date())).toBeTruthy();
  });

  it('should have correct properties assigned', () => {
    const timestamp = new Date();
    const message = new Message(
      "channel1",
      "user1",
      "Hello, World!",
      timestamp,
      ["https://example.com/file1.png", "https://example.com/file2.png"],
      "https://example.com/avatar.png"
    );

    expect(message.channelId).toBe("channel1");
    expect(message.userId).toBe("user1");
    expect(message.message).toBe("Hello, World!");
    expect(message.timestamp).toBe(timestamp);
    expect(message.uploadUrl?.length).toBe(2);
    expect(message.uploadUrl).toEqual(["https://example.com/file1.png", "https://example.com/file2.png"]);
    expect(message.avatarPath).toBe("https://example.com/avatar.png");
  });
});