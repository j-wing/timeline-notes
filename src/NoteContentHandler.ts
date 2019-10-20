import { Note } from './Note';
import LocalStore from "./LocalStore";

class NoteContentHandler {
    constructor() {

    }

    updateNote(note: Note) {
        LocalStore.saveNote(note);
    }

    getLastEditedNote(): Note | null {
        return LocalStore.getLastEditedNote();
    }
}

export default new NoteContentHandler();