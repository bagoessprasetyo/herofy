/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    //   appDir: true,
    },
    images: {
      domains: [
        'dxepbnoagmdqlxeyybla.supabase.co', // Your Supabase storage domain
        'avatars.githubusercontent.com', // For GitHub avatars
        'lh3.googleusercontent.com', // For Google avatars
      ],
    },
    env: {
      CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
    // Enable strict mode for better development experience
    reactStrictMode: true,
    // Enable SWC minification for better performance
    swcMinify: true,
    // Optimize font loading
    optimizeFonts: true,
    // Security headers for production
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
          ],
        },
      ];
    },
  };
  
  module.exports = nextConfig;