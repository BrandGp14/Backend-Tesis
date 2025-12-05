import { createTransport } from 'nodemailer'
import { mapFileOrExpressFileToAttachmentNodemailer } from './file.util'

export async function sendEmail({
    to,
    subject,
    body,
    isHtml = false,
    files = []
}: { to: string | string[], subject: string, body: string, isHtml?: boolean, files?: File[] | Express.Multer.File[] }) {

    const transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    const attachments = await Promise.all(files.map(async (file: File | Express.Multer.File) => await mapFileOrExpressFileToAttachmentNodemailer(file)))

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: isHtml ? body : undefined,
            text: !isHtml ? body : undefined,
            attachments: attachments.length > 0 ? attachments : undefined
        })
    } catch (e) {
        console.log(e)
        return { success: false, message: e.message }
    }

    return { success: true }
}
