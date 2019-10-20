import { RawNoteLine, NoteLine } from "./NoteLine";

import NoteContentHandler from "./NoteContentHandler";

export interface RawNote {
  id: number,
  title: string,
  noteLines: Array<RawNoteLine>
}

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

  get id(): number {
    return this.creationTime.getTime();
  }

  addLine(indentedUnits?: number): NoteLine {
    let noteLine = new NoteLine(new Date(), this, indentedUnits);
    this.noteLines.set(noteLine.id, noteLine);

    return noteLine;
  }

  getLines(): Array<NoteLine> {
    return Array.from(this.noteLines.values());
  }

  getLine(id: number): NoteLine | undefined {
    return this.noteLines.get(id);
  }

  getFirstNoteLineId(): number {
    return Math.min(...Array.from(this.noteLines.keys()));
  }

  getTitle(): string {
      return this.title;
  }

  setTitle(title: string) {
    this.title = title;
  }

  private setNoteLines(noteLines: Map<number, NoteLine>) {
    this.noteLines = noteLines;
  }

  serialize(): RawNote {
    return {
      title: this.title,
      id: this.id,
      noteLines: Array.from(this.noteLines.values()).map(noteLine => noteLine.serialize())
    }
  }

  static deserialize(rawNote: RawNote): Note {
    let note = new Note();
    note.setTitle(rawNote.title);

    let parsedNoteLines = rawNote.noteLines.map(rawNoteLine => NoteLine.deserialize(note, rawNoteLine));
    let noteLineMap = new Map<number, NoteLine>();
    parsedNoteLines.forEach(noteLine => noteLineMap.set(noteLine.id, noteLine));
    note.setNoteLines(noteLineMap);
    return note;
  }
}
