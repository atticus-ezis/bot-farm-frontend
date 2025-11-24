/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
  },
  // Allow cross-origin requests from localhost in development
  allowedDevOrigins: ['127.0.0.1', 'localhost']
};

module.exports = nextConfig;
