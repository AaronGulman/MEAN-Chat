class Message {
    constructor(channelId, userId, message, timestamp){
        this.channelId = channelId;
        this.userId = userId;
        this.message = message;
        this.timestamp = timestamp;

    }
}

module.exports = Message;