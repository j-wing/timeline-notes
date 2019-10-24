import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NoteRow } from './noterow';
import { NoteLine } from './NoteLine';
import { NoteTitle } from './notetitle';
import { Note } from './Note';
import { Menu } from './menu';
import NoteContentHandler from './NoteContentHandler';


interface AppProps {
}

interface AppState {
  focusedNoteRowId: number
  note: Note
}

class App extends React.Component<AppProps, AppState> {
  wrapperElement = React.createRef<HTMLDivElement>();

  constructor(props: AppProps) {
    super(props);

    let note = NoteContentHandler.getLastEditedNote();
    let firstNoteLineId: number;

    if (note === null) {
      note = new Note();
      firstNoteLineId = note.addLine().id;
    } else {
      firstNoteLineId = note.getFirstNoteLineId();
    }

    this.state = { note: note, focusedNoteRowId: firstNoteLineId };
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
          <NoteTitle note={this.state.note} initialTitle={this.state.note.getTitle()} />
          <Menu clearNoteHandler={this.clearNote.bind(this)} />
        </div>
        {noteRows}
      </div>
    );
  }

  clearNote(e: React.MouseEvent) {

  }

  handleNoteRowKeyDown(noteRow: NoteLine, e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.setState((props, state) => {
        let newNote = this.state.note.addLine(noteRow.getIndentedUnits());

        return { note: this.state.note, focusedNoteRowId: newNote.id }
      });
      return false;
    } else if (e.key === "Backspace") {
      // Since we're catching the keydown event, if we don't call preventDefault,
      // a character will get deleted on the line that gets focus.
      e.preventDefault();

      let focusedRow = this.state.note.getLine(this.state.focusedNoteRowId);
      if (focusedRow !== undefined && focusedRow.isEmpty()) {
        let nextFocusedRowId = this.state.note.getPreviousRowId(this.state.focusedNoteRowId);
        this.state.note.deleteRow(this.state.focusedNoteRowId);

        if (nextFocusedRowId !== null) {
          this.setState({ focusedNoteRowId: nextFocusedRowId });
        } else {
          console.error("Got a null previous row id relative to: ", this.state.focusedNoteRowId);
          this.setState({ focusedNoteRowId: this.state.note.getFirstNoteLineId() });
        }

        NoteContentHandler.updateNote(this.state.note);
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
