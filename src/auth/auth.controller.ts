import { Controller, Get, Req, UseGuards, Res, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import type { Session } from 'src/users/dto/user-google.dto';
import { EmailLoginDto } from './dto/email-login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterInstitutionalAdminDto } from './dto/register-institutional-admin.dto';
import { ApiResponse } from 'src/common/dto/api.response.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autenticación con Email y contraseña' })
  @ApiBody({ type: EmailLoginDto })
  async loginWithEmail(@Body() loginDto: EmailLoginDto) {
    try {
      const result = await this.authService.validateEmailLogin(loginDto);
      return ApiResponse.success(result);
    } catch (error) {
      return ApiResponse.error(error.message, 401);
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Registro de nuevo usuario (USUARIO)' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return ApiResponse.success(result);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  @Post('register-admin')
  @ApiOperation({ 
    summary: 'Registro de administrador supremo',
    description: 'Endpoint especial para crear usuarios con rol ADMINSUPREMO. Requiere clave secreta.' 
  })
  @ApiBody({ type: RegisterAdminDto })
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
    try {
      const result = await this.authService.registerAdmin(registerAdminDto);
      return ApiResponse.success(result);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  @Post('register-institutional-admin')
  @ApiOperation({ 
    summary: 'Registro de administrador institucional',
    description: 'Endpoint para crear usuarios con rol ADMIN en instituciones específicas.' 
  })
  @ApiBody({ type: RegisterInstitutionalAdminDto })
  async registerInstitutionalAdmin(@Body() registerDto: RegisterInstitutionalAdminDto) {
    try {
      const result = await this.authService.registerInstitutionalAdmin(registerDto);
      return ApiResponse.success(result);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Session, @Res() res: Response) {
    try {
      const result = await this.authService.validateOAuthLogin(req.user);
      // Leer FRONTEND_URL desde .env y normalizar (sin slash final)
      const frontendUrl = (process.env.FRONTEND_URL);
      
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
      // Leer FRONTEND_URL desde .env y normalizar (sin slash final)
      const frontendUrl = (process.env.FRONTEND_URL);
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
