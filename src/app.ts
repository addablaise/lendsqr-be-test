import express from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// Global middleware
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// TODO: mount /api/v1/users, /api/v1/wallets, etc.

export default app;
