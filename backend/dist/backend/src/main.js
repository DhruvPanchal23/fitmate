"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const logger_service_1 = require("./common/logger.service");
const logging_interceptor_1 = require("./interceptors/logging.interceptor");
const http_exception_filter_1 = require("./filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: logger_service_1.logger,
    });
    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
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