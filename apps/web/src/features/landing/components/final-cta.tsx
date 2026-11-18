import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/button-link";

const EASE = [0.16, 1, 0.3, 1] as const;

export const FinalCTA = () => (
  <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-16 text-center sm:py-20"
    >
      {/* soft brand wash + faint geometry */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40rem 22rem at 50% -20%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-[2rem] border border-border" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rotate-6 rounded-3xl border border-border" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
          <Sparkles className="h-3.5 w-3.5" /> Start in seconds
        </span>
        <h2 className="mx-auto mt-6 max-w-2xl font-display text-[clamp(30px,4.5vw,50px)] font-semibold leading-[1.05] tracking-tight">
          Ready to <span className="text-gradient">ship faster?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Turn a goal into shipped work with an AI-native Kanban.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <ButtonLink to="/sign-up" size="lg">
            Get started <ArrowRight />
          </ButtonLink>
          <ButtonLink to="/sign-in" size="lg" variant="outline">
            Live demo
          </ButtonLink>
        </div>
      </div>
    </motion.div>
  </section>
);
