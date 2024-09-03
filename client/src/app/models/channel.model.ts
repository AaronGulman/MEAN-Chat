export class Channel {
  id: string;
  name: string;
  groupId: string;
  description: string;

  constructor(
    id: string,
    name: string,
    groupId: string,
    description: string,
  ) {
    this.description = description;
    this.id = id;
    this.name = name;
    this.groupId = groupId;
  }
}
