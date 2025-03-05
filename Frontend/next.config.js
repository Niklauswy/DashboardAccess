
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [], 
    unoptimized: true, // This disables the image optimization for local images
  },
};

module.exports = nextConfig;