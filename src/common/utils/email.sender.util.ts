import { createTransport } from 'nodemailer';
import { mapFileOrExpressFileToAttachmentNodemailer } from './file.util';

export async function sendEmail({
    to,
    subject,
    body,
    isHtml = false,
    files = []
}: { 
    to: string | string[], 
    subject: string, 
    body: string, 
    isHtml?: boolean, 
    files?: File[] | Express.Multer.File[] 
}) {
    console.log('📧 [EMAIL] Preparing to send email');
    console.log('📧 [EMAIL] From (system):', process.env.EMAIL_USER);  // ← Remitente
    console.log('📧 [EMAIL] To (user):', to);  // ← Destinatario
    console.log('📧 [EMAIL] Subject:', subject);
    console.log('📧 [EMAIL] isHtml:', isHtml);
    console.log('📧 [EMAIL] EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured');
    console.log('📧 [EMAIL] EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configured' : '❌ Not configured');

    // Validar credenciales
    if (! process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        const error = 'Missing EMAIL_USER or EMAIL_PASS in environment variables';
        console.error('❌ [EMAIL]', error);
        return { success: false, message:  error };
    }

    // ✅ SOLUCIÓN AL ERROR DE DNS:  Usar "service:  gmail"
    const transporter = createTransport({
        service:  'gmail',  // ✅ Esto evita el problema de DNS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS. replace(/\s/g, '')
        }
    });

    const attachments = await Promise.all(
        files.map(async (file: File | Express. Multer.File) => 
            await mapFileOrExpressFileToAttachmentNodemailer(file)
        )
    );

    try {
        console. log('📤 [EMAIL] Sending email from', process.env.EMAIL_USER, 'to', to);
        
        const info = await transporter.sendMail({
            from: `"WasiRifa System" <${process.env. EMAIL_USER}>`,  // ← De: yorsh.flores@tecsup.edu.pe
            to,  // ← Para: pietronicolasgomezpariona@gmail.com
            subject,
            html:  isHtml ? body : undefined,
            text: !isHtml ? body : undefined,
            attachments: attachments.length > 0 ? attachments : undefined
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