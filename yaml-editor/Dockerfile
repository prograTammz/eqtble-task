# Use an official node runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Set environment variables
ENV PORT 3000

# Expose port 3000
EXPOSE 3000

# Start the React app
CMD ["serve", "-s", "build"]
