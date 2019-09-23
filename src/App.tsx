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
    let noteRows = this.state.notes.map(note => {
      return (<NoteRow newLineHandler={this.handleNoteRowNewLine.bind(this)} focusHandler={this.noteRowFocusHandler.bind(this)} note={note} key={note.id} focused={note.id === this.state.focusedNoteId} />);
    });

    return (
      <div className="App" ref={this.wrapperElement}>
        <NoteTitle initialTitle={this.props.note.getTitle()} />
        {noteRows}
      </div>
    );
  }

  handleNoteRowNewLine(noteRow: NoteLine) {
    this.setState((props, state) => {
      let notes = this.state.notes.slice();
      let newNote = new NoteLine(new Date());
      notes.push(newNote);

      return { notes: notes, focusedNoteId: newNote.id }
    });
  }

  noteRowFocusHandler(note: NoteLine) {
    this.setState({ focusedNoteId: note.id });
  }
}




export default App;
