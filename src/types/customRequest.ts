import { Request } from 'express';

export interface CustomRequest extends Request {
    user?: {
        userId: string;
        email: string;
        roles: string[];
    };
    roles?: string[];
}
