import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  output: "standalone",
  // The app is part of a pnpm monorepo; include workspace packages but not
  // the full repository in the runtime image.
  outputFileTracingRoot: path.resolve(appDir, "../.."),
};

export default nextConfig;
