FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/normalizer/package.json apps/normalizer/package.json

RUN npm install

COPY packages/shared packages/shared
COPY apps/normalizer apps/normalizer

RUN npm run build --workspace @chefvision/shared && npm run build --workspace @chefvision/normalizer

FROM node:22-bookworm-slim
WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/apps/normalizer/dist ./apps/normalizer/dist
COPY --from=build /app/apps/normalizer/package.json ./apps/normalizer/package.json

CMD ["node", "apps/normalizer/dist/server.js"]
