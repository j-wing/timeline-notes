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