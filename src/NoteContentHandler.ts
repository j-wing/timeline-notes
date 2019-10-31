import { Note } from './Note';
import LocalStore from "./LocalStore";

class NoteContentHandler {
    updateNote(note: Note) {
        console.debug("Updating note: ", note);
        LocalStore.saveNote(note);
    }

    getLastEditedNote(): Note | null {
        return LocalStore.getLastEditedNote();
    }
}

export default new NoteContentHandler();