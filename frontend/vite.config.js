import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Listen di semua network interfaces
    port: 5173, // ⬅️ DISARANKAN
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Backend lokal
        changeOrigin: true,
        secure: false,
        ws: true, // Enable websocket proxy
      },
    },
  },
});
