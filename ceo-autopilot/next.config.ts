import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prototipo senza backend: si esporta come sito statico.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
