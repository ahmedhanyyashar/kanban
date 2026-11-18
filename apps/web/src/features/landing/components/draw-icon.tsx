import { useInView } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useId, useRef } from "react";
import type { CSSProperties } from "react";

/**
 * Renders a lucide (outline) icon as two stacked layers:
 *  - a static, always-visible base stroke (baseClassName sets its color)
 *  - an animated stroke on top that continuously traces the path
 * The tracer defaults to the brand green gradient; pass `traceColor` for a
 * solid colour instead (e.g. on dark backgrounds).
 */
export const DrawIcon = ({
  icon: Icon,
  className = "",
  delay = 0,
  baseClassName = "text-muted-foreground/60",
  traceColor,
}: {
  icon: LucideIcon;
  className?: string;
  delay?: number;
  baseClassName?: string;
  traceColor?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const gradId = useId().replace(/:/g, "");
  const stroke = traceColor ?? `url(#${gradId})`;

  const style: CSSProperties & Record<`--${string}`, string> = {
    "--draw-delay": `${delay}s`,
    "--trace-stroke": stroke,
  };

  return (
    <span
      ref={ref}
      className="relative inline-grid place-items-center"
      style={style}
    >
      {/* brand-green gradient used by the tracer stroke */}
      {!traceColor && (
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand-400)" />
              <stop offset="55%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--brand-700)" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* static base outline */}
      <Icon className={`${className} ${baseClassName}`} />

      {/* animated tracer on top */}
      <Icon
        className={`icon-draw absolute inset-0 ${className}${inView ? " is-drawing" : ""}`}
      />
    </span>
  );
};
