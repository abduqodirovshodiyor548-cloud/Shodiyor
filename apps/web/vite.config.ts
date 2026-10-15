import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  const serverPort = Number(env.SERVER_PORT) || 4310;
  return {
    envDir: root,
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: {
      host: "127.0.0.1",
      port: Number(env.WEB_PORT) || 5173,
      strictPort: true,
      proxy: { "/api": { target: `http://127.0.0.1:${serverPort}`, changeOrigin: true } },
    },
  };
});
