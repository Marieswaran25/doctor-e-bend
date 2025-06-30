import { Router } from 'express';

import pdf from './pdf';
import users from './users';

const route = Router();
export default function Routes() {
    [users, pdf].forEach(callback => {
        return callback(route);
    });
    return route;
}
