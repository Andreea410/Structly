const withPWA = require("next-pwa")({
    dest: "public",
    disable: process.env.NODE_ENV === 'development', 
    register: true,
    skipWaiting: true,
  });
  
  module.exports = withPWA({
    reactStrictMode: true,
  });

  /** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        "socket.io-client": "socket.io-client/dist/socket.io.js",
      };
      return config;
    },
  };
  
  module.exports = nextConfig;
  