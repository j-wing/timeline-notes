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

import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NoteRow } from './noterow';
import { NoteLine } from './NoteLine';
import { NoteTitle } from './notetitle';
import { NoteRowMirror } from './noterowmirror';
import { Note } from './Note';
import { Menu } from './menu';
import NoteContentHandler from './NoteContentHandler';
import DriveSyncHandler, { DriveSignInState } from './DriveSyncHandler';
import StatusArea from './statusarea';


declare var gapi: any

const SYNC_TIMEOUT = 2000;

interface AppProps {
}

interface AppState {
  focusedNoteRowId: number;
  note: Note;
  currentRowCursorText: string;
}

class App extends React.Component<AppProps, AppState> {
  wrapperElement = React.createRef<HTMLDivElement>();
  mirrorRef = React.createRef<NoteRowMirror>();

  private editedSinceLastDriveSync = false;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(props: AppProps) {
    super(props);
    DriveSyncHandler.init();

    let note = NoteContentHandler.getLastEditedNote();
    let firstNoteLineId: number;

    if (note === null) {
      note = this.createNewNote();
      firstNoteLineId = note.getFirstNoteLineId();
    } else {
      firstNoteLineId = note.getFirstNoteLineId();
    }
    this.state = { note: note, focusedNoteRowId: firstNoteLineId, currentRowCursorText: ""}
  }

  createNewNote(): Note {
      let note = new Note();
      note.addLine();

      return note;
  }

  componentDidMount() {
    this.updateWindowTitle();
    DriveSyncHandler.addSignInStateHandler((state: DriveSignInState) => {
      if (state !== DriveSignInState.SIGNED_IN) {
        if (this.syncTimer !== null) {
          clearTimeout(this.syncTimer);
          this.syncTimer = null;
        }
        return;
      }

      DriveSyncHandler.saveNote(this.state.note).then(noteId => {
        let note = this.state.note;
        if (noteId.length > 0) {
          note.setDriveId(noteId);
          this.setState({ note: note });
        }

        setTimeout(this.syncTimerHandler.bind(this), SYNC_TIMEOUT);
      });
    });
  }

  componentDidUpdate(oldProps: AppProps, oldState: AppState) {
    if (oldState.note.getTitle() !== this.state.note.getTitle()) {
      this.updateWindowTitle();      
    }

  }

  async syncTimerHandler() {
    if (this.editedSinceLastDriveSync) {
      let id = await DriveSyncHandler.saveNote(this.state.note);
      if (id.length > 0) {
        let note = this.state.note;
        note.setDriveId(id);
        this.setState({ note: note })
      }
      this.editedSinceLastDriveSync = false;
    }

    this.syncTimer = setTimeout(this.syncTimerHandler.bind(this), SYNC_TIMEOUT);
  }

  render() {
    let noteRows = this.state.note.getLines().map(noteRow => {
      return (<NoteRow keyDownHandler={this.handleNoteRowKeyDown.bind(this)}
        keyUpHandler={this.handleNoteRowKeyUp.bind(this)}
        focusHandler={this.noteRowFocusHandler.bind(this)}
        clickHandler={this.handleNoteRowClick.bind(this)}
        note={this.state.note}
        rowId={noteRow.id}
        key={noteRow.id}
        focused={noteRow.id === this.state.focusedNoteRowId} />);
    });

    return (
      <div className="App" ref={this.wrapperElement}>
        <div className="header">
          <NoteTitle title={this.state.note.getTitle()} titleChangeHandler={this.handleTitleChange.bind(this)} />
          <StatusArea noteDriveId={this.state.note.getDriveId()}
                      timestampsLocked={this.state.note.getTimestampsLocked()} />
          <Menu timestampsLocked={this.state.note.getTimestampsLocked()} 
            newNoteHandler={this.newNoteHandler.bind(this)}
            timestampLockToggleHandler={this.handleToggleTimestampsLocked.bind(this)}
            signOutHandler={this.signOutHandler.bind(this)}
            signInHandler={this.signInHandler.bind(this)} />
        </div>
        {noteRows}
        <NoteRowMirror
          value={this.state.currentRowCursorText}
          ref={this.mirrorRef} />
      </div>
    );
  }

