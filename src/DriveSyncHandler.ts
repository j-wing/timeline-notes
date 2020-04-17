/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Note } from "./Note";

declare var gapi: any;

const API_KEY = "AIzaSyBEH9v-TByqUFESw8vjl2YEDgAKoWm7n_8";
const CLIENT_ID = "370774814885-7kseam56ntmpklgnr9p00f8gh968cmtb.apps.googleusercontent.com";
// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const DIRECTORY_MIME = "application/vnd.google-apps.folder";
const DOC_MIME = "application/vnd.google-apps.document";

const PARENT_NAME = "Synced Timeline Notes";
const PARENT_ID_STORAGE_KEY = "parent-drive-id";

export enum DriveSignInState {
    LOADING,
    SIGNED_OUT,
    SIGNED_IN
}

export enum DriveSyncStatus {
    LOADING,
    SIGNED_OUT,
    SYNCING,
    SYNCED
}

type SignedInEventHandler = (isSignedIn: DriveSignInState) => void;
type SyncStatusChangeHandler = (isSignedIn: DriveSyncStatus) => void;

class DriveSyncHandler {
    private signedInEventHandlers: Array<SignedInEventHandler> = [];
    private syncStatusChangeHandlers: Array<SyncStatusChangeHandler> = [];

    async init(): Promise<void> {
        this.fireSyncStatusChange(DriveSyncStatus.LOADING);
        return gapi.load('client:auth2', this.initClient.bind(this));
    }

    initClient() {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        }).then(() => {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(this.handleIsSignedInState.bind(this));

            this.handleIsSignedInState(gapi.auth2.getAuthInstance().isSignedIn.get());
        })
    }

    handleIsSignedInState(isSignedIn: boolean) {
        console.log('user is now', isSignedIn);

        if (!isSignedIn) {
            this.fireSyncStatusChange(DriveSyncStatus.SIGNED_OUT);
        }

        let signInState = (isSignedIn) ? DriveSignInState.SIGNED_IN : DriveSignInState.SIGNED_OUT;
        for (let handler of this.signedInEventHandlers) {
            handler(signInState);
        }
    }

    addSignInStateHandler(handler: SignedInEventHandler) {
        this.signedInEventHandlers.push(handler);
    }

    addSyncStatusChangeHandler(handler: SyncStatusChangeHandler) {
        this.syncStatusChangeHandlers.push(handler);
    }
    
    fireSyncStatusChange(newStatus: DriveSyncStatus) {
        for (let handler of this.syncStatusChangeHandlers) {
            handler(newStatus);
        }
    }

    isUserSignedIn(): boolean {
        return gapi.auth2.getAuthInstance().isSignedIn.get()
    }

    async saveNote(note: Note): Promise<string> {
        if (!this.isUserSignedIn()) {
            return "";
        }

        this.fireSyncStatusChange(DriveSyncStatus.SYNCING);
        let id = "";
        if (note.getDriveId().length === 0 && !note.isEmpty()) {
            console.log("Creating new note to drive: ", note);
            let parentId = await this.getParentFolderId();

            let response = await gapi.client.drive.files.create({
                name: note.getTitle(),
                mimeType: DOC_MIME,
                parents: [parentId],
            })

            console.log("Got create response: ", response);

            if (response.status !== 200) {
                throw new Error("Got bad create response code");
            }
            id = response.result.id;
        } else if (note.getDriveId().length !== 0) {
            console.log("Saving note to drive: ", note);
            id = note.getDriveId();
        }

        if (id.length > 0) {
            await this.uploadContent(id, note.convertToText());
        }
        this.fireSyncStatusChange(DriveSyncStatus.SYNCED);

        return id;
    }

    async getParentFolderId(): Promise<string> {
        let id = window.localStorage[PARENT_ID_STORAGE_KEY];
        if (id === undefined) {
            console.log("Creating new parent folder...");
            let response = await gapi.client.drive.files.create({
                mimeType: DIRECTORY_MIME,
                name: PARENT_NAME
            })

            console.log("got create response: ", response);
            if (response.status !== 200) {
                throw new Error("Got bad create response code");
            }

            id = response.result.id;
            window.localStorage[PARENT_ID_STORAGE_KEY] = id;
        } else {
            console.log("Reusing drive id: ", id);
        }
        return id;
    }

    async uploadContent(driveId: string, content: string): Promise<string> {
        console.log("About to upload content for", driveId);
        let xhr = new XMLHttpRequest();
        xhr.open("PATCH", "https://www.googleapis.com/upload/drive/v3/files/" + driveId + "?uploadType=media");
        xhr.setRequestHeader("Authorization", "Bearer " + gapi.client.getToken().access_token);
        xhr.setRequestHeader("Content-Type", DOC_MIME);

        return new Promise<string>((resolve, reject) => {
            xhr.onload = () => resolve();
            xhr.send(content);
        });
    }
}


export default new DriveSyncHandler();
