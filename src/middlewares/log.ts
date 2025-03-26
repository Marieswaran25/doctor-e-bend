import { NextFunction, Request, Response } from 'express';

import logger from '../helpers/logger';

export function log(req: Request, res: Response, next: NextFunction) {
    logger.info(`Calling [ ${req.method.toUpperCase()} ] ${req.url} endpoint...`, req.headers['x-correlation-id'] as string);
    next();
}
