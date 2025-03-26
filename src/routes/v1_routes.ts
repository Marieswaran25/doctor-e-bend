import { Router } from 'express';

import users from './users';

const route = Router();
export default function Routes() {
    [users].forEach(callback => {
        return callback(route);
    });
    return route;
}
