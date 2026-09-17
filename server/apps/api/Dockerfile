FROM node:22-alpine AS build
WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json

RUN npm install

COPY packages/shared packages/shared
COPY apps/api apps/api
COPY test/fixtures/fake-ocr test/fixtures/fake-ocr

RUN npm run build --workspace @chefvision/shared && npm run build --workspace @chefvision/api

FROM node:22-alpine
WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/src/ui ./apps/api/src/ui
COPY --from=build /app/test/fixtures/fake-ocr ./test/fixtures/fake-ocr

CMD ["node", "apps/api/dist/server.js"]
