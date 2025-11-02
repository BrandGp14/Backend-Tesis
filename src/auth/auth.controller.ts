import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import type { Session } from 'src/users/dto/user-google.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Session, @Res() res: Response) {
    try {
      const result = await this.authService.validateOAuthLogin(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      
      // Codificar los datos en base64 para pasarlos en la URL de forma segura
      const authDataBase64 = Buffer.from(JSON.stringify(result)).toString('base64');
      const authDataEncoded = encodeURIComponent(authDataBase64);
      
      // Crear página HTML que redirige al frontend con los datos en la URL
      // El frontend leerá los datos de la URL y los guardará en localStorage
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Autenticación exitosa</title>
        </head>
        <body>
          <script>
            const frontendUrl = '${frontendUrl}';
            const authData = '${authDataEncoded}';
            
            // Intentar postMessage si es ventana popup
            if (window.opener) {
              try {
                const decodedData = JSON.parse(atob(decodeURIComponent(authData)));
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  data: decodedData
                }, frontendUrl);
                window.close();
              } catch (e) {
                // Si falla, redirigir con datos en URL
                window.location.href = frontendUrl + '/auth/callback?authData=' + authData;
              }
            } else {
              // Redirección normal con datos en la URL
              // El frontend leerá authData de la URL y lo guardará en localStorage
              window.location.href = frontendUrl + '/auth/callback?authData=' + authData;
            }
          </script>
          <p>Redirigiendo...</p>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlResponse);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const errorBase64 = Buffer.from(JSON.stringify({ message: errorMessage })).toString('base64');
      const errorDataEncoded = encodeURIComponent(errorBase64);
      
      // Página HTML para errores
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error de autenticación</title>
        </head>
        <body>
          <script>
            const frontendUrl = '${frontendUrl}';
            const errorData = '${errorDataEncoded}';
            
            if (window.opener) {
              try {
                const decodedError = JSON.parse(atob(decodeURIComponent(errorData)));
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_ERROR',
                  error: decodedError
                }, frontendUrl);
                window.close();
              } catch (e) {
                window.location.href = frontendUrl + '/auth/callback?error=true&errorData=' + errorData;
              }
            } else {
              // Redirigir con error en la URL
              // El frontend leerá errorData de la URL y lo guardará en localStorage como authError
              window.location.href = frontendUrl + '/auth/callback?error=true&errorData=' + errorData;
            }
          </script>
          <p>Error en la autenticación. Redirigiendo...</p>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.status(401).send(errorHtml);
    }
  }
}
