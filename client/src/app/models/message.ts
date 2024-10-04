export class Message {
    channelId: string;
    userId: string;
    message: string;
    timestamp: Date;

    constructor(
        channelId: string,
        userId: string,
        message: string,
        timestamp: Date
    ) {
        this.channelId = channelId;
        this.userId = userId;
        this.message = message;
        this.timestamp = timestamp;
    }
}