# Build stage
FROM node:20-alpine AS builder

# Build argument to bust cache
ARG BUILD_DATE=unknown
RUN echo "Build date: $BUILD_DATE"

WORKDIR /app

# Copy package files and npm config
COPY package*.json .npmrc ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the application (frontend only)
RUN npm run build

# Verify server source exists
RUN ls -la server/src/

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and npm config
COPY package*.json .npmrc ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start the application
CMD ["npm", "start"]
