class Group {
    constructor(id, name, description = '', admins = [], members = [], channels = []) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.admins = admins;
      this.members = members;
      this.channels = channels;
    }
  }
  
  export default Group;
  