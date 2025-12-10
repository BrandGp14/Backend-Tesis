import { createTransport } from 'nodemailer';
import { mapFileOrExpressFileToAttachmentNodemailer } from './file.util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailSenderUtil {
  async sendEmail(options: {
    to: string | string[], 
    subject: string, 
    body: string, 
    isHtml?: boolean, 
    files?: File[] | Express.Multer.File[]
    attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
  }) {
    return sendEmail(options);
  }
}

export async function sendEmail({
    to,
    subject,
    body,
    isHtml = false,
    files = [],
    attachments = []
}: { 
    to: string | string[], 
    subject: string, 
    body: string, 
    isHtml?: boolean, 
    files?: File[] | Express.Multer.File[],
    attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
}) {
    console.log('📧 [EMAIL] Preparing to send email');
    console.log('📧 [EMAIL] From (system):', process.env.EMAIL_USER);
    console.log('📧 [EMAIL] To (user):', to);
    console.log('📧 [EMAIL] Subject:', subject);
    console.log('📧 [EMAIL] isHtml:', isHtml);
    console.log('📧 [EMAIL] EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured');
    console.log('📧 [EMAIL] EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configured' : '❌ Not configured');

    // Validar credenciales
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        const error = 'Missing EMAIL_USER or EMAIL_PASS in environment variables';
        console.error('❌ [EMAIL]', error);
        return { success: false, message: error };
    }

    // ✅ SOLUCIÓN AL ERROR DE DNS: Usar "service: gmail"
    const transporter = createTransport({
        service: 'gmail',  // ✅ Esto evita el problema de DNS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS.replace(/\s/g, '')
        }
    });

    const fileAttachments = await Promise.all(
        files.map(async (file: File | Express.Multer.File) => 
            await mapFileOrExpressFileToAttachmentNodemailer(file)
        )
    );
    
    // Combinar attachments de archivos y los directos
    const allAttachments = [
        ...fileAttachments,
        ...attachments.map(att => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType
        }))
    ];

    try {
        console.log('📤 [EMAIL] Sending email from', process.env.EMAIL_USER, 'to', to);
        
        const info = await transporter.sendMail({
            from: `"WasiRifa System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: isHtml ? body : undefined,
            text: !isHtml ? body : undefined,
            attachments: allAttachments.length > 0 ? allAttachments : undefined
        });

        console.log('✅ [EMAIL] Email sent successfully');
        console.log('📧 [EMAIL] Message ID:', info.messageId);
        console.log('📧 [EMAIL] Response:', info.response);

        return { success: true, messageId: info.messageId };
        
    } catch (e) {
        console.error('❌ [EMAIL] Failed to send email:', e);
        console.error('❌ [EMAIL] Error details:', {
            code: e.code,
            command: e.command,
            response: e.response,
            responseCode: e.responseCode
        });
        
        return { 
            success: false, 
            message: e.message || 'Unknown error sending email' 
        };
    }
}