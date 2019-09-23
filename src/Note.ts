import { NoteLine } from "./NoteLine";

export class Note {
  noteLines: Array<NoteLine> = new Array();

  constructor(private title: string) {}

  getTitle(): string {
      return this.title;
  }

  setTitle(title: string) {
    this.title = title;
  }
}
