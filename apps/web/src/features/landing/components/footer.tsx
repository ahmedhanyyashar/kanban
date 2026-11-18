import { Zap, Layers } from "lucide-react";
import { Link } from "react-router";

const columns: { heading: string; links: [string, string][] }[] = [
  {
    heading: "Product",
    links: [
      ["Features", "#features"],
      ["How it works", "#how-it-works"],
      ["Built-in AI", "#ai"],
    ],
  },
  {
    heading: "Get started",
    links: [
      ["Log in", "/sign-in"],
      ["Create account", "/sign-up"],
      ["Live demo", "/sign-in"],
    ],
  },
];

const isRoute = (href: string) => href.startsWith("/");

export const Footer = () => (
  <footer className="border-t">
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* brand */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl shadow-brand">
              <Zap className="h-4.5 w-4.5 fill-white text-white" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Flowboard
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            The AI-native Kanban that turns goals into shipped work — planning
            less so your team ships more.
          </p>
        </div>

        {/* link columns */}
        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {col.heading}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  {isRoute(href) ? (
                    <Link
                      to={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* bottom bar */}
      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
        <span>
          © {new Date().getFullYear()} Flowboard. All rights reserved.
        </span>
        <a
          href="#top"
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <Layers className="h-4 w-4" /> Built with React, NestJS and PostgreSQL
        </a>
      </div>
    </div>
  </footer>
);
