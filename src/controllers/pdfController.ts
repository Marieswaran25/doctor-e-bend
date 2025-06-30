import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest } from '../helpers/validateRequest';
import { PdfService } from '../services/pdfService';
import { BaseController } from './baseController';

export class PdfController extends BaseController {
    public static instance: PdfController;
    private pdfService: PdfService;
    constructor() {
        super();
        this.pdfService = new PdfService();
    }

    public static initialize() {
        if (!PdfController.instance) {
            PdfController.instance = new PdfController();
        }
        return PdfController.instance;
    }

    public async generateReportPdf(req: Request, res: Response, next: NextFunction) {
        try {
            await validateRequest(req, [
                body('diagnosis').isString().withMessage('Invalid diagnosis').optional(),
                body('selectedTooth').isString().withMessage('Invalid selected tooth').optional(),
                body('image').isString().withMessage('Invalid image').optional(),
                body('reportType').isString().withMessage('Invalid report type').optional(),
            ]);

            const { diagnosis, selectedTooth = 'No Selection', image, reportType } = req.body;
            this.logger.info(`Generating pdf report`);
            const pdfBuffer = await this.pdfService.generatePdfFromStoredHtml('pdfReport', {
                name: 'Maries waran',
                diagnosis: diagnosis,
                selectedTooth,
                image,
                reportType,
            });
            this.logger.info(`Generated pdf report`);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="report-${new Date().getTime()}.pdf"`);
            return res.send(pdfBuffer);
        } catch (err) {
            next(err);
        }
    }
}
