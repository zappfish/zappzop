/// <reference types="vite/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  base: import.meta.env.VITE_BASE_PATH || "/",
  test: {
    include: ["tests/**/test_*.ts"],
    environment: "node",
  },
});
