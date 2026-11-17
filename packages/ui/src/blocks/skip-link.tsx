/** First tab stop on a page: lets keyboard users jump past the navigation. Target needs the id. */
export function SkipLink({ href = "#main" }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lift focus:ring-2 focus:ring-ring"
    >
      Skip to main content
    </a>
  );
}
