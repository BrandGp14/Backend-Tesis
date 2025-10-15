import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
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

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API corriendo en http://localhost:${port}/api/raffles`);
  console.log(`📚 Swagger docs en http://localhost:${port}/api/docs`);
}
bootstrap();