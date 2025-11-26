import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface NiubizTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  created_at: number;
}

export interface NiubizCredentials {
  username: string;
  password: string;
  baseUrl: string;
}

@Injectable()
export class NiubizAuthService {
  private readonly logger = new Logger(NiubizAuthService.name);
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Obtiene las credenciales de Niubiz desde variables de entorno
   */
  private getNiubizCredentials(): NiubizCredentials {
    return {
      username: this.configService.get<string>('NIUBIZ_USERNAME', 'integraciones@niubiz.com.pe'),
      password: this.configService.get<string>('NIUBIZ_PASSWORD', '_7z3@8fF'),
      baseUrl: this.configService.get<string>('NIUBIZ_BASE_URL', 'https://apitestenv.vnforapps.com'),
    };
  }

  /**
   * Genera un token de acceso para Niubiz
   * Utiliza caché para evitar generar tokens innecesariamente
   */
  async getAccessToken(): Promise<string> {
    // Verificar si tenemos un token válido en caché
    if (this.tokenCache && this.isTokenValid()) {
      this.logger.debug('Usando token en caché');
      return this.tokenCache.token;
    }

    // Generar nuevo token
    this.logger.debug('Generando nuevo token de Niubiz');
    return await this.generateNewToken();
  }

  /**
   * Verifica si el token en caché aún es válido
   */
  private isTokenValid(): boolean {
    if (!this.tokenCache) return false;
    
    // Considerar el token como inválido 5 minutos antes de que expire
    const bufferTime = 5 * 60 * 1000; // 5 minutos en milisegundos
    return Date.now() < (this.tokenCache.expiresAt - bufferTime);
  }

  /**
   * Genera un nuevo token de acceso llamando al API de Niubiz
   */
  private async generateNewToken(): Promise<string> {
    const credentials = this.getNiubizCredentials();
    const tokenUrl = `${credentials.baseUrl}/api.security/v1/security`;

    try {
      // Preparar headers para autenticación básica
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      
      const response = await firstValueFrom(
        this.httpService.get<NiubizTokenResponse>(tokenUrl, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000, // 10 segundos timeout
        })
      );

      if (!response.data?.access_token) {
        throw new Error('Token no recibido en la respuesta');
      }

      // Guardar en caché
      this.tokenCache = {
        token: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in * 1000),
      };

      this.logger.log('Token de Niubiz generado exitosamente');
      return response.data.access_token;

    } catch (error) {
      this.logger.error('Error al generar token de Niubiz', error);
      
      if (error.response?.status === 401) {
        throw new HttpException(
          'Credenciales de Niubiz inválidas',
          HttpStatus.UNAUTHORIZED
        );
      }
      
      if (error.response?.status === 500) {
        throw new HttpException(
          'Error interno del servidor de Niubiz',
          HttpStatus.BAD_GATEWAY
        );
      }

      throw new HttpException(
        'Error al conectar con la pasarela de pagos',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Invalida el token en caché (útil para testing o errores de autenticación)
   */
  invalidateToken(): void {
    this.logger.debug('Invalidando token en caché');
    this.tokenCache = null;
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    const credentials = this.getNiubizCredentials();
    return !!(credentials.username && credentials.password && credentials.baseUrl);
  }

  /**
   * Obtiene información del token actual (sin exponer el token)
   */
  getTokenInfo(): { isValid: boolean; expiresAt?: Date } {
    if (!this.tokenCache) {
      return { isValid: false };
    }

    return {
      isValid: this.isTokenValid(),
      expiresAt: new Date(this.tokenCache.expiresAt),
    };
  }
}