import { Router } from 'express';

import { ConversationController } from '../controllers/conversationController';
import { SessionController } from '../controllers/sessionController';
import { toRoute } from '../helpers/toRoute';
import { authorization } from '../middlewares/authorization';
import { setRoles } from '../middlewares/setRoles';
import { RouteOptions } from '../types/routeoptions';

export default (route: Router) => {
    const sessionController = SessionController.initialize();
    const conversationController = ConversationController.initialize();
    const getConversationBySessionId = conversationController.getConversationBySessionId.bind(ConversationController);
    const createSession = sessionController.createSession.bind(sessionController);
    const closeSession = sessionController.closeSession.bind(sessionController);
    const getSession = sessionController.getSession.bind(sessionController);

    const sessionRouter: RouteOptions[] = [
        {
            method: 'post',
            path: '/sessions',
            action: createSession,
            description: 'create session',
            roles: ['root', 'user'],
        },
        {
            method: 'patch',
            path: '/sessions/:sessionId/end',
            action: closeSession,
            description: 'close session',
            roles: ['root', 'user'],
        },
        {
            method: 'get',
            path: '/sessions/:sessionId',
            action: getSession,
            description: 'get session',
            roles: [],
        },
        {
            method: 'get',
            path: '/sessions/:sessionId/conversations',
            action: getConversationBySessionId,
            description: 'get session',
            roles: [],
        },
    ];

    sessionRouter.forEach(routeConfig => {
        toRoute(route, routeConfig, [setRoles(routeConfig.roles), authorization, routeConfig.action]);
    });

    return route;
};
