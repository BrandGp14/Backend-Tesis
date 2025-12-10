import { createTransport } from 'nodemailer'
import { mapFileOrExpressFileToAttachmentNodemailer } from './file.util'
import { Injectable } from '@nestjs/common'

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

    const transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    const fileAttachments = await Promise.all(files.map(async (file: File | Express.Multer.File) => await mapFileOrExpressFileToAttachmentNodemailer(file)))
    
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
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: isHtml ? body : undefined,
            text: !isHtml ? body : undefined,
            attachments: allAttachments.length > 0 ? allAttachments : undefined
        })
    } catch (e) {
        console.log(e)
        return { success: false, message: e.message }
    }

    return { success: true }
}
