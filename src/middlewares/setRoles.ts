import { NextFunction, Response } from 'express';

import { Roles } from '../entities/userRoles';
import { CustomRequest } from '../types/customRequest';

export const setRoles = (roles: Roles[]) => (req: CustomRequest, res: Response, next: NextFunction) => {
    req.roles = roles;
    next();
};
