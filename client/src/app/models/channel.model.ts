
export class Channel {
  id: string;
  name: string;
  groupId: string;
  description: string;
  users?: string[] = [];

  constructor(
    id: string,
    name: string,
    groupId: string,
    description: string,
    users: string[] = []
  ) {
    this.description = description;
    this.id = id;
    this.name = name;
    this.groupId = groupId;
    this.users = users
  }
}
