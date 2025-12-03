import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from 'prisma/generated/client';
import { appConfig } from '../src/config/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PrismaService');
  private readonly pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: appConfig.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    try {
      // await this.pool.connect();
      await this.$connect();
      this.logger.verbose('PostgreSQL connected via pg Pool');

      (this as PrismaClient<'query' | 'info' | 'warn' | 'error'>).$on('query', (e) => {
        this.logger.debug(`Query: ${e.query} | Duration: ${e.duration}ms`);
      });

      (this as PrismaClient<'query' | 'info' | 'warn' | 'error'>).$on('error', (e) => {
        this.logger.error(`Target: ${e.target} | Message: ${e.message}`);
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
    this.logger.verbose('Prisma disconnected');
  }
}
