import type { ComponentProps } from "react";
import { Link, type To } from "react-router";

import { Button } from "@repo/ui/components/button";

type ButtonLinkProps = Omit<
  ComponentProps<typeof Button>,
  "render" | "nativeButton"
> & { to: To };

/** A link that looks like a button: a real anchor, not a button that navigates. */
export function ButtonLink({ to, ...props }: ButtonLinkProps) {
  // Base UI marks a non-native button with role="button"; this one navigates, so it stays a link
  return (
    <Button
      nativeButton={false}
      render={<Link to={to} />}
      role="link"
      {...props}
    />
  );
}
