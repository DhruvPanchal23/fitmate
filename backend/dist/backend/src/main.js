"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const logger_service_1 = require("./common/logger.service");
const logging_interceptor_1 = require("./interceptors/logging.interceptor");
const http_exception_filter_1 = require("./filters/http-exception.filter");
const sanitization_pipe_1 = require("./common/sanitization.pipe");
const express_1 = require("express");
const configuration_validator_1 = require("./config/configuration-validator");
const metrics_engine_service_1 = require("./health/metrics-engine.service");
async function bootstrap() {
    const validator = new configuration_validator_1.ConfigurationValidator();
    if (!validator.validate()) {
        process.exit(1);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: logger_service_1.logger,
    });
    app.use((req, res, next) => {
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self' 'unsafe-inline'");
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });
    app.use((0, express_1.json)({ limit: '10mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '10mb' }));
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }), new sanitization_pipe_1.SanitizationPipe());
    const metrics = app.get(metrics_engine_service_1.MetricsEngineService);
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(metrics));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('FitMate API')
        .setDescription('FitMate Fitness & Nutrition Companion API Documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger_service_1.logger.log(`Server running on: http://localhost:${port}/api`, 'Bootstrap');
    logger_service_1.logger.log(`Swagger documentation available at: http://localhost:${port}/docs`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map