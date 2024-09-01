// user.model.ts
import { Group } from "./group.model";
export class User {
    id: string;
    username: string;
    email: string;
    password?: string;
    roles: string[];
    groups: Group[];
  
    constructor(
      id: string,
      username: string,
      email: string,
      roles: string[] = ['user'],
      groups: Group[] = []
    ) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.roles = roles;
      this.groups = groups;
    }
  }
  