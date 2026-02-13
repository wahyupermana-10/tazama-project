FROM node:20-alpine

WORKDIR /app

# Copy pre-built files and node_modules
COPY lib ./lib
COPY node_modules ./node_modules
COPY package*.json ./

# Set environment variables
ENV NODE_ENV=production

# Start the rule processor
CMD ["node", "lib/index.js"]
