class Channel {
    constructor(id, name, groupId, members = []) {
      this.id = id;
      this.name = name;
      this.groupId = groupId;
      this.members = members;
    }
  }
  
  module.exports = Channel;
  