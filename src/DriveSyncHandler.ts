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

const PARENT_NAME = "Synced Interview Notes";
const PARENT_ID_STORAGE_KEY = "parent-drive-id";

export enum DriveSignInState {
    LOADING,
    SIGNED_OUT,
    SIGNED_IN
}

type SignedInEventHandler = (isSignedIn: DriveSignInState) => void;

class DriveSyncHandler {
    private signedInEventHandlers: Array<SignedInEventHandler> = [];

    async init(): Promise<void> {
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

        let signInState = (isSignedIn) ? DriveSignInState.SIGNED_IN : DriveSignInState.SIGNED_OUT;
        for (let handler of this.signedInEventHandlers) {
            handler(signInState);
        }
    }

    addSignInStateHandler(handler: SignedInEventHandler) {
        this.signedInEventHandlers.push(handler);
    }

    isUserSignedIn(): boolean {
        return gapi.auth2.getAuthInstance().isSignedIn.get()
    }

    async saveNote(note: Note): Promise<string> {
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
            await this.uploadContent(note.getDriveId(), note.convertToText());
        }
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