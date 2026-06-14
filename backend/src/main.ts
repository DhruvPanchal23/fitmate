import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { logger } from './common/logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  // Use our custom Winston logger for application startup and execution logs
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Expose REST endpoints only under '/api'
  app.setGlobalPrefix('api');

  // CORS support
  app.enableCors();

  // DTO validation & serialization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('FitMate API')
    .setDescription('FitMate Fitness & Nutrition Companion API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Server running on: http://localhost:${port}/api`, 'Bootstrap');
  logger.log(`Swagger documentation available at: http://localhost:${port}/docs`, 'Bootstrap');
}
bootstrap();
