FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3847
ENV SHIFT_HAPPENS_CONFIG_DIR=/data

EXPOSE 3847

CMD ["node", "src/server/api-server.js"]
