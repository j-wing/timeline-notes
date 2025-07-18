/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import { Timestamp } from "./timestamp";
import { NoteLine } from "./NoteLine";
import { Note } from "./Note";
import NoteContentHandler from "./NoteContentHandler";
import { computeIndentString } from "./util";
import TextareaAutosize from 'react-textarea-autosize';

export const ROW_HEIGHT = 39;
export const ENTRYBOX_CLASS_NAME = "entrybox";
const EDIT_TIMEOUT = 5000;

interface NoteRowProps {
    focusHandler: Function;
    keyDownHandler: (n: NoteRow, e: React.KeyboardEvent) => boolean;
    keyUpHandler: (n: NoteRow) => void;
    clickHandler: (n: NoteRow) => void;
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
    entryboxElement: HTMLTextAreaElement | null = null;
    noteLine: NoteLine;
    editTimer: number;

    constructor(props: NoteRowProps) {
        super(props);

        let noteLine = props.note.getLine(props.rowId);
        if (noteLine === undefined) {
            console.error("Note: ", props.note);
            throw new Error("Got bad row id. Provided row id: " + props.rowId);
        }

        this.noteLine = noteLine;
        this.editTimer = -1;

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
                <TextareaAutosize ref={(component: any) => {
                    const el = component?.textareaRef || component;
                    this.entryboxElement = el;
                    if (el && this.props.focused) {
                        el.focus();
                    }
                }}
                    onFocus={this.handleEntryboxFocus.bind(this)}
                    onKeyDown={this.handleKeyDown.bind(this)}
                    onKeyUp={this.handleKeyUp.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    onClick={this.handleClick.bind(this)}
                    value={this.state.entryboxContent}
                    readOnly={!this.props.focused}
                    className={ENTRYBOX_CLASS_NAME} />
            </div>
        )
    }

    computeTimestampShouldTick() {
        if (this.props.note.getTimestampsLocked()) {
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
            this.setState({ editedSinceLastFocus: false });
        }
        
        if (this.props.focused && oldProps.focused !== this.props.focused) {
            if (this.entryboxElement) {
                this.entryboxElement.focus();
            }
        }
    }

    componentDidMount() {
        if (this.props.focused && this.entryboxElement) {
            this.entryboxElement.focus();
        }
    }

    getTextUntilCursor(): string | null {
        if (this.entryboxElement !== null) {
            return this.entryboxElement.value.slice(0, this.entryboxElement.selectionStart + 1);
        }

        return null;
    }

    getNumRows(): number {
        if (this.entryboxElement !== null) {
            return Math.floor(this.entryboxElement.clientHeight / ROW_HEIGHT);
        }
        return 0;
    }

    isCursorOnFirstLine(): boolean {
        if (!this.entryboxElement) return true;
        
        const textarea = this.entryboxElement;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPos);
        
        // If there's no newline before cursor, we're on first line
        return !textBeforeCursor.includes('\n');
    }

    isCursorOnLastLine(): boolean {
        if (!this.entryboxElement) return true;
        
        const textarea = this.entryboxElement;
        const cursorPos = textarea.selectionStart;
        const textAfterCursor = textarea.value.substring(cursorPos);
        
        // If there's no newline after cursor, we're on last line
        return !textAfterCursor.includes('\n');
    }

    getNoteLine(): NoteLine {
        return this.noteLine;
    }

    handleClick(e: React.MouseEvent) {
        this.props.clickHandler(this);
    }

    handleKeyUp(e: React.KeyboardEvent) {
        this.props.keyUpHandler(this);
    }

    handleChange(e: React.ChangeEvent) {
        this.setState({ entryboxContent: (e.target as HTMLTextAreaElement).value, editedSinceLastFocus: true });
        NoteContentHandler.updateNote(this.props.note);

        if (this.editTimer !== -1) {
            window.clearTimeout(this.editTimer);
        }

        this.editTimer = window.setTimeout(this.handleEditTimeout.bind(this), EDIT_TIMEOUT);
    }

    handleEditTimeout() {
        this.setState({ editedSinceLastFocus: false });
    }

    handleKeyDown(e: React.KeyboardEvent) {
        if (!this.props.keyDownHandler(this, e)) {
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

        if (this.state.entryboxContent.trim().length === 0 && this.entryboxElement != null) {
            let currentRawLength = this.entryboxElement.textLength;
            this.entryboxElement.setSelectionRange(currentRawLength, currentRawLength);
        }
    }

}
