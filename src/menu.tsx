import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {DriveSignInState} from './DriveSyncHandler';
import DriveSyncHandler from './DriveSyncHandler';

interface MenuProps {
    newNoteHandler: () => void;
    timestampLockToggleHandler: () => void;
    signInHandler: () => void;
    signOutHandler: () => void;
    timestampsLocked: boolean;
}

interface MenuState {
  open: boolean;
  driveSignInState: DriveSignInState;
}

export class Menu extends React.Component<MenuProps, MenuState> {
    constructor(props: MenuProps) {
        super(props);

        this.state = { open: false, driveSignInState: DriveSignInState.LOADING}
        DriveSyncHandler.addSignInStateHandler((isSignedIn: DriveSignInState) =>{
            this.setState({ driveSignInState: isSignedIn})
        })
    }

    render() {
        let toggleTimestampsString = (this.props.timestampsLocked)
                        ? "Unlock Timestamps"
                        : "Lock Timestamps";
        
        let driveMenuItems: Array<any> = [];

        if (this.state.driveSignInState === DriveSignInState.SIGNED_IN) {
            driveMenuItems = [
                <Dropdown.Item key="signout" onClick={(e: React.MouseEvent<any>) => this.props.signOutHandler()}>
                    Sign out of Google Drive
                </Dropdown.Item>
            ]
        } else if (this.state.driveSignInState === DriveSignInState.SIGNED_OUT) {
            driveMenuItems = [
                <Dropdown.Item key="signin" onClick={(e: React.MouseEvent<any>) => this.props.signInHandler()}>
                    Sign into Google Drive
                </Dropdown.Item>
            ];
        } else {
            driveMenuItems = [
                <Dropdown.Item key="loading" onClick={(e: React.MouseEvent<any>) => this.props.signInHandler()}>
                    Drive Login Loading...
                </Dropdown.Item>
            ];
        }

        
        return (
            <DropdownButton alignRight id="menu" title="Menu">
                <Dropdown.Item onClick={(e: React.MouseEvent<any>) => this.props.newNoteHandler()}>New Note</Dropdown.Item>
                <Dropdown.Item onClick={(e: React.MouseEvent<any>) => this.props.timestampLockToggleHandler()}>
                    {toggleTimestampsString}
                </Dropdown.Item>
                <Dropdown.Divider />
                {driveMenuItems}
                <Dropdown.Divider />
                <Dropdown.Item onClick={this.githubHandler.bind(this)}>
                    Source code on GitHub
                </Dropdown.Item>
                <Dropdown.Item onClick={this.bugHandler.bind(this)}>
                    Feedback? File a bug
                </Dropdown.Item>
            </DropdownButton>
        )
    }

    githubHandler(e: React.MouseEvent<any>) {
        window.open("https://github.com/jordonwii/timeline-notes");
    }

    bugHandler(e: React.MouseEvent<any>) {
        window.open("https://github.com/jordonwii/timeline-notes/issues/new");
    }
}