import fs from 'fs/promises';
import handlebars from 'handlebars';
import htmlPdf from 'html-pdf';
import path from 'path';

export type PdfOptions = {
    format?: 'A4';
    printBackground?: boolean;
};

export type HTMLTemplates = 'pdfReport';

export class PdfService {
    public async htmlToPdf(html: string, pdfOptions: PdfOptions = { format: 'A4' }): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            htmlPdf.create(html, { format: pdfOptions.format || 'A4' }).toBuffer((err, buffer) => {
                if (err) return reject(err);
                resolve(buffer);
            });
        });
    }

    public async compileHtmlHandlebars(htmlTemplate: HTMLTemplates, data: Record<string, any>): Promise<string> {
        const filePath = path.resolve(__dirname, '../templates/html', `${htmlTemplate}.html`);
        const html = await fs.readFile(filePath, 'utf-8');
        const template = handlebars.compile(html);

        return template(data);
    }

    public async generatePdfFromStoredHtml(htmlTemplate: HTMLTemplates, data: Record<string, any>, pdfOptions: PdfOptions = { format: 'A4', printBackground: true }): Promise<Buffer> {
        const html = await this.compileHtmlHandlebars(htmlTemplate, data);
        return this.htmlToPdf(html, pdfOptions);
    }
}
