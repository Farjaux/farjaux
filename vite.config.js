// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  // Explicitly set the base for clarity (root deployment on Cloudflare Pages)
  base: "/",

  server: { open: true },

  build: {
    outDir: "dist",
    // (Optional) emit assets into a predictable folder
    assetsDir: "assets",
  },

  // (Optional but helpful for Phaser in some setups)
  optimizeDeps: { include: ["phaser"] },
  define: { "process.env": {} },
});
