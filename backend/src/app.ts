import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { ProviderRouterError } from "./lib/provider-router.js";
import { QueueFullError } from "./lib/request-queue.js";
import { config } from "./config.js";

const app: Express = express();

// Trust first proxy in production (Nginx, Railway, Render, Cloudflare, etc.)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security headers - MUST be first middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,  // SSE needs this off
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  } : false,
  hsts: process.env.NODE_ENV === "production"
    ? { maxAge: 31536000, includeSubDomains: true }
    : false,
}));

// gzip compression — cuts RAG payload size 60-70% for mobile users
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    // Don't compress SSE streams — chunked encoding handles that
    if (req.headers.accept === "text/event-stream") return false;
    return compression.filter(req, res);
  },
}));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Permissive CORS for local development (BYOK headers come from same-origin proxy)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : process.env.NODE_ENV === "production"
    ? []  // block all if not configured in prod
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  credentials: true,
  origin: (origin, cb) => {
    // allow server-to-server (no origin) and SSE from same host
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    if (process.env.NODE_ENV !== "production") return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
}));

// Reduced body limits for security - 512KB default
app.use(express.json({ limit: "512kb" }));
app.use(express.urlencoded({ extended: true, limit: "512kb" }));

// Rate limiting middleware
const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_GENERAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests", code: "rate_limited" },
  skip: (req) => req.path === "/api/healthz",
});

const researchLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_RESEARCH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `${req.ip}_${req.headers["x-forwarded-for"] ?? ""}`;
  },
  message: { error: "Research rate limit exceeded. Please wait before submitting another run.", code: "research_rate_limited" },
});

// Apply general limiter to all /api routes
app.use("/api", generalLimiter);

// Apply research limiter to messages endpoint (main research trigger)
app.use("/api/anthropic/conversations/:id/messages", researchLimiter);

app.use("/api", router);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  req.log?.error?.({ err }, "Unhandled request error");

  const statusCode =
    err instanceof QueueFullError
      ? 429
      : err instanceof ProviderRouterError
        ? err.statusCode
        : typeof (err as { statusCode?: unknown })?.statusCode === "number"
          ? ((err as { statusCode: number }).statusCode)
          : typeof (err as { status?: unknown })?.status === "number"
            ? ((err as { status: number }).status)
            : 500;

  const errorCode =
    err instanceof QueueFullError
      ? err.code
      : err instanceof ProviderRouterError
        ? err.code
        : typeof (err as { code?: unknown })?.code === "string"
          ? ((err as { code: string }).code)
          : statusCode >= 500
            ? "internal_error"
            : "request_error";

  const message =
    err instanceof Error && err.message
      ? err.message
      : "Internal server error";

  res.status(statusCode).json({
    error: message,
    code: errorCode,
    requestId: (req as any).id ?? null,  // pino-http sets req.id
  });
});

export default app;
