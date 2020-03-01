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

import React from 'react';
import Alert from 'react-bootstrap/Alert';

enum Message {
    NONE,
    COPY_TO_CLIPBOARD_FAILED,
    COPY_TO_CLIPBOARD_SUCCESS
}

interface NotifierProps {
}

interface NotifierState {
    notification: Message;
    // Arbitrary data provided by whatever sets up this notification.
    messageData: string
}

const CLOSE_TIMEOUT = 2000;

export class Notifier extends React.Component<NotifierProps, NotifierState> {
    timerId: (NodeJS.Timeout | null) = null;

    constructor(props: NotifierProps) {
        super(props);

        this.state = {
            notification: Message.NONE,
            messageData: ""
        };
    }

    render() {
        return <div className="notification-area">
            <Alert variant="success" show={this.state.notification === Message.COPY_TO_CLIPBOARD_SUCCESS}>
                Note text copied to clipboard.
                </Alert>
            <Alert variant="warning" show={this.state.notification === Message.COPY_TO_CLIPBOARD_FAILED}>
                Copy to clipboard failed. Error was: {this.state.messageData}.
                </Alert>
        </div>
    }

    public showCopyToClipboardFailed(error: string) {
        this.setNotification(Message.COPY_TO_CLIPBOARD_FAILED, error);
    }

    public showCopyToClipboardSuccess() {
        this.setNotification(Message.COPY_TO_CLIPBOARD_SUCCESS, "");
    }

    public setNotification(notifType: Message, data: string) {
        this.setState({
            notification: notifType,
            messageData: data
        });
    }

    componentDidUpdate(prevProps: NotifierProps, prevState: NotifierState) {
        if (this.state.notification !== Message.NONE 
            && (prevState.notification !== this.state.notification || prevState.messageData !== this.state.messageData)) {
            if (this.timerId !== null) {
                clearTimeout(this.timerId);
            }

            this.timerId = setTimeout(() => {
                this.setState({
                    notification: Message.NONE,
                    messageData: ""
                })
            }, CLOSE_TIMEOUT);

        }
    }

}