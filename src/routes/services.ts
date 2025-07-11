import { Router } from 'express';

import { ServiceController } from '../controllers/serviceController';
import { toRoute } from '../helpers/toRoute';
import { authorization } from '../middlewares/authorization';
import { setRoles } from '../middlewares/setRoles';
import { RouteOptions } from '../types/routeoptions';

export default (route: Router) => {
    const serviceController: ServiceController = ServiceController.initialize();
    const trackServiceAvailability = serviceController.trackServiceAvailability.bind(serviceController);

    const serviceRouter: RouteOptions[] = [
        {
            method: 'get',
            path: '/services/availability',
            action: trackServiceAvailability,
            description: 'create session',
            roles: [],
        },
    ];

    serviceRouter.forEach(routeConfig => {
        toRoute(route, routeConfig, [setRoles(routeConfig.roles), authorization, routeConfig.action]);
    });

    return route;
};
