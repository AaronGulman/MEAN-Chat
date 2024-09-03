export class Channel {
  id: string;
  name: string;
  groupId: string;
  members: string[];

  constructor(
    id: string,
    name: string,
    groupId: string,
    members: string[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.groupId = groupId;
    this.members = members;
  }
}
