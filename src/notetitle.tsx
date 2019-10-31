import React from 'react';

interface NoteTitleProps {
    title: string;
    titleChangeHandler: (newTitle: string) => any;
}

interface NoteTitleState {
    editing: boolean;
}

export class NoteTitle extends React.Component<NoteTitleProps, NoteTitleState> {
    divRef = React.createRef<HTMLDivElement>();

    constructor(props: NoteTitleProps) {
        super(props);

        this.state = { editing: false }
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
                {this.props.title}
            </div>
        )
    }

    handleClick(e: React.MouseEvent) {
        this.setState({ editing: true });
    }

    handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && this.divRef.current !== null) {
            e.preventDefault();
            this.props.titleChangeHandler(this.divRef.current.textContent || "");
            this.setState({ editing: false})
            this.divRef.current.blur();
        }
    }

    handleBlur(e: React.FocusEvent) {
        if (this.divRef.current !== null) {
            this.divRef.current.textContent = this.props.title;
        }
    }
}