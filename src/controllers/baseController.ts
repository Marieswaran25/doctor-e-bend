import { Response } from 'express';

import logger, { Logger } from '../helpers/logger';
import { STATUSCODES } from '../types/statusCodes';

export interface BaseControllerAttributes {
    logger: Logger;
    badRequest: (res: Response, message: string) => void;
    internalServerError: (res: Response, message: string) => void;
    notFound: (res: Response, message: string) => void;
    conflict: (res: Response, message: string) => void;
    forbidden: (res: Response, message: string) => void;
    created: (res: Response, json: Record<string, any>) => void;
    ok: (res: Response, json: Record<string, any>) => void;
    accepted: (res: Response, json: Record<string, any>) => void;
    noContent: (res: Response) => void;
    tryCall: (action: () => Promise<void>) => Promise<void>;
}

export class BaseController implements BaseControllerAttributes {
    public logger: Logger;
    constructor() {
        this.logger = logger;
    }
    async tryCall(action: () => Promise<void>): Promise<void> {
        try {
            await action();
        } catch (err: any) {
            this.logger.error(JSON.stringify(err));
            throw err;
        }
    }

    public badRequest(res: Response, message: string) {
        return res.status(STATUSCODES.BAD_REQUEST).json({ error_code: STATUSCODES.BAD_REQUEST, error_message: message });
    }

    public internalServerError(res: Response, message: string) {
        return res.status(STATUSCODES.INTERNAL_SERVER_ERROR).json({ error_code: STATUSCODES.INTERNAL_SERVER_ERROR, error_message: message });
    }

    public notFound(res: Response, message: string) {
        return res.status(STATUSCODES.NOT_FOUND).json({ error_code: STATUSCODES.NOT_FOUND, error_message: message });
    }

    public conflict(res: Response, message: string) {
        return res.status(STATUSCODES.CONFLICT).json({ error_code: STATUSCODES.CONFLICT, error_message: message });
    }

    public forbidden(res: Response, message: string) {
        return res.status(STATUSCODES.FORBIDDEN).json({ error_code: STATUSCODES.FORBIDDEN, error_message: message });
    }

    public created<T extends Record<string, any>>(res: Response, json: T) {
        return res.status(STATUSCODES.CREATED).json({ ...json });
    }

    public ok<T extends Record<string, any>>(res: Response, json: T) {
        return res.status(STATUSCODES.OK).json({ ...json });
    }

    public accepted<T extends Record<string, any>>(res: Response, json: T) {
        return res.status(STATUSCODES.ACCEPTED).json({ ...json });
    }

    public noContent(res: Response) {
        return res.status(STATUSCODES.NO_CONTENT).json();
    }
}
