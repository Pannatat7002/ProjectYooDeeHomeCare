import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.CONFIG_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    CONFIG_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.CONFIG_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    CONFIG_NEXT_PUBLIC_SUPABASE_URL: process.env.CONFIG_NEXT_PUBLIC_SUPABASE_URL || 'https://tfqlrvktlbjxspwhtsii.supabase.co',
    CONFIG_NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.CONFIG_NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcWxydmt0bGJqeHNwd2h0c2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTQ2MTQsImV4cCI6MjEwNjE3MDYxNH0.vxu-GnTMhONykOnfy1tXrOAyaNDK8Svyn3uPFu8a56Q',
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 2592000, // แคชรูปที่แปลงแล้วบน CDN นาน 30 วัน ลดการดึงไฟล์ซ้ำจาก Supabase Storage
    deviceSizes: [640, 1080, 1920],
    imageSizes: [64, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tfqlrvktlbjxspwhtsii.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
