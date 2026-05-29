/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/schema-validation'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
