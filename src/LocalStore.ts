import { Note } from "./Note";

const LAST_EDIT_KEY = 'lastEditedNote';
class LocalStore {
    constructor() {
    }

    saveNote(note: Note) {
        let id = this.getNoteStorageId(note);
        window.localStorage[id] = JSON.stringify(note.serialize());
        window.localStorage[LAST_EDIT_KEY] = id;
    }

    getLastEditedNote(): Note | null {
        let lastEditKey = window.localStorage[LAST_EDIT_KEY];
        if (lastEditKey === undefined) {
            return null;
        }

        let rawNote = window.localStorage[lastEditKey];

        if (rawNote === undefined) {
            console.error("Tried to fetch non-existent note: ", lastEditKey);
            return null;
        }

        return Note.deserialize(JSON.parse(rawNote));
    }

    getNoteStorageId(note: Note): string {
        return 'note-' + note.id;
    }
}

export default new LocalStore();