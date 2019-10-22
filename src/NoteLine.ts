import NoteContentHandler from "./NoteContentHandler";
import { Note } from "./Note";

export interface RawNoteLine {
  content: string,
  indentedUnits: number,
  id: number,
  editTimestamp: number;
}

export class NoteLine {
  private content: string = "";
  private indentedUnits: number = 0;
  private creationTimestamp: Date;

  constructor(private editTimestamp: Date, private note: Note, indentedUnits?: number) {
    this.creationTimestamp = new Date();
    this.indentedUnits = indentedUnits || 0;
  }

  private setCreationTimestamp(timestamp: Date) {
    this.creationTimestamp = timestamp;
  }

  get id(): number {
    return this.creationTimestamp.getTime();
  }

  getContent(): string {
    return this.content;
  }

  setContent(content: string, updateLastEditTime?: boolean) {
    this.content = content;

    if (updateLastEditTime) {
      this.setEditTimestamp(new Date());
    }
  }

  getLastEditTimestamp(): Date {
    return this.editTimestamp;
  }

  setEditTimestamp(timestamp: Date) {
    this.editTimestamp = timestamp;
  }

  getIndentedUnits(): number {
    return this.indentedUnits;
  }

  setIndentedUnits(i: number) {
    this.indentedUnits = i;
  }

  isEmpty(): boolean {
    return (this.content.trim().length === 0);
  }

  serialize(): RawNoteLine {
    return {
      id: this.id,
      content: this.content,
      indentedUnits: this.indentedUnits,
      editTimestamp: this.editTimestamp.getTime()
    }
  }

  static deserialize(note: Note, rawNoteLine: RawNoteLine): NoteLine {
    let noteLine = new NoteLine(new Date(rawNoteLine.editTimestamp), note, rawNoteLine.indentedUnits);

    noteLine.setContent(rawNoteLine.content)
    noteLine.setCreationTimestamp(new Date(rawNoteLine.id));
    return noteLine;
  }
}
