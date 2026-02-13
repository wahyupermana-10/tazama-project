# Rule 904 - Rapid Transaction Detection
FROM node:20-alpine

WORKDIR /home/app

# Copy pre-built files
COPY build ./build
COPY node_modules ./node_modules
COPY package.json ./

ENV NODE_ENV=production
ENV FUNCTION_NAME="rule-904-rel-1-0-0"
ENV RULE_VERSION="1.0.0"
ENV RULE_NAME="904"
ENV MAX_CPU=1

# Database
ENV CONFIGURATION_DATABASE=configuration
ENV CONFIGURATION_DATABASE_HOST=postgres
ENV EVENT_HISTORY_DATABASE=event_history
ENV EVENT_HISTORY_DATABASE_HOST=postgres
ENV RAW_HISTORY_DATABASE=raw_history
ENV RAW_HISTORY_DATABASE_HOST=postgres

# NATS
ENV STARTUP_TYPE=nats
ENV SERVER_URL=nats:4222

# Logging
ENV LOG_LEVEL=info

CMD ["node", "build/index.js"]
