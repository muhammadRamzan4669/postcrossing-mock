import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { router as userRouter } from "./routes/users.js";
import { router as postcardRouter } from "./routes/postcards.js";
import { router as metaRouter } from "./routes/meta.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve static web folder
const staticDir = path.resolve(__dirname, "public");

// Middleware
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Permissive CORS for demo and local usage
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-user-id",
  );
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Serve static web UI
app.use(express.static(staticDir));
app.get("/", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

// Simple header-based "auth" for demo purposes
app.use((req, _res, next) => {
  const userId = req.header("x-user-id");
  if (userId) req.userId = userId;
  next();
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/postcards", postcardRouter);
app.use("/api/meta", metaRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Not Found" });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    ok: false,
    error: "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? String(err) : undefined,
  });
});

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/postcrossing_mock";
const PORT = process.env.PORT || 4000;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Mongo connected", MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server listening on :${PORT}`);
      console.log(`\n🚀 PostCrossing Mock is ready!`);
      console.log(`📱 Web Interface: http://localhost:${PORT}`);
      console.log(`🔍 API Health: http://localhost:${PORT}/api/meta/health`);
      console.log(`\n👥 Demo users: alice, bruno, cami, dave`);
      console.log(`💡 Open the web interface and use 'alice' as User ID`);
      console.log(`────────────────────────────────────────`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
    process.exit(1);
  });

export default app;
