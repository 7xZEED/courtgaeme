import { Link } from "@tanstack/react-router";
import { Heart, Sparkles, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/app-providers";
import { CATEGORIES } from "@/lib/categories";

export function SiteFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Glowing top divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)" }}
      />
      {/* Soft gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 10% 0%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 55%), radial-gradient(ellipse at 90% 100%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 55%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6">
        {/* Big shimmer wordmark */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5">
            <span className="absolute inset-0 -z-10 grid place-items-center">
              <span className="h-16 w-16 rounded-full bg-primary/30 blur-2xl animate-float" />
            </span>
            <span className="grid h-14 w-14 place-items-center rounded-2xl gavel-gradient shadow-[0_18px_40px_-16px_var(--primary)] pulse-ring animate-float">
              <Heart className="h-6 w-6 text-white" strokeWidth={2.5} fill="currentColor" />
            </span>
          </div>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-shimmer sm:text-6xl">
            Drama Court
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{t("footer.tag")}</p>

          <Link
            to="/submit"
            className="group mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("hero.cta.open")}
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Courtroom chips */}
        <div className="mt-12">
          <div className="mb-3 text-center text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
            {t("footer.courts")}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to="/court/$slug"
                params={{ slug: c.slug }}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition hover:-translate-y-0.5 hover:text-foreground"
                style={{ boxShadow: `inset 0 0 0 0 ${c.accentVar}` }}
              >
                <span className="text-sm transition group-hover:scale-110">{c.badge}</span>
                <span>{c.short}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p className="max-w-md text-center sm:text-left">{t("footer.legal")}</p>
          <p className="inline-flex items-center gap-1.5">
            {t("footer.made")} <Heart className="h-3 w-3 animate-pulse text-primary" fill="currentColor" /> · © {year}
          </p>
        </div>
      </div>
    </footer>
  );
}