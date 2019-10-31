import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NoteRow } from './noterow';
import { NoteLine } from './NoteLine';
import { NoteTitle } from './notetitle';
import { Note } from './Note';
import { Menu } from './menu';
import NoteContentHandler from './NoteContentHandler';
import DriveSyncHandler, { DriveSignInState } from './DriveSyncHandler';


declare var gapi: any

const SYNC_TIMEOUT = 2000;

interface AppProps {
}

interface AppState {
  focusedNoteRowId: number
  note: Note
}

interface ViewInDocsLinkProps {
  noteDriveId: string;
}

interface ViewInDocsLinkState {
}

class ViewInDocsLink extends React.Component<ViewInDocsLinkProps, ViewInDocsLinkState> {
  render() {
    return (
      <div className="view-in-docs-link" >
        {this.props.noteDriveId.length > 0 && 
            <a href={"https://docs.google.com/document/d/" + this.props.noteDriveId + "/edit"}
          target="_blank">
            View Note in Docs
          </a>}
      </div>
    )
  }
}

class App extends React.Component<AppProps, AppState> {
  wrapperElement = React.createRef<HTMLDivElement>();

  // Initialize to true so that we do a sync on load.
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
    this.state = { note: note, focusedNoteRowId: firstNoteLineId };
  }

  createNewNote(): Note {
      let note = new Note();
      note.addLine();

      return note;
  }

  componentDidMount() {
    DriveSyncHandler.addSignInStateHandler((state: DriveSignInState) => {
      if (state !== DriveSignInState.SIGNED_IN) {
        if (this.syncTimer !== null) {
          clearTimeout(this.syncTimer);
          this.syncTimer = null;
        }
        return;
      }

      DriveSyncHandler.saveNote(this.state.note);
      this.syncTimer = setInterval(async () => {
        if (this.editedSinceLastDriveSync) {
          let id = await DriveSyncHandler.saveNote(this.state.note);
          let note = this.state.note;
          note.setDriveId(id);
          this.editedSinceLastDriveSync = false;

          this.setState({ note: note})
        }
      }, SYNC_TIMEOUT);
    });
  }

  render() {
    let noteRows = this.state.note.getLines().map(noteRow => {
      return (<NoteRow keyDownHandler={this.handleNoteRowKeyDown.bind(this)}
        focusHandler={this.noteRowFocusHandler.bind(this)}
        note={this.state.note}
        rowId={noteRow.id}
        key={noteRow.id}
        focused={noteRow.id === this.state.focusedNoteRowId} />);
    });

    return (
      <div className="App" ref={this.wrapperElement}>
        <div className="header">
          <NoteTitle title={this.state.note.getTitle()} titleChangeHandler={this.handleTitleChange.bind(this)} />
          <ViewInDocsLink noteDriveId={this.state.note.getDriveId()} />
          <Menu noteFinished={this.state.note.getFinished()} 
            newNoteHandler={this.newNoteHandler.bind(this)}
            finishToggleHandler={this.handleToggleFinished.bind(this)}
            signOutHandler={this.signOutHandler.bind(this)}
            signInHandler={this.signInHandler.bind(this)} />
        </div>
        {noteRows}
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

  handleToggleFinished() {
    let note = this.state.note;

    note.setFinished(!note.getFinished());
    this.setState({ note: note });
  }

  newNoteHandler() {
    let note = this.createNewNote();
    this.setState({ note: note, focusedNoteRowId: note.getFirstNoteLineId() });
  }

  handleNoteRowKeyDown(noteRow: NoteLine, e: React.KeyboardEvent) {
    this.editedSinceLastDriveSync = true;

    if (e.key === "Enter") {
      e.preventDefault();
      this.setState((props, state) => {
        let note = this.state.note;
        let newNote = note.addLine(noteRow.getIndentedUnits());

        return { note: note, focusedNoteRowId: newNote.id }
      });
      return false;
    } else if (e.key === "Backspace") {
      let focusedRow = this.state.note.getLine(this.state.focusedNoteRowId);
      if (focusedRow !== undefined && focusedRow.isEmpty() && this.state.note.getLines().length > 1) {
        let nextFocusedRowId = this.state.note.getPreviousRowId(this.state.focusedNoteRowId);
        this.state.note.deleteRow(this.state.focusedNoteRowId);

        if (nextFocusedRowId !== null) {
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
    } else {
      return true;
    }

  }

  noteRowFocusHandler(note: NoteLine) {
    this.setState({ focusedNoteRowId: note.id });
  }
}

export default App;
