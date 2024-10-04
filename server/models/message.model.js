class Message {
    constructor(channelId, userId, message, timestamp, uploadUrl){
        this.channelId = channelId;
        this.userId = userId;
        this.message = message;
        this.timestamp = timestamp;
        this.uploadUrl = uploadUrl || [];
    }
}

module.exports = Message;