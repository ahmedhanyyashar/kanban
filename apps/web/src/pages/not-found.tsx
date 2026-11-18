import { ButtonLink } from "@/components/button-link";
import { usePageTitle } from "@/hooks/use-page-title";

export function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <p
        aria-hidden
        className="text-gradient font-display text-8xl font-bold tracking-tight tabular-nums"
      >
        404
      </p>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="max-w-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <ButtonLink to="/">Back to the home page</ButtonLink>
    </main>
  );
}
