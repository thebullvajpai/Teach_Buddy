import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getAIResponse } from "./aiService.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "32kb" }));

/* gzip/brotli. Loaded optionally so a forgotten `npm install` degrades to
   uncompressed responses instead of crashing the server on boot. */
let compression = null;
try {
  ({ default: compression } = await import("compression"));
} catch {
  console.warn("[teachbuddy] `compression` not installed — serving uncompressed. Run: npm install");
}
if (compression) app.use(compression());

/* The static root is the whole project folder, so server-side files have to be
   kept out of it explicitly. (`dotfiles: "deny"` below covers .env / .gitignore.) */
const BLOCKED = [
  /^\/data\//i,          // this folder: server.js + aiService.js
  /^\/scripts\//i,       // build tooling
  /^\/node_modules\//i,
  /^\/package(-lock)?\.json$/i
];

app.use((req, res, next) => {
  if (BLOCKED.some((re) => re.test(req.path))) return res.status(404).send("Not found");
  next();
});

app.use(
  express.static(ROOT, {
    dotfiles: "deny",
    etag: true,
    lastModified: true,
    setHeaders(res, filePath) {
      // Pages must revalidate so a redeploy is picked up straight away;
      // css/js/json can sit in the browser cache for an hour.
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600");
      }
    }
  })
);

app.post("/chat", async (req, res) => {
  try {
    const message =
      req.body && typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!message) return res.status(400).json({ error: "message is required" });

    const reply = await getAIResponse(message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI error" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TeachBuddy running on http://localhost:${PORT}`);
});
