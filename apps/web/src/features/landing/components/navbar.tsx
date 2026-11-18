import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { ButtonLink } from "@/components/button-link";
import { authClient } from "@/lib/auth-client";
import { APP_HOME } from "@/lib/routes";

const navLinks = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["AI", "#ai"],
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // sync on mount in case the page loads already scrolled
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ease-spring ${
        scrolled ? "px-3 pt-3 sm:px-4" : "glass border-b border-border"
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-300 ease-spring ${
          scrolled
            ? "glass mt-3 max-w-5xl rounded-full border border-border px-5 py-2.5 shadow-soft"
            : "max-w-6xl px-6 py-3.5"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5 font-semibold">
          <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl shadow-brand">
            <Zap className="h-4.5 w-4.5 fill-white text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Flowboard
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <ButtonLink to={APP_HOME} size="sm">
              Open app
            </ButtonLink>
          ) : (
            <>
              <ButtonLink to="/sign-in" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink to="/sign-up" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
