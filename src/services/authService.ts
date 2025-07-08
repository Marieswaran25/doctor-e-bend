import { OAuth2Client } from 'google-auth-library';

import { GOOGLE_CLIENT_ID, GOOGLE_SECRET_ID } from '../config';
export class AuthService {
    private oAuthClient: OAuth2Client;
    constructor() {
        this.oAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET_ID, 'postmessage');
    }

    async verifyGoogleToken({ token, code }: { token?: string; code?: string }): Promise<{
        email: string;
        name: string;
        profilePic?: string;
        emailVerified?: boolean;
    }> {
        let ticket = null;

        if (token) {
            // One Tap flow: ID token
            ticket = await this.oAuthClient.verifyIdToken({ idToken: token });
        } else if (code) {
            // Auth Code flow: exchange code for tokens, then verify ID token
            const { tokens } = await this.oAuthClient.getToken(code);

            console.log(tokens);
            if (!tokens.id_token) {
                throw new Error('No id_token returned from Google for this code');
            }
            ticket = await this.oAuthClient.verifyIdToken({ idToken: tokens.id_token });
        } else {
            throw new Error('No token or code provided');
        }

        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Invalid token payload');
        }

        return {
            email: payload.email || '',
            name: payload.name || `${payload.given_name} ${payload.family_name}`,
            profilePic: payload.picture,
            emailVerified: payload.email_verified,
        };
    }
}
