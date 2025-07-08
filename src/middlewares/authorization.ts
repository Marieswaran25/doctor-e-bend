import { NextFunction, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

import { JWT_KEYS } from '../config';
import { CustomError } from '../helpers/customErrors';
import logger from '../helpers/logger';
import { CustomRequest } from '../types/customRequest';
import { STATUSCODES } from '../types/statusCodes';

export function authorization(req: CustomRequest, res: Response, next: NextFunction) {
    try {
        if (!req.roles || req.roles.length === 0) {
            logger.debug('Bypass Authorization', req.headers['x-correlation-id'] as string);
            next();
        } else {
            const access_token = req.headers.authorization || req.query.accessToken;
            const JWT_SECRET = JWT_KEYS['access'];

            if (access_token && typeof access_token === 'string') {
                verify(access_token.replace('Bearer ', ''), JWT_SECRET, (err, decoded) => {
                    if (err) {
                        throw new CustomError('Invalid Authorization Token', STATUSCODES.FORBIDDEN);
                    }
                    if (decoded) {
                        const { email, roles, userId } = decoded as JwtPayload;
                        req.user = Object.freeze({ email, roles, userId });
                        if (req.roles) {
                            const rolesArray = Array.isArray(roles) ? roles : [roles];
                            const hasRequiredRole = req.roles.some(requiredRole => rolesArray.includes(requiredRole));

                            if (hasRequiredRole) {
                                next();
                            } else {
                                throw new CustomError('Required Role is missing for Authorization', STATUSCODES.UNAUTHORIZED);
                            }
                        }
                    }
                });
            } else {
                throw new CustomError('Authorization Required', STATUSCODES.UNAUTHORIZED);
            }
        }
    } catch (error) {
        next(error);
    }
}
