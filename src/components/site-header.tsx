import { Link } from "@tanstack/react-router";
import { Heart, Search, Sparkles, Moon, Sun, Languages } from "lucide-react";
import { useLocale, useTheme } from "@/lib/app-providers";

export function SiteHeader() {
  const { t } = useLocale();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:h-16 sm:px-6">
        <Link to="/" className="group flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl gavel-gradient shadow-[0_8px_24px_-10px_var(--primary)] transition group-hover:scale-105">
            <Heart className="h-4 w-4 text-white" strokeWidth={2.5} fill="currentColor" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-base font-bold tracking-tight sm:text-lg">
              Drama Court
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              {t("nav.tagline")}
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1.5 text-sm">
          <LanguageToggle />
          <ThemeToggle />
          <Link
            to="/browse"
            activeProps={{ className: "text-foreground bg-secondary" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-secondary/70" }}
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 transition sm:inline-flex"
          >
            <Search className="h-3.5 w-3.5" /> {t("nav.browse")}
          </Link>
          <Link
            to="/submit"
            className="inline-flex items-center gap-1.5 rounded-full gavel-gradient px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_-10px_var(--primary)] transition hover:scale-[1.03] sm:px-4 sm:py-2 sm:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5" /> {t("nav.open")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="group grid h-9 w-9 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:text-foreground hover:scale-105"
    >
      <span className="relative h-4 w-4">
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
        />
      </span>
    </button>
  );
}

function LanguageToggle() {
  const { locale, toggle } = useLocale();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle language"
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 text-xs font-semibold text-foreground transition hover:scale-105"
    >
      <Languages className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-display tracking-tight">{locale === "en" ? "EN" : "বাং"}</span>
    </button>
  );
}