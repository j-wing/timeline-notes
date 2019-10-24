import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

interface MenuProps {
    newNoteHandler: () => void;
    finishToggleHandler: () => void;
    noteFinished: boolean;
}

interface MenuState {
  open: boolean;
}

export class Menu extends React.Component<MenuProps, MenuState> {
    constructor(props: MenuProps) {
        super(props);

        this.state = { open: false }
    }

    render() {
        let toggleFinishString = (this.props.noteFinished)
                        ? "Mark Note Unfinished"
                        : "Mark Note Finished";
        return (
            <DropdownButton alignRight id="menu" title="Menu">
                <Dropdown.Item onClick={(e: React.MouseEvent<any>) => this.props.newNoteHandler()}>New Note</Dropdown.Item>
                <Dropdown.Item onClick={(e: React.MouseEvent<any>) => this.props.finishToggleHandler()}>
                    {toggleFinishString}
                </Dropdown.Item>
            </DropdownButton>
        )
    }

    handleMenuIconClick(e: React.MouseEvent) {
    }

    resetHandler(e: React.MouseEvent) {
    }
}