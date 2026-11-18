const SITE = "https://site.invalid";

/**
 * Where to go after signing in. The address comes from the URL, so it is untrusted: only a path on
 * this site is followed (with its query and hash), and anything that would leave it, such as
 * `https://other.example`, `//other.example`, `/\other.example` or `javascript:`, gives `fallback`.
 */
export function getSafeRedirect(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  try {
    // the URL parser applies the browser's own rules (backslashes, tabs, newlines, schemes)
    const url = new URL(value, SITE);
    if (url.origin !== SITE) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
