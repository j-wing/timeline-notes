import React from "react";

interface SyncStatusAreaProps {
  noteDriveId: string;
}

interface SyncStatusAreaState {
}

class SyncStatusArea extends React.Component<SyncStatusAreaProps, SyncStatusAreaState> {
  render() {
    return (
      <div className="view-in-docs-link" >
        {this.props.noteDriveId.length > 0 && 
            <a href={"https://docs.google.com/document/d/" + this.props.noteDriveId + "/edit"}
          target="_blank">
            View Note in Docs
          </a>}
      </div>
    )
  }
}

interface LockIconProps {
  noteLocked: boolean
}

interface LockIconState {
}

class LockIcon extends React.Component<LockIconProps, LockIconState> {
  render() {
      let visibleText = this.props.noteLocked ? "visible" : "invisible";

      return (
          <span className={"note-locked-icon " + visibleText}
                title="Timestamps are locked. Unlock via the menu."></span>
      )
  }
}

interface StatusAreaProps {
    noteDriveId: string;
    timestampsLocked: boolean;
}

interface StatusAreaState {}

export default class StatusArea extends React.Component<StatusAreaProps, StatusAreaState> {
    render() {
        return <div className="status-area">
            <LockIcon noteLocked={this.props.timestampsLocked} />
            <SyncStatusArea noteDriveId={this.props.noteDriveId} />
        </div>

    }
}