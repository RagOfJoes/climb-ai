# Specify the base image
FROM node:20.11.1

# Set the working directory inside the container
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Bundle app source inside Docker image
COPY . .

# Compile TypeScript to JavaScript
RUN pnpm run build

# Your app binds to port 5478 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 5478

# Define the command to run your app
CMD [ "node", "dist/index.js" ]