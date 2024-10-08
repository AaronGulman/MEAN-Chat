class Channel {
    constructor(id, name, groupId, description, users = []) {
      this.id = id;
      this.name = name;
      this.groupId = groupId;
      this.description = description;
      this.users = users
    }
  }
  
  module.exports = Channel;
  