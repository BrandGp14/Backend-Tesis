import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApiExceptionResponseFilter } from './api.exception.response.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Normalize FRONTEND_URL from env (remove trailing slash)
  const frontendOrigin = (process.env.FRONTEND_URL);

  app.enableCors({
    origin: "http://localhost:3001",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'institution'],
  });

  app.setGlobalPrefix('api');

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('WasiRifa API')
    .setDescription('API para gestión de rifas, roles y permisos')
    .setVersion('1.0')
    .addBearerAuth() // Si usas JWT, esto es importante
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // La documentación estará en /api/docs

  app.useGlobalFilters(new ApiExceptionResponseFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API corriendo en http://localhost:${port}/api/raffles`);
  console.log(`📚 Swagger docs en http://localhost:${port}/api/docs`);
  //login url
  console.log(`📚 Login url in ${process.env.NEXT_AUTH_URL}`);
}
bootstrap();
