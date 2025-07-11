import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest } from '../helpers/validateRequest';
import { OperationalService } from '../services/operationalService';
import { BaseController } from './baseController';

export class ServiceController extends BaseController {
    public static instance: ServiceController;
    private operationalService: OperationalService;

    constructor() {
        super();
        this.operationalService = new OperationalService();
    }

    public static initialize() {
        if (!ServiceController.instance) {
            ServiceController.instance = new ServiceController();
        }
        return ServiceController.instance;
    }

    async trackServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [body('expose_credits').isBoolean().withMessage('Invalid expose credits').optional()]);

            const { expose_credits = true } = req.body;
            const status = await this.operationalService.serviceStatus({ expose_credits });
            this.ok(res, status);
        } catch (error) {
            next(error);
        }
    }
}
