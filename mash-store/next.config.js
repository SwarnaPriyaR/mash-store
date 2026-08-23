/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },
};

export default nextConfig;
