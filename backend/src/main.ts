import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (Angular default: 4200)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global request validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('OpsTrack CMMS API')
    .setDescription('Enterprise Computerized Maintenance Management System API specification')
    .setVersion('1.0')
    .addTag('Assets', 'Physical equipment and machinery lifecycle management')
    .addTag('Work Orders', 'Maintenance tasks, Kanban board, and stock consumption')
    .addTag('Maintenance Schedules', 'Preventative maintenance rules and automated triggers')
    .addTag('Spare Parts', 'Inventory levels, pricing, and threshold alerts')
    .addTag('Technicians', 'Technician profiles and active assignment metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`OpsTrack Backend is running on: http://localhost:${port}`);
  logger.log(`Swagger OpenAPI Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
