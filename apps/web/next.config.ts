import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@npfs/core', '@npfs/types'],
  output: 'standalone',
};

export default nextConfig;
