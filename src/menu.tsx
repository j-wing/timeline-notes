import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

interface MenuProps {
    newNoteHandler: (e: React.MouseEvent<any>) => void;
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
        return (
            <DropdownButton alignRight id="menu" title="Menu">
                <Dropdown.Item onClick={this.props.newNoteHandler}>New Note</Dropdown.Item>
            </DropdownButton>
        )
    }

    handleMenuIconClick(e: React.MouseEvent) {
    }

    resetHandler(e: React.MouseEvent) {
    }
}