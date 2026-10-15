// jarayon.html ni lokal serverda ochish uchun oddiy statik server: node scripts/serve.mjs → http://localhost:4173/jarayon.html
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 4173;
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".md": "text/plain",
  ".json": "application/json",
  ".css": "text/css",
};

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const file = join(ROOT, path === "/" ? "jarayon.html" : path);
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": (TYPES[extname(file)] || "application/octet-stream") + "; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("topilmadi");
  }
}).listen(PORT, "127.0.0.1", () => console.log(`http://localhost:${PORT}/jarayon.html`));
