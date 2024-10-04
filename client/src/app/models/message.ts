export class Message {
    channelId: string;
    userId: string;
    message: string;
    timestamp: Date;
    uploadUrl?: string[];
    avatarPath: string;

    constructor(
        channelId: string,
        userId: string,
        message: string,
        timestamp: Date,
        uploadUrl?: string[],
        avatarPath?: string,
    ) {
        this.channelId = channelId;
        this.userId = userId;
        this.message = message;
        this.timestamp = timestamp;
        this.uploadUrl = uploadUrl;
        this.avatarPath = avatarPath || "";
    }
}