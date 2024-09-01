class User {
    constructor(id, username, email, password, roles = ['user'], groups = []) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.password = password;
      this.roles = roles;
      this.groups = groups;
    }
  }
  
  module.exports = User;
  