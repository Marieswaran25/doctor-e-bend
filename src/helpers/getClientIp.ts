import { Request } from 'express';

export function getclientIp(req: Request): string {
    if (Array.isArray(req.headers['x-forwarded-for']) && req.headers['x-forwarded-for'].length > 0) {
        return req.headers['x-forwarded-for'][0];
    }
    return req.connection.remoteAddress || '';
}
