import { RawNoteLine, NoteLine } from "./NoteLine";

import NoteContentHandler from "./NoteContentHandler";

export interface RawNote {
  id: number,
  title: string,
  noteLines: Array<RawNoteLine>
  finished: boolean;
  driveId: string;
}

export class Note {
  noteLines: Map<number, NoteLine> = new Map<number, NoteLine>();
  // Since new lines can be inserted anywhere in the note, we need
  // a separate array keeping track of the visual ordering of the rows
  // in the note relative to each other.
  noteLineIdsOrdered: Array<number> = [];
  private title: string;
  private creationTime: Date;
  private finished: boolean = false;
  private driveId: string = "";

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
    this.noteLineIdsOrdered.push(noteLine.id);

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

  getFinished(): boolean {
    return this.finished;
  }

  setFinished(finished: boolean) {
    this.finished = finished;
  }

  getDriveId(): string {
    return this.driveId || "";
  }

  setDriveId(driveId: string) {
    this.driveId = driveId;
  }

  convertToText(): string {

    let output = "";
    this.noteLines.forEach(line => {
      output += line.convertToText() + "\n";
    });

    return output;
  }

  getPreviousRowId(id: number): number | null {
    let lineIndex = this.noteLineIdsOrdered.indexOf(id);

    if (lineIndex === -1) {
      return null;
    }

    return this.noteLineIdsOrdered[Math.max(0, lineIndex - 1)];
  }

  deleteRow(id: number) {
    this.noteLines.delete(id);
    let idIndex = this.noteLineIdsOrdered.indexOf(id);

    if (idIndex !== -1) {
      this.noteLineIdsOrdered.splice(idIndex);
    } else {
      console.error("Tried to delete non-existent row with ID: ", id, this);
    }
  }

  private setNoteLines(orderedNoteLineIds: Array<number>, noteLines: Map<number, NoteLine>) {
    this.noteLineIdsOrdered = orderedNoteLineIds;
    this.noteLines = noteLines;
  }

  serialize(): RawNote {
    return {
      title: this.title,
      id: this.id,
      finished: this.finished,
      driveId: this.driveId,
      noteLines: this.noteLineIdsOrdered.map(noteLineId => {
        let noteLine = this.noteLines.get(noteLineId);
        
        if (noteLine === undefined) {
          console.error("Note: ", this);
          throw "Got undefined note line during serialization.";
        }

        return noteLine.serialize();
      })
    }
  }

  static deserialize(rawNote: RawNote): Note {
    let note = new Note();
    note.setTitle(rawNote.title);
    note.setFinished(rawNote.finished);
    note.setDriveId(rawNote.driveId);

    let parsedNoteLines = rawNote.noteLines.map(rawNoteLine => NoteLine.deserialize(note, rawNoteLine));
    let noteLineMap = new Map<number, NoteLine>();
    parsedNoteLines.forEach(noteLine => noteLineMap.set(noteLine.id, noteLine));
    note.setNoteLines(rawNote.noteLines.map(rawNoteLine => rawNoteLine.id), noteLineMap);
    return note;
  }
}
