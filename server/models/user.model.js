class User {
    constructor(id, username, email, password, roles = ['user'], groups = [], interested = []) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.password = password;
      this.roles = roles;
      this.groups = groups;
      this.interested = interested;
    }
  }
  
  module.exports = User;
  