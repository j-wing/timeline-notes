import React from 'react';
import { Note } from './Note';

interface NoteTitleProps {
    initialTitle: string;
}

interface NoteTitleState {
    title: string
}

export class NoteTitle extends React.Component<NoteTitleProps, NoteTitleState> {
    constructor(props: NoteTitleProps) {
        super(props);

        this.state = { title: this.props.initialTitle }
    }

    render() {
        return (
            <div className="note-title">
                {this.state.title}
            </div>
        )
    }
}