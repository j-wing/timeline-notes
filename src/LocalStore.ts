/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Note } from "./Note";

const LAST_EDIT_KEY = 'lastEditedNote';
const STORAGE_VERSION = '1.0';

interface StoredNote {
    version: string,
    note: Note,
}

class LocalStore {
    saveNote(note: Note) {
        let id = this.getNoteStorageId(note);
        window.localStorage[id] = JSON.stringify({
            version: STORAGE_VERSION,
            note: note.serialize()
        });
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

        let parsed = JSON.parse(rawNote);

        let note: Note;
        if (!parsed.version) {
            note = Note.deserialize(parsed);
            // Update any notes that don't have a version to include one.
            this.saveNote(note);
        } else {
            note = Note.deserialize(parsed.note);
        }

        return note;
    }

    getNoteStorageId(note: Note): string {
        return 'note-' + note.id;
    }
}

export default new LocalStore();
