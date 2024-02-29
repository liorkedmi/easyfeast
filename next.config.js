/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    allowedOrigins: [],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.airtableusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/booking/menu/seasonal-specials",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
