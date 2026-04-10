import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client.js';
import { appConfig } from '../config/app.config.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PrismaService');
  // private readonly pool: Pool;

  constructor() {
    // const pool = new Pool({
    //   connectionString: appConfig.DATABASE_URL,
    // });
    const adapter = new PrismaPg({
      connectionString: appConfig.DATABASE_URL,
      max: 10, // Optional: Set the maximum number of clients in the pool
      connectionTimeoutMillis: 5000, // Optional: Set a connection timeout
      idleTimeoutMillis: 10000, // Optional: Set an idle timeout
      maxLifetimeSeconds: 300, // Optional: Set a maximum lifetime for connections
    });
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
    // this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    try {
      // await this.pool.connect();
      await this.$connect();
      // Force a connection check with a simple query
      await this.$queryRaw`SELECT 1`;
      this.logger.verbose('PostgreSQL connected via pg Pool');

      (this as PrismaClient<'query' | 'info' | 'warn' | 'error'>).$on('query', (e) => {
        this.logger.debug(`Query: ${e.query} | Duration: ${e.duration}ms`);
      });

      (this as PrismaClient<'query' | 'info' | 'warn' | 'error'>).$on('error', (e) => {
        this.logger.error(`Target: ${e.target} | Message: ${e.message}`);
      });
    } catch (error) {
      this.logger.error('Error connecting to the database', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    // await this.pool.end();
    this.logger.verbose('Prisma disconnected');
  }
}
