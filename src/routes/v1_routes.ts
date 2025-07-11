import { Router } from 'express';

import conversations from './conversations';
import pdf from './pdf';
import services from './services';
import session from './session';
import users from './users';

const route = Router();
export default function Routes() {
    [users, pdf, session, conversations, services].forEach(callback => {
        return callback(route);
    });
    return route;
}
