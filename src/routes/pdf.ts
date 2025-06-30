import { Router } from 'express';

import { PdfController } from '../controllers/pdfController';
import { toRoute } from '../helpers/toRoute';
import { RouteOptions } from '../types/routeoptions';

export default (route: Router) => {
    const pdfController = PdfController.initialize();
    const generateReportPdf = pdfController.generateReportPdf.bind(pdfController);

    const pdfRouter: RouteOptions[] = [
        {
            method: 'post',
            path: '/pdf/pdfReport',
            action: generateReportPdf,
            description: 'Generate pdf report',
            roles: [],
        },
    ];

    pdfRouter.forEach(routeConfig => {
        toRoute(route, routeConfig, [routeConfig.action]);
    });

    return route;
};
