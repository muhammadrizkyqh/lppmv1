import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false, // Disable source maps in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Disable experimental features that increase build size
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    // Increase body size limit for file uploads (default is ~1MB)
    // This allows uploads up to 50MB
    bodySizeLimit: '50mb',
  },
};

export default nextConfig;
