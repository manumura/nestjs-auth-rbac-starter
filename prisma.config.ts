import { defineConfig } from 'prisma/config';
import { appConfig } from './src/config/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: appConfig.DATABASE_URL || '',
  },
});
