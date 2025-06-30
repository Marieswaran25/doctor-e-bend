import fs from 'fs/promises';
import handlebars from 'handlebars';
import path from 'path';
import puppeteer, { PaperFormat } from 'puppeteer';

export type PdfOptions = {
    printBackground?: boolean;
    format?: PaperFormat;
};

export type HTMLTemplates = 'pdfReport';
export class PdfService {
    public async htmlToPdf(
        html: string,
        pdfOptions: PdfOptions = {
            format: 'A4',
            printBackground: true,
        },
    ) {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        await page.setContent(html);

        const pdfBuffer = await page.pdf({
            ...pdfOptions,
            margin: {
                top: '16px',
                bottom: '16px',
            },
        });

        await browser.close();
        return pdfBuffer;
    }

    public async compileHtmlHandlebars(htmlTemplate: HTMLTemplates, data: Record<string, any>): Promise<string> {
        const filePath = path.resolve(__dirname, '../templates/html', `${htmlTemplate}.html`);
        const html = await fs.readFile(filePath, 'utf-8');
        const template = handlebars.compile(html);

        return template(data);
    }

    public async generatePdfFromStoredHtml(
        htmlTemplate: HTMLTemplates,
        data: Record<string, any>,
        pdfOptions: PdfOptions = {
            format: 'A4',
            printBackground: true,
        },
    ) {
        const html = await this.compileHtmlHandlebars(htmlTemplate, data);
        return this.htmlToPdf(html, pdfOptions);
    }
}
