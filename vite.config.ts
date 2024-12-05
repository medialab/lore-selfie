import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    webExtension()
  ],
});