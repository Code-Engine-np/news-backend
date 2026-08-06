"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("tsconfig-paths/register");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("../src/app.module");
const server = (0, express_1.default)();
let bootstrapPromise = null;
async function bootstrap() {
    const adapter = new platform_express_1.ExpressAdapter(server);
    const app = await core_1.NestFactory.create(app_module_1.AppModule, adapter);
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
        exposedHeaders: ['X-New-Access-Token', 'X-New-Refresh-Token'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    });
    app.use((0, cookie_parser_1.default)());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('News Backend API')
        .setDescription('API for multilingual news content, users, categories, tags, and engagement data.')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.init();
}
async function handler(req, res) {
    if (!bootstrapPromise) {
        bootstrapPromise = bootstrap();
    }
    await bootstrapPromise;
    server(req, res);
}
//# sourceMappingURL=index.js.map