export class User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  groups: string[];
  interested: string[];

  constructor(
    id: string,
    username: string,
    email: string,
    password: string,
    roles: string[] = ['user'],
    groups: string[] = [],
    interested: string[] = []
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.groups = groups;
    this.interested = interested;
  }
}
