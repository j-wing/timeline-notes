import React from 'react';
import './App.css';
import { NoteRow } from './noterow';
import { NoteLine } from './NoteLine';
import { NoteTitle } from './notetitle';
import { Note } from './Note';
import NoteContentHandler from './NoteContentHandler';


interface MenuItemProps {
    title: string;
    handler: ((e: React.MouseEvent) => void);
}

interface MenuItemState {
}

export class MenuItem extends React.Component<MenuItemProps, MenuItemState> {
    render() {
        return <div className="menu-item" onClick={this.props.handler}>
            ${this.props.title}
        </div>
    }
}