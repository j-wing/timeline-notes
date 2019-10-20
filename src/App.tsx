import React from 'react';
import './App.css';
import { NoteRow } from './noterow';
import { NoteLine } from './NoteLine';
import { NoteTitle } from './notetitle';
import { Note } from './Note';


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

    let note = new Note();
    let firstNoteLine = note.addLine();
    this.state = { note: note, focusedNoteRowId: firstNoteLine.id };
  }

  render() {
    let noteRows = this.state.note.getLines().map(noteRow => {
      return (<NoteRow keyDownHandler={this.handleNoteRowKeyDown.bind(this)}
        focusHandler={this.noteRowFocusHandler.bind(this)}
        noteRow={noteRow}
        key={noteRow.id}
        focused={noteRow.id === this.state.focusedNoteRowId} />);
    });

    return (
      <div className="App" ref={this.wrapperElement}>
        <NoteTitle initialTitle={this.state.note.getTitle()} />
        {noteRows}
      </div>
    );
  }

  handleNoteRowKeyDown(noteRow: NoteLine, e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.setState((props, state) => {
        let newNote = this.state.note.addLine(noteRow.getIndentedUnits());

        return { note: this.state.note, focusedNoteRowId: newNote.id }
      });
      return false;
    } else {
      return true;
    }
  }

  noteRowFocusHandler(note: NoteLine) {
    this.setState({ focusedNoteRowId: note.id });
  }
}




export default App;
