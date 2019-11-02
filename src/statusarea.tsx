import React from "react";
import DriveSyncHandler, { DriveSyncStatus } from "./DriveSyncHandler";

interface SyncStatusAreaProps {
  noteDriveId: string;
}

interface SyncStatusAreaState {
    syncStatus: DriveSyncStatus;
}

class SyncStatusArea extends React.Component<SyncStatusAreaProps, SyncStatusAreaState> {
    constructor(props: SyncStatusAreaProps) {
        super(props);

        DriveSyncHandler.addSyncStatusChangeHandler(this.handleSyncStatusChange.bind(this));
        this.state = {syncStatus: DriveSyncStatus.LOADING };
    }

    handleSyncStatusChange(newStatus: DriveSyncStatus) {
        this.setState({ syncStatus: newStatus });
    }

  render() {
      let className = "";
      let text = "";

      switch (this.state.syncStatus) {
          case DriveSyncStatus.SYNCING:
              className = "syncing";
              text = "Syncing note to Drive...";
              break;
          case DriveSyncStatus.SYNCED:
              className = "synced";
              text = "Add content to sync note...";
              break;
          case DriveSyncStatus.LOADING:
              className = "loading";
              text = "Loading Drive state...";
              break;
          case DriveSyncStatus.SIGNED_OUT:
              className = "signed-out";
              text = "Not signed into Drive";
              break;
      }

      let showDocsLink = (this.props.noteDriveId.length > 0 && 
                            (this.state.syncStatus === DriveSyncStatus.SYNCED ||
                             this.state.syncStatus === DriveSyncStatus.SYNCING));
    return (
      <div className={"view-in-docs-link " + className}>
        {showDocsLink && 
                <a href={"https://docs.google.com/document/d/" + this.props.noteDriveId + "/edit"}
                    rel="noopener noreferrer"
                    target="_blank">
            View Note in Drive
          </a>}
          {!showDocsLink && text}
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
            <SyncStatusArea noteDriveId={this.props.noteDriveId} />
            <LockIcon noteLocked={this.props.timestampsLocked} />
        </div>

    }
}