export class NoteLine {
  private content: string = "";

  constructor(private editTimestamp: Date) {}

  get id(): number {
      return this.editTimestamp.getTime();
  }

  setContent(content: string) {
    this.content = content;
  }

  getTimestamp(): Date {
      return this.editTimestamp;
  }
}
