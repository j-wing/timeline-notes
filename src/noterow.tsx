import React from "react";
import { Timestamp } from "./timestamp";
import { Entrybox } from "./entrybox";
import { NoteLine } from "./NoteLine";

interface NoteRowProps {
    newLineHandler: Function;
    focusHandler: Function;
    note: NoteLine;
    focused: boolean;
}

interface NoteRowState {
}

export class NoteRow extends React.Component<NoteRowProps, NoteRowState> {
    timestampElement = React.createRef<Timestamp>();
    entryboxElement = React.createRef<HTMLTextAreaElement>();

    render() {
        return (
            <div className={`noterow ${this.props.focused ? 'noterow-focused' : 'noterow-unfocused'}`}>
                <Timestamp ref={this.timestampElement} initialTimestamp={this.props.note.getTimestamp()} focused={this.props.focused} />
                <textarea ref={this.entryboxElement} onFocus={this.handleEntryboxFocus.bind(this)} onKeyDown={this.handleKeyDown.bind(this)} rows={1} className="entrybox"></textarea>
            </div>
        )
    }

    componentDidMount() {
        if (this.entryboxElement.current !== null) {
            if (this.props.focused) {
                this.entryboxElement.current.focus();
            } else {
                this.entryboxElement.current.disabled = true;
            }
        }

    }

    handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            this.props.newLineHandler(this);
        } else if (this.entryboxElement.current !== null && this.entryboxElement.current.textContent !== null) {
            this.props.note.setContent(this.entryboxElement.current.textContent);
        }
    }

    handleEntryboxFocus(e: React.FocusEvent) {
        this.props.focusHandler(this.props.note);
    }
}