import "dotenv/config";
import { normalizeApiKeys } from "./lib/normalize-keys.js";
normalizeApiKeys();

import app from "./app.js";
import { logger } from "./lib/logger.js";
import { type Server } from "node:http";

const rawPort = process.env["PORT"] || "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening on 0.0.0.0");
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;

// Track all SSE connections for graceful shutdown
const openConnections = new Set<import("node:http").ServerResponse>();

app.use((req, res, next) => {
  if (req.headers.accept === "text/event-stream") {
    openConnections.add(res);
    res.on("close", () => openConnections.delete(res));
    res.on("finish", () => openConnections.delete(res));
  }
  next();
});

function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Graceful shutdown initiated");

  // Send SSE shutdown event to all open streams
  for (const res of openConnections) {
    try {
      res.write('data: {"type":"server_shutdown","message":"Server restarting. Please retry."}\n\n');
      res.end();
    } catch {}
  }

  server.close((err) => {
    if (err) logger.error({ err }, "Error during server close");
    logger.info("HTTP server closed");
    process.exit(err ? 1 : 0);
  });

  // Force kill after 30s
  setTimeout(() => {
    logger.warn("Forced shutdown after 30s timeout");
    process.exit(1);
  }, 30_000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT",  () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception");
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled rejection");
});
