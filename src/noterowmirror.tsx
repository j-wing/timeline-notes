
import React from "react";
import TextareaAutosize from 'react-textarea-autosize';
import {ROW_HEIGHT, ENTRYBOX_CLASS_NAME} from "./noterow";


interface NoteRowMirrorProps {
    value: string;
}

interface NoteRowMirrorState {
}

/** This is a helper component for computing where the cursor is within a NoteRow. */
export class NoteRowMirror extends React.Component<NoteRowMirrorProps, NoteRowMirrorState> {
    mirrorElem = React.createRef<HTMLTextAreaElement>();

    render() {
        return <TextareaAutosize
                    inputRef={this.mirrorElem}
                    value={this.props.value}
                    className="entrybox entrybox-mirror" />;
    }

    componentDidUpdate() {
        if (this.mirrorElem.current !== null) {
            this.mirrorElem.current.style.width = this.getEntryboxWidth() + "px";
        }
    }

    getCurrentRow(): (number | null) {
        if (this.mirrorElem.current !== null) {
            return (Math.floor(this.mirrorElem.current.clientHeight / ROW_HEIGHT));
        }

        return null;
    }

  getEntryboxWidth(): number {
    let firstRow = document.getElementsByClassName(ENTRYBOX_CLASS_NAME)[0];
    if (firstRow) {
      return firstRow.clientWidth;
    }

    return 0;
  }
}