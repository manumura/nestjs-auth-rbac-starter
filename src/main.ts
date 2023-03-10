import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from './app.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { appConfig } from './config/config';
import { validateEnv } from './config/env.validation';
import { loggerOptions } from './config/logger.config';
import { HttpExceptionFilter } from './shared/filter/http-exception-filter';
import { UserModule } from './user/user.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: WinstonModule.createLogger(loggerOptions),
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  logger.verbose(`Starting application with NODE_ENV: ${appConfig.NODE_ENV}`);

  validateEnv();

  await app.register(helmet);

  app.enableCors({
    origin: appConfig.CORS_ALLOWED_ORIGNS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true, // use cookies
  });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.register(fastifyCookie, {
    secret: appConfig.COOKIE_SECRET,
  });

  // http://localhost:9002/swagger
  if (appConfig.NODE_ENV !== 'prod') {
    const options = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('NestJS starter')
      .setDescription('NestJS starter API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('swagger', app, document);
  }

  // This will cause class-validator to use the nestJS module resolution,
  // the fallback option is to spare ourselves from importing all the class-validator modules to nestJS
  useContainer(app.select(AuthenticationModule), { fallback: true, fallbackOnErrors: true });
  useContainer(app.select(UserModule), { fallback: true, fallbackOnErrors: true });

  const port = appConfig.SERVER_PORT;
  if (!port) {
    logger.error('Server Port is undefined');
    return;
  }

  await app.listen(port);
  logger.verbose(`Application running on port ${port}, NODE_ENV: ${appConfig.NODE_ENV}`);
}
bootstrap();
