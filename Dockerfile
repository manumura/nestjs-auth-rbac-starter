# https://www.tomray.dev/nestjs-docker-production

###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM oven/bun:alpine AS development

WORKDIR /usr/src/app

COPY --chown=bun:bun package*.json bun.lock* ./
COPY --chown=bun:bun prisma ./prisma/

RUN bun install --frozen-lockfile

COPY --chown=bun:bun . .

USER bun

###################
# BUILD FOR PRODUCTION
###################

FROM oven/bun:alpine AS build

WORKDIR /usr/src/app

COPY --chown=bun:bun package*.json bun.lock* ./
COPY --chown=bun:bun --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=bun:bun . .

# Build app, prune dev dependencies, and generate Prisma client
RUN bunx prisma generate && \ 
    bun run build && \
    bun install --frozen-lockfile --production 

USER bun

###################
# PRODUCTION
###################

FROM oven/bun:alpine AS production

# Install dumb-init for proper signal handling (PID 1)
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only necessary files from build stage
COPY --chown=bun:bun --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=bun:bun --from=build /usr/src/app/dist ./dist
COPY --chown=bun:bun --from=build /usr/src/app/config ./config
COPY --chown=bun:bun --from=build /usr/src/app/templates ./templates
COPY --chown=bun:bun --from=build /usr/src/app/prisma/schema.prisma ./prisma/schema.prisma
COPY --chown=bun:bun --from=build /usr/src/app/prisma/migrations ./prisma/migrations
COPY --chown=bun:bun startup.sh ./

# Create logs directory with proper ownership and make startup script executable
RUN mkdir -p logs && chown bun:bun logs && chmod +x ./startup.sh

USER bun

EXPOSE 9002

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "startup.sh"]
