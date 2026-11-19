import { join } from "node:path";

import type { NestExpressApplication } from "@nestjs/platform-express";
import type { NextFunction, Request, Response } from "express";

// Paths the API owns: a browser opening one of these is not asking for a page of the app.
const API_PATHS = /^\/(api|docs|health|socket\.io)(\/|$)/;

/**
 * Serves the built web app from `dir`, so the app and the API share one address: the session cookie stays
 * first-party and there is no cross-origin traffic. Files are served as they are, and a browser asking for any
 * other address of the app (a deep link, a reload) gets `index.html`, which routes on the client.
 *
 * Call it before the API routes are registered (that is, before `listen`).
 */
export function serveWeb(app: NestExpressApplication, dir: string) {
  app.useStaticAssets(dir, {
    index: false,
    setHeaders: (res: Response, path: string) => {
      // file names under assets/ carry a content hash, so they never change
      res.setHeader(
        "Cache-Control",
        path.includes("assets")
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      );
    },
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    const wantsPage = req.headers.accept?.includes("text/html") ?? false;
    const reading = req.method === "GET" || req.method === "HEAD";
    if (!reading || !wantsPage || API_PATHS.test(req.path)) return next();
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(join(dir, "index.html"));
  });
}
