# syntax=docker/dockerfile:1

# Base image
FROM node:20-bookworm-slim AS base
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install dependencies in a separate layer
FROM base AS deps

# ------------------------------------------------------------
# 1) Convert Debian Bookworm Slim sources to HTTPS
# 2) Create temporary apt config to disable HTTPS verification
#    (only during build) so we can install ca-certificates.
# ------------------------------------------------------------
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources \
 && sed -i 's|http://security.debian.org|https://security.debian.org|g' /etc/apt/sources.list.d/debian.sources \
 \
 # create a temporary apt config that disables cert verification (removed later)
 && printf 'Acquire::https::Verify-Peer "false";\nAcquire::https::Verify-Host "false";\n' > /etc/apt/apt.conf.d/99disable-https-verify

# Install build tools and ca-certificates while verification is disabled,
# then remove the temp config to restore normal verification.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates \
      python3 \
      make \
      g++ \
 && rm -f /etc/apt/apt.conf.d/99disable-https-verify \
 && rm -rf /var/lib/apt/lists/*

# Now install node deps
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Development image
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production image
FROM base AS prod
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
COPY src ./src
COPY .env ./
EXPOSE 3000
CMD ["node", "src/index.js"]
