
import "dotenv/config";
import express from "express";
import cors from "cors";
import tracksRouter from "./routes/tracks";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "VibeSound API",
    message: "Backend berhasil berjalan!",
  });
});

app.use("/api/tracks", tracksRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: "Endpoint tidak ditemukan.",
  });
});

app.listen(PORT, () => {
  console.log(`VibeSound API berjalan di http://localhost:${PORT}`);
});
