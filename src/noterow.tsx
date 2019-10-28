import React from "react";
import { Timestamp } from "./timestamp";
import { NoteLine } from "./NoteLine";
import { Note } from "./Note";
import NoteContentHandler from "./NoteContentHandler";
import { computeIndentString } from "./util";

interface NoteRowProps {
    focusHandler: Function;
    keyDownHandler: Function;
    note: Note;
    rowId: number;
    focused: boolean;
}

interface NoteRowState {
    indentedUnits: number;
    entryboxContent: string;
    editedSinceLastFocus: boolean;
}

export class NoteRow extends React.Component<NoteRowProps, NoteRowState> {
    timestampElement = React.createRef<Timestamp>();
    entryboxElement = React.createRef<HTMLTextAreaElement>();
    noteLine: NoteLine;

    constructor(props: NoteRowProps) {
        super(props);

        let noteLine = props.note.getLine(props.rowId);
        if (noteLine === undefined) {
            console.error("Note: ", props.note);
            throw "Got bad row id. Provided row id: " + props.rowId;
        }

        this.noteLine = noteLine;

        this.state = {
            indentedUnits: this.noteLine.getIndentedUnits(),
            entryboxContent: this.computeEntryboxContent(this.noteLine.getIndentedUnits(), this.noteLine.getContent()),
            editedSinceLastFocus: false
        };
    }

    render() {
        return (
            <div className={`noterow ${this.props.focused ? 'noterow-focused' : 'noterow-unfocused'}`}>
                <Timestamp ref={this.timestampElement}
                    initialTimestamp={this.noteLine.getLastEditTimestamp()}
                    shouldTick={this.computeTimestampShouldTick()} />
                <textarea ref={this.entryboxElement}
                    onFocus={this.handleEntryboxFocus.bind(this)}
                    onKeyDown={this.handleKeyDown.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    value={this.state.entryboxContent}
                    readOnly={!this.props.focused}
                    rows={1}
                    className="entrybox"></textarea>
            </div>
        )
    }

    computeTimestampShouldTick() {
        if (this.props.note.getFinished()) {
            return false;
        }

        let isEmpty = (this.state.entryboxContent.trim().length === 0);
        if (isEmpty && this.props.focused) {
            return true;
        }
        
        if (!isEmpty && this.state.editedSinceLastFocus) {
            return true;
        }

        return false;
    }

    computeEntryboxContent(indentedUnits: number, rawContent: string) {
        return computeIndentString(indentedUnits) + rawContent.trim();
    }


    componentDidUpdate(oldProps: NoteRowProps, oldState: NoteRowState) {
        if (oldState.indentedUnits !== this.state.indentedUnits) {
            this.setState(state => ({
                entryboxContent: this.computeEntryboxContent(this.state.indentedUnits, this.state.entryboxContent)
            }));
            this.noteLine.setIndentedUnits(this.state.indentedUnits);
        }

        if (oldState.entryboxContent !== this.state.entryboxContent) {
            this.noteLine.setContent(this.state.entryboxContent, true);
            NoteContentHandler.updateNote(this.props.note);
        }

        if (oldProps.focused !== this.props.focused && !this.props.focused) {
            this.setState({ editedSinceLastFocus: false })
        }
        if (this.entryboxElement.current !== null) {
            if (this.props.focused) {
                this.entryboxElement.current.focus();
            }
        }
    }

    componentDidMount() {
        if (this.entryboxElement.current !== null) {
            if (this.props.focused) {
                this.entryboxElement.current.focus();
            }
        }

    }

    handleChange(e: React.ChangeEvent) {
        this.setState({ entryboxContent: (e.target as HTMLTextAreaElement).value, editedSinceLastFocus: true });
        NoteContentHandler.updateNote(this.props.note);
    }

    handleKeyDown(e: React.KeyboardEvent) {
        if (!this.props.keyDownHandler(this.noteLine, e)) {
            return;
        }

        if (e.key === "Tab") {
            e.preventDefault();
            if (e.shiftKey) {
                this.setState(state => ({ indentedUnits: Math.max(state.indentedUnits - 1, 0) }));
            } else {
                this.setState(state => ({ indentedUnits: state.indentedUnits + 1 }));
            }
        }
    }

    handleEntryboxFocus(e: React.FocusEvent) {
        this.props.focusHandler(this.noteLine);

        if (this.state.entryboxContent.trim().length === 0 && this.entryboxElement.current != null) {
            let currentRawLength = this.entryboxElement.current.textLength;
            this.entryboxElement.current.setSelectionRange(currentRawLength, currentRawLength);
        }
    }
}