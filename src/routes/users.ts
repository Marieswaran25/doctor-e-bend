import { Router } from 'express';

import { UserController } from '../controllers/userController';
import { toRoute } from '../helpers/toRoute';
import { RouteOptions } from '../types/routeoptions';

export default (route: Router) => {
    const userController = UserController.initialize();
    const createNewUser = userController.createNewUser.bind(userController);

    const userRouter: RouteOptions[] = [
        {
            method: 'post',
            path: '/users',
            action: createNewUser,
            description: 'Create a new user',
            roles: [],
        },
    ];

    userRouter.forEach(routeConfig => {
        toRoute(route, routeConfig, [routeConfig.action]);
    });

    return route;
};
