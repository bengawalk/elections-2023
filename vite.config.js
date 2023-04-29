import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: resolve(__dirname),
  publicDir: resolve(__dirname, "public"),
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
      },
    },
    outDir: resolve(__dirname, "dist"),
  },
  plugins: [],
});
