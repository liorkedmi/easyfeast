/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: {
      allowedOrigins: [],
    },
    serverMinification: false,
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
      {
        source: "/booking",
        destination: "/booking/menu/seasonal-specials",
        permanent: true,
      },
      {
        source: "/booking/menu",
        destination: "/booking/menu/seasonal-specials",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
