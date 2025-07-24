import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build configuration
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          bootstrap: ["bootstrap"],
          icons: ["react-icons"],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Development server configuration
  server: {
    port: 3000,
    host: "0.0.0.0",
    open: true,
    proxy: {
      // Proxy API requests to backend during development
      "/api": {
        target: "https://localhost:7042", // DriveZone.Server HTTPS port
        changeOrigin: true,
        secure: false, // Allow self-signed certificates in development
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Proxying:", req.method, req.url);
          });
        },
      },
    },
  },

  // Preview server configuration
  preview: {
    port: 3000,
    host: "0.0.0.0",
  },

  // Environment variables
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __APP_NAME__: JSON.stringify("DriveZone"),
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/styles/variables.scss";`,
      },
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@services": "/src/services",
      "@utils": "/src/utils",
      "@styles": "/src/styles",
      "@assets": "/src/assets",
    },
  },

  // Optimizations
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "bootstrap", "axios"],
  },

  // Public base path
  base: "/",

  // Asset handling
  assetsInclude: [
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.svg",
    "**/*.ico",
    "**/*.webp",
  ],
});
