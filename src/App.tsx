import React from 'react';
import './App.css';
import { Timestamp } from './timestamp';
import { NoteRow } from './noterow';
import { NoteLine } from './NoteLine';
import { NoteTitle } from './notetitle';
import { Note } from './Note';


interface AppProps {
  note: Note;
}
interface AppState {
  notes: Array<NoteLine>
  focusedNoteId: number
}

class App extends React.Component<AppProps, AppState> {
  wrapperElement = React.createRef<HTMLDivElement>();

  constructor(props: AppProps) {
    super(props);

    let firstNote = new NoteLine(new Date());
    this.state = { notes: [firstNote], focusedNoteId: firstNote.id };
  }

  render() {
    let noteRows = this.state.notes.map(noteRow => {
      return (<NoteRow keyDownHandler={this.handleNoteRowKeyDown.bind(this)}
        focusHandler={this.noteRowFocusHandler.bind(this)}
        noteRow={noteRow}
        key={noteRow.id}
        focused={noteRow.id === this.state.focusedNoteId} />);
    });

    return (
      <div className="App" ref={this.wrapperElement}>
        <NoteTitle initialTitle={this.props.note.getTitle()} />
        {noteRows}
      </div>
    );
  }

  handleNoteRowKeyDown(noteRow: NoteLine, e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.setState((props, state) => {
        let notes = this.state.notes.slice();
        let newNote = new NoteLine(new Date(), noteRow.getIndentedUnits());
        notes.push(newNote);

        return { notes: notes, focusedNoteId: newNote.id }
      });
      return false;
    } else {
      return true;
    }
  }

  noteRowFocusHandler(note: NoteLine) {
    this.setState({ focusedNoteId: note.id });
  }
}




export default App;
