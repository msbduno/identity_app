import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */

    // Configuration pour Turbopack (Next.js 16+)
    turbopack: {
        // Active le hot reload dans Docker avec Turbopack
        resolveAlias: {},
    },
};

export default nextConfig;