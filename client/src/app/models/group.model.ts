// group.model.ts
import { Channel } from './channel.model';
import { User } from './user.model';

export class Group {
  id: string;
  name: string;
  description?: string;
  admins: User[];
  members: User[];
  channels: Channel[];
  interested: User[];

  constructor(
    id: string,
    name: string,
    description: string = "",
    admins: User[] = [],
    members: User[] = [],
    channels: Channel[] = [],
    interested: User[] = []
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.admins = admins;
    this.members = members;
    this.channels = channels;
    this.interested = interested;
  }
}
