import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
import { PrismaClient } from '@prisma/client';
import { PrismaClientOptions } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaService extends PrismaClient<PrismaClientOptions, 'query' | 'error'> implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger('PrismaService');

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      // this.$on('query', (event) => {
      //   console.log('Query: ' + event.query);
      //   console.log('Duration: ' + event.duration + 'ms');
      // });
      this.$on('error', (event) => {
        this.logger.verbose(event.target);
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.verbose('Prisma disconnected');
  }

  // async enableShutdownHooks(app: INestApplication) {
  //   this.$on('beforeExit', async () => {
  //     await app.close();
  //   });
  // }
}
