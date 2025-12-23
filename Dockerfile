# https://www.tomray.dev/nestjs-docker-production

###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:24-alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

RUN npm ci --legacy-peer-deps

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:24-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

# Build app, prune dev dependencies, and generate Prisma client
RUN npx prisma generate && \ 
    npm run build && \
    npm ci --omit=dev --legacy-peer-deps 

USER node

###################
# PRODUCTION
###################

FROM node:24-alpine AS production

# Install dumb-init for proper signal handling (PID 1)
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only necessary files from build stage
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/config ./config
COPY --chown=node:node --from=build /usr/src/app/templates ./templates
COPY --chown=node:node --from=build /usr/src/app/prisma/schema.prisma ./prisma/schema.prisma
COPY --chown=node:node --from=build /usr/src/app/prisma/migrations ./prisma/migrations
COPY --chown=node:node startup.sh ./

# Create logs directory with proper ownership and make startup script executable
RUN mkdir -p logs && chown node:node logs && chmod +x ./startup.sh

USER node

EXPOSE 9002

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "startup.sh"]
