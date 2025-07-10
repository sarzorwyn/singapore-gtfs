# Stage 1: Build TypeScript
FROM node:24-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npx tsc

# Stage 2: Runtime container
FROM node:24-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY data ./data

CMD ["node", "dist/index.js"]
