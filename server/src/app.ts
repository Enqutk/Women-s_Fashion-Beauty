import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";
import { createRateLimiter, securityHeaders } from "./middleware/security.middleware";
import apiRoutes from "./routes";

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: env.frontendUrl,
  }),
);
app.use(securityHeaders);
app.use(express.json({ limit: "100kb" }));
app.use(
  "/api",
  createRateLimiter({
    windowMs: 60_000,
    maxRequests: 240,
    keyPrefix: "api",
  }),
);
app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
