/**
 * Document Converter Service
 * Handles conversion of Word documents (.doc, .docx) to PDF format
 * 
 * TODO: Implement backend API endpoint
 * Endpoint: POST /api/documents/convert-to-pdf
 * Request: FormData with file
 * Response: PDF Blob
 * 
 * Backend implementation options:
 * 1. LibreOffice (libreoffice --headless --convert-to pdf)
 * 2. Pandoc (pandoc input.docx -o output.pdf)
 * 3. Python libraries: python-docx + reportlab, docx2pdf
 * 4. Node.js: libre-office-convert, officegen
 * 5. Commercial APIs: CloudConvert, Zamzar, ConvertAPI
 */

import client from './client';

export interface ConversionResponse {
    success: boolean;
    pdfBlob?: Blob;
    error?: string;
}

/**
 * Convert Word document to PDF
 * @param file - Word document file (.doc or .docx)
 * @returns PDF blob for preview
 */
export const convertWordToPdf = async (file: File): Promise<Blob> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);

        // TODO: Replace with actual backend endpoint
        const response = await client.post<Blob>('/documents/convert-to-pdf', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob',
        });

        return response.data;
    } catch (error) {
        console.error('Document conversion error:', error);
        throw new Error('Failed to convert document to PDF. Please ensure the backend conversion service is running.');
    }
};

/**
 * Check if conversion service is available
 */
export const checkConversionService = async (): Promise<boolean> => {
    try {
        // TODO: Implement health check endpoint
        const response = await client.get('/documents/conversion-status');
        return response.data.available === true;
    } catch (error) {
        console.warn('Conversion service not available:', error);
        return false;
    }
};
