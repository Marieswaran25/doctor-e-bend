import { NextFunction, Response } from 'express';
import { body, param, query } from 'express-validator';
import moment from 'moment';

import { Conversations } from '../entities/conversations';
import { Sessions } from '../entities/sessions';
import { validateRequest } from '../helpers/validateRequest';
import { CustomRequest } from '../types/customRequest';
import { BaseController } from './baseController';

export class ConversationController extends BaseController {
    public static instance: ConversationController;
    constructor() {
        super();
    }
    public static initialize() {
        if (!ConversationController.instance) {
            ConversationController.instance = new ConversationController();
        }
        return ConversationController.instance;
    }

    private formatConversation(conversations: Conversations[]) {
        const formattedConversations = conversations.map(conversation => {
            let parsed = {};
            try {
                if (conversation.conversation) {
                    parsed = JSON.parse(conversation.conversation);
                    if (Array.isArray(parsed)) {
                        parsed = {
                            messages: parsed,
                        };
                    }
                }
            } catch (error) {
                parsed = {
                    messages: [],
                };
            }
            return {
                ...conversation,
                conversation: parsed,
                createdAt: moment(conversation.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            };
        });
        return formattedConversations;
    }

    public async createConversationMessage(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [
                body('sessionId').isString().withMessage('Invalid session id'),
                body('userId').isString().withMessage('Invalid user id').optional(),
                body('message').isArray().withMessage('Invalid message'),
                body('externalConversationId').isString().withMessage('Invalid external session id').optional(),
            ]);

            const { message, externalConversationId, sessionId, userId = req?.user?.userId } = req.body;
            const existingSession = await Sessions.findOneBy({ id: sessionId });
            if (!existingSession) {
                return this.notFound(res, 'Session not found');
            }

            const conversation = await Conversations.create({
                sessionId: { id: sessionId },
                userId: { id: userId || req?.user?.userId },
                conversation: JSON.stringify({ messages: [...message] }),
                externalConversationId,
            }).save();

            this.created(res, {
                message: 'Conversation created successfully',
                ...conversation,
            });
        } catch (error) {
            next(error);
        }
    }

    public async getAllConversation(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [query('userId').isString().withMessage('Invalid user id').optional()]);
            const { userId } = req.query;
            if (!req?.user?.userId && !userId) {
                return this.unauthorized(res, 'cannot get userId');
            }

            const conversations = await Conversations.findBy({
                userId: { id: (userId as string) || req?.user?.userId },
            });

            const formattedConversations = this.formatConversation(conversations);
            this.ok(res, {
                conversations: [...formattedConversations],
            });
        } catch (error) {
            next(error);
        }
    }

    public async getConversationBySessionId(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [param('sessionId').isString().withMessage('Invalid session id')]);
            const { sessionId } = req.params;

            const conversations = await Conversations.findBy({
                sessionId: { id: sessionId },
            });
            const formattedConversations = this.formatConversation(conversations);

            this.ok(res, {
                conversations: [...formattedConversations],
            });
        } catch (error) {
            next(error);
        }
    }
}
