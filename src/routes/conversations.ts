import { Router } from 'express';

import { ConversationController } from '../controllers/conversationController';
import { toRoute } from '../helpers/toRoute';
import { authorization } from '../middlewares/authorization';
import { setRoles } from '../middlewares/setRoles';
import { RouteOptions } from '../types/routeoptions';

export default (route: Router) => {
    const conversationController = ConversationController.initialize();
    const createConversationMessage = conversationController.createConversationMessage.bind(conversationController);
    const getAllConversation = conversationController.getAllConversation.bind(conversationController);

    const conversationRouter: RouteOptions[] = [
        {
            method: 'post',
            path: '/conversations',
            action: createConversationMessage,
            description: 'create conversation',
            roles: ['root', 'user'],
        },

        {
            method: 'get',
            path: '/conversations',
            action: getAllConversation,
            description: 'get all conversations',
            roles: ['user'],
        },
    ];

    conversationRouter.forEach(routeConfig => {
        toRoute(route, routeConfig, [setRoles(routeConfig.roles), authorization, routeConfig.action]);
    });

    return route;
};
