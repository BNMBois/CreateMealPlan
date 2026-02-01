import express from "express";
import cors from "cors";
import scannerRoutes from "./routes/scanner.routes";

const app = express();

/**
 * ✅ SIMPLE, SAFE CORS
 * This alone is enough to handle preflight
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());

// Routes
app.use("/api/scanner", scannerRoutes);

// Health check
app.get("/", (_req, res) => {
  res.send("Backend running 🚀");
});

export default app;
