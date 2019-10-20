import { NoteLine } from "./NoteLine";

export class Note {
  noteLines: Map<number, NoteLine> = new Map<number, NoteLine>();
  private title: string;
  private creationTime: Date;

  constructor() {
    this.creationTime = new Date();

    this.title = this.makeDefaultTitle();
  }

  makeDefaultTitle(): string {
    return "Interview on "+ this.creationTime.toLocaleDateString();
  }

  addLine(indentedUnits?: number): NoteLine {
    let noteLine = new NoteLine(new Date(), indentedUnits);
    this.noteLines.set(noteLine.id, noteLine);

    return noteLine;
  }

  getLines(): Array<NoteLine> {
    return Array.from(this.noteLines.values());
  }

  getTitle(): string {
      return this.title;
  }

  setTitle(title: string) {
    this.title = title;
  }
}
