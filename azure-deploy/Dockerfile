# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port (Azure will map it)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
