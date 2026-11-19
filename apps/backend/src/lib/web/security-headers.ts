import helmet from "helmet";

/**
 * The security headers for every response, the app's pages included: helmet's defaults (scripts and requests
 * from this origin only, no objects, HTTPS only, no content sniffing), with pictures allowed from any HTTPS
 * address (avatars) and the page kept out of every frame.
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'"],
      "frame-ancestors": ["'none'"],
    },
  },
  frameguard: { action: "deny" },
});
