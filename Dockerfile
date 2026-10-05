FROM node:22-alpine

WORKDIR /app

# Copy workspace package definitions
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# Install workspace dependencies for shared and server
RUN npm ci --workspace=@poseplease/shared --workspace=@poseplease/server

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

ENV PORT=2567
ENV NODE_ENV=production

EXPOSE 2567

CMD ["npm", "run", "start", "--workspace=@poseplease/server"]
