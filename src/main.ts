import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { appConfig } from './config/config';
import { validateEnv } from './config/env.validation';
import { loggerOptions } from './config/logger.config';
import { HttpExceptionFilter } from './shared/filter/http-exception-filter';
import { UserModule } from './user/user.module';
import cluster from 'cluster';
import * as process from 'node:process';

// TODO session in redis https://blog.logrocket.com/add-redis-cache-nestjs-app/
async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: WinstonModule.createLogger(loggerOptions),
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  logger.verbose(`Starting application with NODE_ENV: ${appConfig.NODE_ENV}`);

  validateEnv();

  await app.register(helmet);
  // Fastify file upload
  const options = {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 1000000, // Max field value size in bytes
      fields: 10, // Max number of non-file fields
      fileSize: 100000000, // For multipart forms, the max file size
      files: 1, // Max number of file fields
      headerPairs: 2000, // Max number of header key=>value pairs
    },
  };
  await app.register(multipart, options);
  // await app.register(multipart);

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

  // const prismaService = app.get(PrismaService);
  // await prismaService.enableShutdownHooks(app);

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

  // https://www.fastify.io/docs/latest/Guides/Getting-Started/#your-first-server
  await app.listen(port, '0.0.0.0');
  logger.verbose(`Application running on port ${port}, NODE_ENV: ${appConfig.NODE_ENV}`);
}

// Run in cluster mode
function clusterize(callback: () => void): void {
  const logger = new Logger('clusterize');
  const numCPUs = parseInt(process.argv[2] || '1');

  if (!cluster.isPrimary) {
    return callback();
  }

  logger.verbose(`MASTER SERVER (${process.pid}) IS RUNNING `);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
}

// clusterize(bootstrap);
bootstrap();
