import { Group } from "./group.model";

export class User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  groups: Group[];
  interested: Group[];

  constructor(
    id: string,
    username: string,
    email: string,
    password: string,
    roles: string[] = ['user'],
    groups: Group[] = [],
    interested: Group[] = []
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
