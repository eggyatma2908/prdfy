# Stage 1: Build the TypeScript application
FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL required by Prisma schema engine on Alpine
RUN apk update && apk add --no-cache openssl libc6-compat

# Install dependencies first for caching
COPY package*.json ./
RUN npm ci

# Copy database schema and generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the source code and compile TS to JS
COPY . .
RUN npm run build

# Stage 2: Runtime image
FROM node:22-alpine AS runner

WORKDIR /app

# Install OpenSSL required by Prisma schema engine on Alpine
RUN apk update && apk add --no-cache openssl libc6-compat

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and regenerate the client for production runtime
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built code and entrypoint script from builder
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./

# Adjust line endings for Windows compatibility and set execute permissions
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
