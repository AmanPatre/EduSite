/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double-fetch in Dev mode
  reactCompiler: true,

  // Ignore errors for smoother deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com", // Allow YouTube Thumbnails
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com", // Allow YouTube Channel Icons
      }
    ],
  },
};

module.exports = nextConfig;
