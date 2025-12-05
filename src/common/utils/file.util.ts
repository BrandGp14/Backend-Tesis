import { Attachment } from "nodemailer/lib/mailer";

export async function mapFileOrExpressFileToAttachmentNodemailer(file: File | Express.Multer.File) {
    //case if file is a File
    if (file instanceof File) {
        return {
            filename: file.name,
            contentType: file.type,
            content: Buffer.from(await file.arrayBuffer()),

        } as Attachment
    }

    //case if file is a Express.Multer.File
    return {
        filename: file.originalname,
        contentType: file.mimetype,
        content: file.buffer
    } as Attachment
}