import React from "react";

interface TimestampState {
  timestamp: Date;
  hasFocus: boolean;
}

interface TimestampProps {}

export class Timestamp extends React.Component<TimestampProps, TimestampState> {
  interval: number;

  constructor(props: Object) {
    super(props);
    this.state = { timestamp: new Date(), hasFocus: true };
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

  componentDidUpdate(_: TimestampProps, prevState: TimestampState) {
    if (prevState.hasFocus != this.state.hasFocus) {
      if (this.state.hasFocus) {
        this.setupTimer();
      } else {
        window.clearInterval(this.interval);
      }
    }
  }

  componentDidMount() {
    this.setupTimer();
  }

  setupTimer() {
    this.interval = window.setInterval(() => this.tick(), 500);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }
}
