import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/leads",
        destination: "/examples/layered-panel/lead",
        permanent: false,
      },
    ]
  },
}

export default nextConfig;
