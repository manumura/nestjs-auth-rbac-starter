# https://www.tomray.dev/nestjs-docker-production

###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine AS development
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
RUN npm ci --legacy-peer-deps
COPY --chown=node:node . .
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force 
USER node

###################
# PRODUCTION
###################

FROM node:18-alpine AS production
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/config ./config
COPY --chown=node:node --from=build /usr/src/app/templates ./templates

CMD [ "node", "dist/src/main.js" ]
