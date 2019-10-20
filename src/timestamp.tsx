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
