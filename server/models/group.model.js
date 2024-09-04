class Group {
    constructor(id, name, description = '', admins = [], members = [], channels = [], interested = [], banned = []) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.admins = admins;
      this.members = members;
      this.channels = channels;
      this.interested = interested;
      this.banned = banned;
    }
  }
  
  export default Group;
  