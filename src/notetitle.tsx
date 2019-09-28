import React from 'react';
import { Note } from './Note';

interface NoteTitleProps {
    initialTitle: string;
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
            onKeyDown={this.handleKeyDown.bind(this)}>
                {this.state.title}
            </div>
        )
    }

    handleClick(e: React.MouseEvent) {
        this.setState({ editing: true });
    }

    handleKeyDown(e: React.KeyboardEvent) {
        if (e.key=== 'Enter' && this.divRef.current !== null) {
            e.preventDefault();
            this.setState({ title: this.divRef.current.textContent || "", editing: false})
        }
    }
}