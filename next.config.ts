import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["unsplash.com", "images.unsplash.com"],
  },
  
  // Proxy API calls to backend
  async rewrites() {
    // Use environment variable for backend URL, fallback to localhost for development
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
