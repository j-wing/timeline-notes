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

interface TimestampState {
    timestamp: Date;
}

interface TimestampProps {
    shouldTick: boolean;
    initialTimestamp: Date;
}

export class Timestamp extends React.Component<TimestampProps, TimestampState> {
    interval: number;

    constructor(props: TimestampProps) {
        super(props);
        this.state = { timestamp: this.props.initialTimestamp };
        this.interval = -1;
    }

    render() {
        return (
            <span className="timestamp">
                {this.state.timestamp.toLocaleString("en-us", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                })}
            </span>
        );
    }

    tick() {
        this.setState(state => ({ timestamp: new Date() }));
    }

    componentDidMount() {
        if (this.props.shouldTick) {
            this.setupTimer();
        }
    }

    componentDidUpdate(prevProps: TimestampProps, prevState: TimestampState) {
        if (prevProps.shouldTick !== this.props.shouldTick) {
            if (this.props.shouldTick) {
                this.setupTimer();
            } else {
                window.clearInterval(this.interval);
            }
        }
    }

    setupTimer() {
        this.interval = window.setInterval(() => this.tick(), 500);
    }

    componentWillUnmount() {
        window.clearInterval(this.interval);
    }
}
