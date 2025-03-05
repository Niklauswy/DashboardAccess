
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Any other Next.js configuration
  images: {
    domains: [], // Add any external domains if needed
    unoptimized: true, // This disables the image optimization for local images
  },
};

module.exports = nextConfig;