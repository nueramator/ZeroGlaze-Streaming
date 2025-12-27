/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
  images: {
    domains: ['static-cdn.jtvnw.net', 'yt3.ggpht.com'], // Twitch and YouTube profile images
  },
}

module.exports = nextConfig
