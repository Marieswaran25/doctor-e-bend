import { RequestHandler, Router } from 'express';

import { RouteOptions } from '../types/routeoptions';

export function toRoute(route: Router, options: RouteOptions, middlewares?: RequestHandler[]): any {
    const action = options.action;

    if (Array.isArray(middlewares) && middlewares.length > 0) {
        return route[options.method](options.path, ...middlewares, action);
    }

    return route[options.method](options.path, action);
}
