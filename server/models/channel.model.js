class Channel {
    constructor(id, name, groupId, members = [], isPrivate = false) {
      this.id = id;
      this.name = name;
      this.groupId = groupId;
      this.members = members;
      this.isPrivate = isPrivate;
    }
  }
  
  module.exports = Channel;
  