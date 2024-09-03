// channel.model.ts
import { User } from './user.model';

export class Channel {
  id: string;
  name: string;
  groupId: string;
  members: User[];

  constructor(
    id: string,
    name: string,
    groupId: string,
    members: User[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.groupId = groupId;
    this.members = members;
  }
}
