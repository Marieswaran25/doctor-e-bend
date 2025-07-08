import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import moment from 'moment';

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
                body('diagnosis').isString().withMessage('Invalid diagnosis'),
                body('selectedTooth').isString().withMessage('Invalid selected tooth'),
                body('image').isString().withMessage('Invalid image'),
                body('reportType').isString().withMessage('Invalid report type'),
                body('name').isString().withMessage('Invalid name'),
                body('age').isNumeric().withMessage('Invalid age'),
            ]);

            const { diagnosis, selectedTooth = 'No Selection', image, reportType, name, age } = req.body;
            this.logger.info(`Generating pdf report`);
            const pdfBuffer = await this.pdfService.generatePdfFromStoredHtml('diagnosis-report', {
                diagnosis: diagnosis,
                selectedTooth,
                image,
                reportType,
                name,
                age,
                patientId: `PID-${new Date().getTime()}`,
                date: moment().format('DD-MM-YYYY HH:mm:ss').toString(),
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
