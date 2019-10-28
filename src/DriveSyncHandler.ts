import { Note } from "./Note";

declare var gapi: any;

const API_KEY = "AIzaSyBEH9v-TByqUFESw8vjl2YEDgAKoWm7n_8";
const CLIENT_ID = "370774814885-7kseam56ntmpklgnr9p00f8gh968cmtb.apps.googleusercontent.com";
// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const PARENT_NAME = "Synced Interview Notes";

export enum DriveSignInState {
    LOADING,
    SIGNED_OUT,
    SIGNED_IN
}

type SignedInEventHandler = (isSignedIn: DriveSignInState) => void;

class DriveSyncHandler {
    private signedInEventHandlers: Array<SignedInEventHandler> = [];

    async init() {
        gapi.load('client:auth2', this.initClient.bind(this));
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
}

export default new DriveSyncHandler();