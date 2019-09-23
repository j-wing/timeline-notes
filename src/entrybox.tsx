import React from 'react';

interface EntryboxProps {
    newLineHandler: Function
}

interface EntryboxState {

}

export class Entrybox extends React.Component<EntryboxProps, EntryboxState> {
    render() {
        return (<span></span>
        )
    }

    handleKeyDown(e: React.KeyboardEvent) {
    }
}
