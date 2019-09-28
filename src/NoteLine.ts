export class NoteLine {
  private content: string = "";
  private indentedUnits: number = 0;

  constructor(private editTimestamp: Date, indentedUnits?: number) {
    this.indentedUnits = indentedUnits || 0;
  }

  get id(): number {
    return this.editTimestamp.getTime();
  }

  getContent(): string {
    return this.content;
  }

  setContent(content: string) {
    this.content = content;
  }

  getTimestamp(): Date {
    return this.editTimestamp;
  }

  getIndentedUnits(): number {
    return this.indentedUnits;
  }

  setIndentedUnits(i: number) {
    this.indentedUnits = i;
  }
}
