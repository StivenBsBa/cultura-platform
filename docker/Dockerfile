FROM node:24-bookworm-slim AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid 10001 cultura \
  && useradd \
  --uid 10001 \
  --gid cultura \
  --create-home \
  --shell /usr/sbin/nologin \
  cultura


FROM base AS deps

COPY package*.json ./

RUN npm ci


FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY package*.json ./

COPY . .

RUN DATABASE_URL="postgresql://cultura:cultura@postgres:5432/cultura_platform?schema=public" \
  npm run db:generate

RUN DATABASE_URL="postgresql://cultura:cultura@postgres:5432/cultura_platform?schema=public" \
  npm run build


FROM base AS bootstrap

COPY --from=deps /app/node_modules ./node_modules

COPY --chown=cultura:cultura package*.json ./

COPY --chown=cultura:cultura prisma ./prisma

COPY --chown=cultura:cultura scripts ./scripts

COPY --chown=cultura:cultura lib ./lib

COPY --chown=cultura:cultura tsconfig.json ./

COPY --chown=cultura:cultura prisma.config.ts ./

RUN chmod +x scripts/docker-bootstrap.sh

RUN DATABASE_URL="postgresql://cultura:cultura@postgres:5432/cultura_platform?schema=public" \
  npm run db:generate

USER cultura

CMD ["/app/scripts/docker-bootstrap.sh"]


FROM base AS runner

ENV NODE_ENV=production

ENV PORT=3000

ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=cultura:cultura /app/public ./public

COPY --from=builder --chown=cultura:cultura /app/.next/standalone ./

COPY --from=builder --chown=cultura:cultura /app/.next/static ./.next/static

USER cultura

EXPOSE 3000

CMD ["node", "server.js"]