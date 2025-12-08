# 🎯 WasiRifa Backend - API REST para Gestión de Rifas Institucionales

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

## 📋 Descripción del Proyecto

**WasiRifa Backend** es la API REST que potencia la plataforma de gestión de rifas institucionales para universidades e instituciones educativas. Desarrollada con **NestJS** y **TypeScript**, proporciona una arquitectura robusta, segura y escalable para manejar usuarios, instituciones, rifas, pagos y reportes.

### 🎯 Características Principales
- **Sistema de Roles**: 4 niveles jerárquicos (SUPERADMIN, ADMIN, ORGANIZER, USER)
- **Autenticación**: JWT + Google OAuth 2.0
- **Base de Datos**: PostgreSQL con TypeORM
- **Documentación**: Swagger/OpenAPI automática
- **Seguridad**: Guards basados en roles, validación de DTOs
- **Archivos**: Upload y gestión con Multer

## 🏗️ Arquitectura de Módulos

### Módulos Principales
- **AuthModule**: Autenticación JWT y Google OAuth
- **RafflesModule**: Gestión de rifas, boletos y sorteos
- **InstitutesModule**: Administración de instituciones y departamentos
- **UsersModule**: Gestión de usuarios y roles
- **PaymentModule**: Procesamiento y seguimiento de pagos
- **ReportModule**: Generación de reportes y métricas
- **UploadFileModule**: Gestión de archivos e imágenes

### Entidades Principales
- **User**: Usuarios del sistema con roles
- **Institution**: Instituciones educativas
- **Raffle**: Rifas con premios múltiples
- **RaffleNumber**: Números de rifa individuales
- **Payment**: Transacciones y pagos
- **Ticket**: Boletos de participación

## ⚙️ Configuración del Entorno

### Variables de Entorno (.env)
```env
# Base de datos
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT y autenticación
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Servidor
PORT=8080
```

## 🚀 Instalación y Ejecución

### Instalación de Dependencias
```bash
npm install
```

### Ejecutar en Desarrollo
```bash
# Servidor con hot reload
npm run start:dev

# El servidor estará disponible en http://localhost:8080
```

### Build de Producción
```bash
# Compilar TypeScript
npm run build

# Ejecutar en producción
npm run start:prod
```

### Linting y Formateo
```bash
# Ejecutar ESLint
npm run lint

# Formatear código con Prettier
npm run format
```

## 🧪 Testing

```bash
# Pruebas unitarias
npm run test

# Pruebas en modo watch
npm run test:watch

# Pruebas end-to-end
npm run test:e2e

# Cobertura de pruebas
npm run test:cov
```

## 📚 API Documentation

La documentación de la API está disponible automáticamente mediante Swagger:

- **Desarrollo**: http://localhost:8080/api/docs
- **Producción**: [Deployed URL]/api/docs

### Endpoints Principales

#### Autenticación
- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/google` - Login con Google OAuth
- `POST /api/auth/register` - Registro de usuarios

#### Rifas
- `GET /api/raffles` - Listar rifas activas
- `POST /api/raffles` - Crear nueva rifa (ORGANIZER)
- `GET /api/raffles/:id` - Detalles de rifa específica
- `POST /api/raffles/:id/purchase` - Comprar boletos

#### Usuarios
- `GET /api/users/profile` - Perfil del usuario actual
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users/history` - Historial de participaciones

#### Pagos
- `POST /api/payments/confirm` - Confirmar pago manual
- `GET /api/payments/status/:id` - Estado de pago

## 🔐 Sistema de Roles y Permisos

### SUPERADMIN (wasirifa.com)
- Gestión global del sistema
- Administración de todas las instituciones
- Configuraciones globales

### ADMIN (por institución)
- Gestión de departamentos
- Asignación de organizadores
- Reportes institucionales

### ORGANIZER (por departamento)
- Creación y gestión de rifas
- Confirmación de pagos
- Sorteos y reportes

### USER (estudiantes)
- Participación en rifas
- Compra de boletos
- Historial personal

## 🛡️ Seguridad

### Guards Implementados
- **JwtAuthGuard**: Verificación de tokens JWT
- **RolesGuard**: Autorización basada en roles
- **GoogleAuthGuard**: Autenticación OAuth

### Validación
- **DTOs**: Validación de datos de entrada
- **Pipes**: Transformación y sanitización
- **Filters**: Manejo de excepciones globales

## 📊 Base de Datos

### Configuración PostgreSQL
```typescript
// src/config/database.config.ts
{
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false, // Usar migraciones en producción
  ssl: {
    rejectUnauthorized: false
  }
}
```

### Migraciones (Recomendado para producción)
```bash
# Generar migración
npm run migration:generate -- --name=CreateInitialTables

# Ejecutar migraciones
npm run migration:run
```

## 🚀 Deployment

### Variables de Entorno para Producción
- Configurar `DATABASE_URL` con PostgreSQL en la nube
- Establecer `JWT_SECRET` seguro
- Configurar OAuth con dominios de producción
- Deshabilitar `synchronize` en TypeORM

### Docker (Opcional)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

## 📈 Monitoreo y Logs

### Health Check
- `GET /api/health` - Estado del servidor y base de datos

### Logs
Los logs se configuran automáticamente con diferentes niveles:
- **Error**: Errores críticos del sistema
- **Warn**: Advertencias importantes
- **Info**: Información general
- **Debug**: Información detallada (solo desarrollo)

## 🔧 Desarrollo

### Estructura de Carpetas
```
src/
├── auth/              # Módulo de autenticación
├── config/            # Configuraciones
├── entities-module/   # Entidades compartidas
├── institutes/        # Gestión de instituciones
├── raffles/           # Gestión de rifas
├── users/             # Gestión de usuarios
├── payment/           # Sistema de pagos
├── report/            # Generación de reportes
├── upload-file/       # Gestión de archivos
└── main.ts           # Punto de entrada
```

### Convenciones
- Usar DTOs para validación de entrada
- Implementar guards para autorización
- Documentar endpoints con decoradores Swagger
- Seguir principios SOLID y Clean Architecture

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:
- Crear issue en el repositorio
- Revisar documentación en CLAUDE.md
- Consultar logs de la aplicación

## 📄 Licencia

Proyecto académico - Uso interno/educativo
