# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000
ENV HOST=0.0.0.0
ENV MONGODB_URI=mongodb+srv://adreeaandrada:xrO24h5WgOhg6WFu@cluster0.hkevjfh.mongodb.net/crud_db
ENV JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Start the application
CMD ["npm", "run", "dev"] 