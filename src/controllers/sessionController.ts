import { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import moment from 'moment';

import { Conversations } from '../entities/conversations';
import { Sessions } from '../entities/sessions';
import { validateRequest } from '../helpers/validateRequest';
import { CustomRequest } from '../types/customRequest';
import { BaseController } from './baseController';

export class SessionController extends BaseController {
    public static instance: SessionController;
    constructor() {
        super();
    }
    public static initialize() {
        if (!SessionController.instance) {
            SessionController.instance = new SessionController();
        }
        return SessionController.instance;
    }

    public async createSession(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [body('externalSessionId').isString().withMessage('Invalid external session id'), body('userId').isString().withMessage('Invalid user id').optional()]);

            const { externalSessionId, userId } = req.body;

            const session = await Sessions.create({
                externalSessionId,
                userId: { id: userId || req?.user?.userId },
                startedAt: moment().toDate(),
                status: 'active',
                duration: 0,
                metadata: JSON.stringify({
                    activationTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                }),
            }).save();

            this.created(res, {
                message: 'Session created successfully',
                sessionId: session.id,
            });
        } catch (error) {
            next(error);
        }
    }

    public async closeSession(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [
                param('sessionId').isString().withMessage('Invalid session id'),
                body('message').isArray().withMessage('Invalid message'),
                body('externalConversationId').isString().withMessage('Invalid external session id').optional(),
            ]);

            const { sessionId } = req.params;
            const { message, externalConversationId } = req.body;

            const session = await Sessions.findOne({ where: { id: sessionId }, relations: ['userId'] });
            if (!session) {
                return this.notFound(res, 'Session not found');
            }
            const prevMetadata = session.metadata ? JSON.parse(session.metadata) : {};

            const endedAt = moment().toDate();
            const duration = moment().diff(session.startedAt, 'seconds');
            await Sessions.update(
                { id: sessionId },
                {
                    endedAt,
                    status: 'inactive',
                    duration,
                    metadata: JSON.stringify({
                        ...prevMetadata,
                        deactivationTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    }),
                },
            );
            let conversation = null;
            if (externalConversationId && message) {
                conversation = await Conversations.create({
                    sessionId: { id: sessionId },
                    userId: { id: session.userId.id || req?.user?.userId },
                    conversation: JSON.stringify({ messages: [...message] }),
                    externalConversationId,
                }).save();
            }
            this.created(res, {
                message: 'Session closed successfully',
                sessionId: session.id,
                startedAt: session.startedAt,
                endedAt,
                duration,
                timeInNotation: moment.duration(duration, 'seconds').humanize(),
                ...(conversation && { conversation }),
            });
        } catch (error) {
            next(error);
        }
    }

    public async getSession(req: Request, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [param('sessionId').isString().withMessage('Invalid session id')]);

            const { sessionId } = req.params;

            const session = await Sessions.findOneBy({ id: sessionId });
            if (!session) {
                return this.notFound(res, 'Session not found');
            }
            const duration = moment(session.endedAt || moment()).diff(session.startedAt, 'seconds');
            this.ok(res, {
                ...session,
                metadata: session.metadata ? JSON.parse(session.metadata) : {},
                duration,
                timeInNotation: moment.duration(duration, 'seconds').humanize(),
            });
        } catch (error) {
            next(error);
        }
    }
}
