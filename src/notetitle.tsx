import React from 'react';
import { Note } from './Note';
import NoteContentHandler from './NoteContentHandler';

interface NoteTitleProps {
    initialTitle: string
    note: Note
}

interface NoteTitleState {
    title: string
    editing: boolean;
}

export class NoteTitle extends React.Component<NoteTitleProps, NoteTitleState> {
    divRef = React.createRef<HTMLDivElement>();

    constructor(props: NoteTitleProps) {
        super(props);

        this.state = { title: this.props.initialTitle, editing: false }
    }

    render() {
        return (
            <div className="note-title"
            ref={this.divRef}
            onClick={this.handleClick.bind(this)}
            contentEditable={true}
            onKeyDown={this.handleKeyDown.bind(this)}
            onBlur={this.handleBlur.bind(this)}
            suppressContentEditableWarning={true}>
                {this.state.title}
            </div>
        )
    }

    componentDidUpdate(prevProps: NoteTitleProps, prevState: NoteTitleState) {
        if (prevState.title !== this.state.title) {
            this.props.note.setTitle(this.state.title);
            NoteContentHandler.updateNote(this.props.note);
        }
    }

    handleClick(e: React.MouseEvent) {
        this.setState({ editing: true });
    }

    handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && this.divRef.current !== null) {
            e.preventDefault();
            this.setState({ title: this.divRef.current.textContent || "", editing: false})
            this.divRef.current.blur();
        }
    }

    handleBlur(e: React.FocusEvent) {
        if (this.divRef.current !== null) {
            this.divRef.current.textContent = this.state.title;
        }
    }
}