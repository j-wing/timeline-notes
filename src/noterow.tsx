import React from "react";
import { Timestamp } from "./timestamp";
import { Entrybox } from "./entrybox";
import { NoteLine } from "./NoteLine";

interface NoteRowProps {
    focusHandler: Function;
    keyDownHandler: Function;
    noteRow: NoteLine;
    focused: boolean;
}

interface NoteRowState {
    indentedUnits: number;
    entryboxContent: string;
}

const INDENT_LENGTH = 4;

export class NoteRow extends React.Component<NoteRowProps, NoteRowState> {
    timestampElement = React.createRef<Timestamp>();
    entryboxElement = React.createRef<HTMLTextAreaElement>();

    constructor(props: NoteRowProps) {
        super(props);

        this.state = {
            indentedUnits: this.props.noteRow.getIndentedUnits(),
            entryboxContent: this.computeEntryboxContent(this.props.noteRow.getIndentedUnits(), this.props.noteRow.getContent()),
        };
    }

    render() {
        return (
            <div className={`noterow ${this.props.focused ? 'noterow-focused' : 'noterow-unfocused'}`}>
                <Timestamp ref={this.timestampElement} initialTimestamp={this.props.noteRow.getTimestamp()} focused={this.props.focused} />
                <textarea ref={this.entryboxElement}
                    onFocus={this.handleEntryboxFocus.bind(this)}
                    onKeyDown={this.handleKeyDown.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    value={this.state.entryboxContent}
                    rows={1}
                    className="entrybox"></textarea>
            </div>
        )
    }

    computeEntryboxContent(indentedUnits: number, rawContent: string) {
        let indentPrefix = new Array(indentedUnits * INDENT_LENGTH)
            .fill(" ")
            .join("");
        return indentPrefix + rawContent.trim();
    }


    componentDidUpdate(oldProps: NoteRowProps, oldState: NoteRowState) {
        if (oldState.indentedUnits != this.state.indentedUnits) {
            this.setState(state => ({
                entryboxContent: this.computeEntryboxContent(this.state.indentedUnits, this.state.entryboxContent)
            }));
            this.props.noteRow.setIndentedUnits(this.state.indentedUnits);
        }

        if (oldState.entryboxContent != this.state.entryboxContent) {
            this.props.noteRow.setContent(this.state.entryboxContent);
        }

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

    handleChange(e: React.ChangeEvent) {
        this.setState({ entryboxContent: (e.target as HTMLTextAreaElement).value });
    }

    handleKeyDown(e: React.KeyboardEvent) {
        if (!this.props.keyDownHandler(this.props.noteRow, e)) {
            return;
        }

        if (e.key == "Tab") {
            e.preventDefault();
            if (e.shiftKey) {
                this.setState(state => ({ indentedUnits: Math.max(state.indentedUnits - 1, 0) }));
            } else {
                this.setState(state => ({ indentedUnits: state.indentedUnits + 1 }));
            }
        }
    }

    handleEntryboxFocus(e: React.FocusEvent) {
        this.props.focusHandler(this.props.noteRow);

        if (this.state.entryboxContent.trim().length === 0 && this.entryboxElement.current != null) {
            let currentRawLength = this.entryboxElement.current.textLength;
            this.entryboxElement.current.setSelectionRange(currentRawLength, currentRawLength);
        }
    }
}