/**
 * Governance & Best Practices
 *
 * This index file exports public APIs following repository boundaries.
 *
 * Constitution (Article 4): Incremental Delivery
 * - Export only what's needed, keep APIs small and focused
 * - Each export should be independently testable
 *
 * Principles:
 * - Respect Boundaries by Default (P13): Follow import direction rules
 * - Consistency Beats Novelty (P15): Match existing index patterns
 * - Naming Matters (P21): Use clear, descriptive export names
 *
 * Best Practices:
 * - Export types, functions, and components that are part of public API
 * - Re-export from subdirectories to provide clean import paths
 * - Group related exports logically
 * - Document complex exports with JSDoc
 *
 * See: .repo/policy/BOUNDARIES.md for import rules
 * See: .repo/policy/constitution.json for governance
 */
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import * as fs from "fs";
import * as path from "path";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  // Token optimization: Use INDEX.json files to find major functions/classes/relevant sections
  // Governance: CORS Configuration
  // Constitution (Article 6): Safety Before Speed
  // - CORS misconfiguration is a security risk
  // - Changes to CORS require security review (Article 8: HITL for External Systems)
  //
  // Principles:
  // - Prefer Guardrails Over Heroics (P11): Use explicit allowlists, not wildcards
  // - Risk Triggers a Stop (P10): CORS changes block merge until reviewed
  //
  // Best Practices:
  // - Only allow specific origins (never "*")
  // - Use environment variables for allowed domains
  // - Allow localhost only in development
  // - Document CORS policy in security docs

  app.use((req, res, next) => {
    const origins = new Set<string>();

    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d: string) => {
        origins.add(`https://${d.trim()}`);
      });
    }

    const origin = req.header("origin");

    // Allow localhost origins for Expo web development (any port)
    // Governance: Localhost allowed for development only
    // Principle P9: Assumptions Must Be Declared - assumes dev environment
    const isLocalhost =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:");

    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  // Add size limits to prevent memory exhaustion attacks
  app.use(
    express.json({
      limit: "10mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ limit: "10mb", extended: false }));
}

/** Maximum length for response data in logs to prevent excessive log size */
const MAX_RESPONSE_LOG_LENGTH = 100;

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      // Log API request with structured metadata
      logger.info("API request", {
        method: req.method,
        path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        response: capturedJsonResponse
          ? JSON.stringify(capturedJsonResponse).substring(
              0,
              MAX_RESPONSE_LOG_LENGTH,
            )
          : undefined,
      });
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  logger.debug("URL configuration", { baseUrl, expsUrl });

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "apps",
    "api",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();

  logger.info("Serving static Expo files with dynamic manifest routing");

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  logger.info("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application) {
  // Use the custom error handler from middleware
  app.use(errorHandler);
}

(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  configureExpoAndLanding(app);

  const server = await registerRoutes(app);

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      logger.info("Server started", { port, host: "0.0.0.0" });
    },
  );
})();
