/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/schema-validation'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
