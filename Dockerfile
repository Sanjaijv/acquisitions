FROM node:20-bookworm-slim AS base
WORKDIR /usr/src/app

FROM base AS deps
# Comment out the apt-get install entirely
# RUN apt-get update && apt-get install -y \
#     openssl \
#     ca-certificates \
#     && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
    npm ci; \
    else \
    npm install; \
    fi

FROM deps AS dev
COPY . .
CMD ["npm", "run", "dev"]