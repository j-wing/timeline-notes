import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {DriveSignInState} from './DriveSyncHandler';
import DriveSyncHandler from './DriveSyncHandler';

interface MenuProps {
    newNoteHandler: () => void;
    finishToggleHandler: () => void;
    signInHandler: () => void;
    signOutHandler: () => void;
    noteFinished: boolean;
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
        let toggleFinishString = (this.props.noteFinished)
                        ? "Mark Note Unfinished"
                        : "Mark Note Finished";
        
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
        }

        
        return (
            <DropdownButton alignRight id="menu" title="Menu">
                <Dropdown.Item onClick={(e: React.MouseEvent<any>) => this.props.newNoteHandler()}>New Note</Dropdown.Item>
                <Dropdown.Item onClick={(e: React.MouseEvent<any>) => this.props.finishToggleHandler()}>
                    {toggleFinishString}
                </Dropdown.Item>
                <Dropdown.Divider />
                {driveMenuItems}
            </DropdownButton>
        )
    }

    handleMenuIconClick(e: React.MouseEvent) {
    }

    resetHandler(e: React.MouseEvent) {
    }
}