import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ipfs.io',
                port: '',
                pathname: '/ipfs/**',
            },
        ],
    },
};

module.exports = nextConfig;
