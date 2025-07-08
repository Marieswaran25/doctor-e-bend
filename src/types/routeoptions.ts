import { NextFunction, Request, Response } from 'express';

import { Roles } from '../entities/userRoles';

export type HttpMethods = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'all';

export interface RouteOptions {
    method: HttpMethods;
    path: string;
    action: (req: Request, res: Response, next: NextFunction) => Promise<any>;
    roles: Roles[];
    description?: string;
}
