import { Router } from 'express';

import { UserController } from '../controllers/userController';
import { toRoute } from '../helpers/toRoute';
import { authorization } from '../middlewares/authorization';
import { setRoles } from '../middlewares/setRoles';
import { RouteOptions } from '../types/routeoptions';

export default (route: Router) => {
    const userController = UserController.initialize();
    const createNewUser = userController.createNewUser.bind(userController);
    const basicLoginAuth = userController.basicLoginAuth.bind(userController);
    const loginWithGoogle = userController.loginWithGoogle.bind(userController);
    const refresh = userController.rotateRefreshToken.bind(userController);
    const logout = userController.logout.bind(userController);
    const getMe = userController.getMe.bind(userController);
    const getAllUsers = userController.getAllUsers.bind(userController);
    const createAdminUser = userController.createAdminUser.bind(userController);

    const userRouter: RouteOptions[] = [
        {
            method: 'post',
            path: '/users',
            action: createNewUser,
            description: 'register a new user',
            roles: [],
        },
        {
            method: 'post',
            path: '/login',
            action: basicLoginAuth,
            description: 'sign in',
            roles: [],
        },
        {
            method: 'post',
            path: '/sign-in/google',
            action: loginWithGoogle,
            description: 'Sign in as new user / sign up with google',
            roles: [],
        },
        {
            method: 'get',
            path: '/users/me',
            action: getMe,
            description: 'Get current user',
            roles: ['user'],
        },
        {
            method: 'post',
            path: '/refresh',
            action: refresh,
            description: 'rotate refresh token',
            roles: [],
        },
        {
            method: 'post',
            path: '/logout',
            action: logout,
            description: 'rotate refresh token',
            roles: [],
        },
        {
            method: 'get',
            path: '/users',
            action: getAllUsers,
            description: 'Get all users',
            roles: ['root', 'super-admin', 'admin'],
        },
        {
            method: 'post',
            path: '/users/admin',
            action: createAdminUser,
            description: 'create users',
            roles: ['root', 'super-admin'],
        },
    ];

    userRouter.forEach(routeConfig => {
        toRoute(route, routeConfig, [setRoles(routeConfig.roles), authorization, routeConfig.action]);
    });

    return route;
};