  signInHandler() {
    gapi.auth2.getAuthInstance().signIn();
  }

  signOutHandler() {
    gapi.auth2.getAuthInstance().signOut();
  }

  handleTitleChange(newTitle: string) {
    this.state.note.setTitle(newTitle);
    this.setState({ note: this.state.note });
    NoteContentHandler.updateNote(this.state.note);
  }

  updateWindowTitle() {
    document.title = this.state.note.getTitle() + " - Interview Notes";
  }

  handleToggleTimestampsLocked() {
    let note = this.state.note;

    note.setTimestampsLocked(!note.getTimestampsLocked());
    this.setState({ note: note });
  }

  newNoteHandler() {
    let note = this.createNewNote();
    // Set this to true so that a sync happens immediately.
    this.editedSinceLastDriveSync = true;
    this.setState({ note: note, focusedNoteRowId: note.getFirstNoteLineId() });
  }

  handleNoteRowClick(n: NoteRow) {
    this.setState({ currentRowCursorText: (n.getTextUntilCursor() || "")});
  }

  handleNoteRowKeyDown(noteRow: NoteRow, e: React.KeyboardEvent): boolean {
    this.editedSinceLastDriveSync = true;

    let noteLine = noteRow.getNoteLine();

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      let note = this.state.note;
      let newNote: NoteLine | null;

      if (e.ctrlKey) {
        newNote = note.addLine(noteLine.getIndentedUnits());
      } else {
        newNote = note.addLineAfter(this.state.focusedNoteRowId, noteLine.getIndentedUnits());
      }

      if (newNote === null) {
        return false;
      }

      this.setState({ note: note, focusedNoteRowId: newNote.id });
      return false;
    } else if (e.key === "Backspace") {
      let focusedRow = this.state.note.getLine(this.state.focusedNoteRowId);
      if (focusedRow !== undefined && focusedRow.isEmpty() && this.state.note.getLines().length > 1) {
        let nextFocusedRowId = this.state.note.getPreviousRowId(this.state.focusedNoteRowId);
        this.state.note.deleteRow(this.state.focusedNoteRowId);

        if (nextFocusedRowId !== null) {
          if (nextFocusedRowId === this.state.focusedNoteRowId) {
            // This means the first line had focus, so the new first line
            // should now have focus.
            nextFocusedRowId = this.state.note.getFirstNoteLineId();
          }

          this.setState({ focusedNoteRowId: nextFocusedRowId });
        } else {
          console.error("Got a null previous row id relative to: ", this.state.focusedNoteRowId);
          this.setState({ focusedNoteRowId: this.state.note.getFirstNoteLineId() });
        }

        NoteContentHandler.updateNote(this.state.note);

        // Since we're catching the keydown event, if we don't call preventDefault,
        // a character will get deleted on the line that gets focus.
        e.preventDefault();

      }
    } else if (e.key === "s" && e.ctrlKey) {
      // Override Ctrl+S to force a save. This really shouldn't do anything in practice,
      // since the timer should be running, but it makes it safe for users who have
      // Ctrl+S muscle memory to use it.
      DriveSyncHandler.saveNote(this.state.note);
      e.preventDefault();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      let currentRow: number | null = null;
      if (this.mirrorRef.current !== null) {
        currentRow = this.mirrorRef.current.getCurrentRow();
      }

      if (currentRow === null) {
        return true;
      }
      
      let nextFocusedRowId: (number | null) = null;

      if (e.key === "ArrowUp" && currentRow === 0) {
        nextFocusedRowId = this.state.note.getPreviousRowId(this.state.focusedNoteRowId);
      } else if (e.key === "ArrowDown" && currentRow === noteRow.getNumRows()) {
        nextFocusedRowId = this.state.note.getNextRowId(this.state.focusedNoteRowId);
      }

      if (nextFocusedRowId !== null) {
        this.setState({ focusedNoteRowId: nextFocusedRowId });
      }
    }

    return true;
  }

  handleNoteRowKeyUp(noteRow: NoteRow) {
    this.setState({ currentRowCursorText: (noteRow.getTextUntilCursor() || "")});
  }

  noteRowFocusHandler(note: NoteLine) {
    this.setState({ focusedNoteRowId: note.id });
  }
}

export default App;
