import { NextFunction, Request, Response } from 'express';

import { CustomError } from '../helpers/customErrors';
import logger from '../helpers/logger';

export const globalErrorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction): void => {
    try {
        const status: number = error.status || 500;
        const message: string = error.message || 'Internal Server Error';
        logger.error(JSON.stringify({ error_code: status, error_message: message }), req.headers['x-correlation-id'] as string);
        res.status(status).json({ error_code: status, error_message: message });
    } catch (err) {
        next(err);
    }
};
