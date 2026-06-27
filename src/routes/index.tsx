import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense } from "react";
import { Heart, ArrowRight, Sparkles, Flame } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CaseCard } from "@/components/case-card";
import { CATEGORIES } from "@/lib/categories";
import { listCases } from "@/lib/cases.functions";
import type { CaseRow } from "@/lib/verdict";
import { useLocale } from "@/lib/app-providers";

function liveFeedQueryOptions() {
  return {
    queryKey: ["cases", "landing"],
    queryFn: () => listCases({ data: { sort: "new", limit: 9 } }),
    staleTime: 30_000,
  } as const;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drama Court — Settle the argument once and for all" },
      { name: "description", content: "Submit your relationship, family, group chat or gaming drama. AI judge delivers the verdict. The internet's most brutally honest courtroom." },
      { property: "og:title", content: "Drama Court — Settle the argument once and for all" },
      { property: "og:description", content: "The internet's most brutally honest courtroom. Get an AI verdict on your drama in seconds." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(liveFeedQueryOptions()),
  component: Landing,
  errorComponent: ({ error, reset }) => (
    <FallbackError message={error.message} reset={reset} />
  ),
  notFoundComponent: () => <div className="p-8">Not found.</div>,
});

function FallbackError({ message, reset }: { message: string; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="font-display text-2xl font-bold">The court is in recess</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <button onClick={reset} className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">Try again</button>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="courtroom-bg min-h-screen">
      <SiteHeader />
      <Hero />
      <Marquee />
      <Suspense fallback={<FeedSkeleton />}>
        <LiveFeed />
      </Suspense>
      <Categories />
      <HowItWorks />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  const { t } = useLocale();
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-20">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="grid h-1.5 w-1.5 animate-pulse place-items-center rounded-full bg-primary" />
            {t("hero.badge")}
          </div>

          <h1 className="font-display text-balance text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl md:text-[5.5rem]">
            {t("hero.title.a")}
            <br />
            <span className="relative inline-block">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(120deg, var(--primary), var(--gavel) 55%, var(--accent))" }}
              >
                {t("hero.title.b")}
              </span>
            </span>
          </h1>

          <p className="max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            {t("hero.sub")}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/submit"
              className="group inline-flex items-center gap-2 rounded-full gavel-gradient px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-16px_var(--primary)] transition hover:-translate-y-0.5"
            >
              <Heart className="h-4 w-4" fill="currentColor" />
              {t("hero.cta.open")}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
            >
              <Flame className="h-4 w-4" /> {t("hero.cta.browse")}
            </Link>
          </div>

          <dl className="grid max-w-md grid-cols-3 gap-4 pt-2 text-sm">
            <Stat k="6" v={t("hero.stat.courts")} />
            <Stat k="4" v={t("hero.stat.judges")} />
            <Stat k="∞" v={t("hero.stat.petty")} />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-display text-2xl font-bold">{k}</dt>
      <dd className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{v}</dd>
    </div>
  );
}

function Marquee() {
  const { tList } = useLocale();
  const items = tList("marquee.items");
  const all = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-card/30 py-3">
      <div className="marquee flex w-max gap-8 whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {all.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            <span className="text-primary">⚖</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function LiveFeed() {
  const { t } = useLocale();
  const fetcher = useServerFn(listCases);
  const { data } = useSuspenseQuery({
    queryKey: ["cases", "landing"],
    queryFn: () => fetcher({ data: { sort: "new", limit: 9 } }),
    staleTime: 30_000,
  });
  return <FeedSection cases={data} t={t} />;
}

function FeedSection({ cases, t }: { cases: CaseRow[]; t: (k: any) => string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.22em] text-primary">{t("feed.kicker")}</div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("feed.title")}</h2>
        </div>
        <Link to="/browse" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-flex sm:items-center sm:gap-1">
          {t("feed.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {cases.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}

function FeedSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl border border-border/60 bg-card/40" />
        ))}
      </div>
    </section>
  );
}

function EmptyFeed() {
  const { t } = useLocale();
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/30 p-10 text-center">
      <Heart className="mx-auto h-8 w-8 text-primary" fill="currentColor" />
      <h3 className="mt-3 font-display text-xl font-bold">{t("feed.empty.title")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("feed.empty.body")}</p>
      <Link to="/submit" className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">
        <Sparkles className="h-3.5 w-3.5" /> {t("feed.empty.cta")}
      </Link>
    </div>
  );
}

function Categories() {
  const { t } = useLocale();
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.22em] text-primary">{t("cat.kicker")}</div>
        <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{t("cat.title")}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.id}
              to="/court/$slug"
              params={{ slug: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition hover:-translate-y-0.5 hover:border-border"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
                style={{ background: c.accentVar }}
              />
              <div className="relative flex items-start justify-between gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${c.accentVar} 18%, transparent)`, color: c.accentVar }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-2xl">{c.badge}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{c.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: c.accentVar }}>
                {t("cat.enter")} <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useLocale();
  const steps = [
    { n: "01", title: t("how.s1.title"), body: t("how.s1.body") },
    { n: "02", title: t("how.s2.title"), body: t("how.s2.body") },
    { n: "03", title: t("how.s3.title"), body: t("how.s3.body") },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.22em] text-primary">{t("how.kicker")}</div>
        <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{t("how.title")}</h2>
      </div>
      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6">
            <div className="font-mono text-5xl font-bold text-muted-foreground/30">{s.n}</div>
            <h3 className="mt-2 font-display text-xl font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FinalCta() {
  const { t } = useLocale();
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
      <div
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-10 text-center sm:p-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, color-mix(in oklab, var(--accent) 28%, transparent), transparent 60%), radial-gradient(ellipse at 100% 100%, color-mix(in oklab, var(--primary) 28%, transparent), transparent 60%)",
          }}
        />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight text-balance sm:text-5xl">
            {t("cta.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {t("cta.sub")}
          </p>
          <Link
            to="/submit"
            className="mt-6 inline-flex items-center gap-2 rounded-full gavel-gradient px-6 py-3 text-sm font-bold text-white shadow-[0_18px_40px_-16px_var(--primary)] transition hover:-translate-y-0.5"
          >
            <Heart className="h-4 w-4" fill="currentColor" /> {t("cta.btn")}
          </Link>
        </div>
      </div>
    </section>
  );
}