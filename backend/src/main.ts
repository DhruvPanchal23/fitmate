import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { logger } from './common/logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { SanitizationPipe } from './common/sanitization.pipe';
import { json, urlencoded } from 'express';
import { ConfigurationValidator } from './config/configuration-validator';
import { MetricsEngineService } from './health/metrics-engine.service';

async function bootstrap() {
  // Validate secrets at start
  const validator = new ConfigurationValidator();
  if (!validator.validate()) {
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // 1. HTTP Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self' 'unsafe-inline'");
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // 2. Body Payload Size Limits
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.setGlobalPrefix('api');

  // 3. CORS Configuration
  app.enableCors({
    origin: '*', // in production, replace with whitelist or environment variable
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 4. Global Pipes (Validation & Custom Sanitization)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
    new SanitizationPipe(),
  );

  const metrics = app.get(MetricsEngineService);
  app.useGlobalInterceptors(new LoggingInterceptor(metrics));
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
