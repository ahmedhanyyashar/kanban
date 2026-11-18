import type { ComponentProps } from "react";
import { Link, type To } from "react-router";

import { Button } from "@repo/ui/components/button";

type ButtonLinkProps = Omit<
  ComponentProps<typeof Button>,
  "render" | "nativeButton"
> & { to: To };

/** A link that looks like a button: a real anchor, not a button that navigates. */
export function ButtonLink({ to, ...props }: ButtonLinkProps) {
  return <Button nativeButton={false} render={<Link to={to} />} {...props} />;
}
