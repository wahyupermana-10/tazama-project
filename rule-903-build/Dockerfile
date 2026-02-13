# SPDX-License-Identifier: Apache-2.0
# Rule 903 - Large Transaction Detection

FROM node:20-alpine

WORKDIR /home/app

# Copy package files first
COPY package*.json ./
COPY .npmrc ./

# Install ALL dependencies (including devDependencies for build)
ARG GH_TOKEN
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Runtime config
ENV NODE_ENV=production
ENV FUNCTION_NAME="rule-903-rel-1-0-0"
ENV RULE_VERSION="1.0.0"
ENV RULE_NAME="903"
ENV MAX_CPU=1
ENV APM_ACTIVE=false

# Database
ENV CONFIGURATION_DATABASE=configuration
ENV CONFIGURATION_DATABASE_HOST=postgres
ENV CONFIGURATION_DATABASE_USER=postgres
ENV CONFIGURATION_DATABASE_PASSWORD=unused
ENV EVENT_HISTORY_DATABASE=event_history
ENV EVENT_HISTORY_DATABASE_HOST=postgres
ENV EVENT_HISTORY_DATABASE_USER=postgres
ENV EVENT_HISTORY_DATABASE_PASSWORD=unused
ENV RAW_HISTORY_DATABASE=raw_history
ENV RAW_HISTORY_DATABASE_HOST=postgres
ENV RAW_HISTORY_DATABASE_USER=postgres
ENV RAW_HISTORY_DATABASE_PASSWORD=unused

# Cache
ENV LOCAL_CACHETTL=300
ENV LOCAL_CACHE_ENABLED=true

# NATS
ENV STARTUP_TYPE=nats
ENV SERVER_URL=nats:4222

# Logging
ENV LOG_LEVEL=info

CMD ["node", "build/index.js"]
