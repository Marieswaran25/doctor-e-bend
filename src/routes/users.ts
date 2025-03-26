import { Router } from 'express';

import { UserController } from '../controllers/userController';
import { toRoute } from '../helpers/toRoute';
import { RouteOptions } from '../types/routeoptions';

export default (route: Router) => {
    const userController = UserController.initialize();
    const createNewUser = userController.createNewUser.bind(userController);
    const getAllUsers = userController.getAllUsers.bind(userController);

    const userRouter: RouteOptions[] = [
        {
            method: 'post',
            path: '/users',
            action: createNewUser,
            description: 'Create a new user',
            roles: [],
        },
        {
            method: 'get',
            path: '/users',
            action: getAllUsers,
            description: 'Get all users',
            roles: [],
        },
    ];

    userRouter.forEach(routeConfig => {
        toRoute(route, routeConfig, [routeConfig.action]);
    });

    return route;
};
