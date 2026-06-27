import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Gavel } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CaseCard } from "@/components/case-card";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { listCases } from "@/lib/cases.functions";

export const Route = createFileRoute("/court/$slug")({
  head: ({ params }) => {
    const c = CATEGORY_BY_SLUG[params.slug];
    const title = c ? `${c.label} — Drama Court` : "Court — Drama Court";
    const desc = c ? `${c.tagline} ${c.description}` : "Browse Drama Court cases.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  beforeLoad: ({ params }) => {
    if (!CATEGORY_BY_SLUG[params.slug]) throw notFound();
  },
  component: CourtPage,
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-8 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold">Courtroom not found</h1>
        <Link to="/" className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to Drama Court</Link>
      </div>
    </div>
  ),
});

function CourtPage() {
  const { slug } = Route.useParams();
  const cat = CATEGORY_BY_SLUG[slug]!;
  const Icon = cat.icon;

  const fetcher = useServerFn(listCases);
  const { data = [], isLoading } = useQuery({
    queryKey: ["court", cat.id],
    queryFn: () => fetcher({ data: { category: cat.id, sort: "new", limit: 30 } }),
  });

  return (
    <div className="courtroom-bg min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{ background: `radial-gradient(ellipse at 80% -20%, color-mix(in oklab, ${cat.accentVar} 40%, transparent), transparent 60%)` }}
          />
          <div className="relative">
            <span
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: `color-mix(in oklab, ${cat.accentVar} 20%, transparent)`, color: cat.accentVar }}
            >
              <Icon className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl" style={{ color: cat.accentVar }}>
              {cat.label}
            </h1>
            <p className="mt-2 max-w-xl text-lg text-muted-foreground">{cat.tagline}</p>
            <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
            <Link
              to="/submit"
              search={{ category: cat.slug }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
            >
              <Gavel className="h-4 w-4" /> File a case in this court
            </Link>
          </div>
        </div>

        <div className="mt-10 mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Recent cases</h2>
          <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            All cases <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-border/60 bg-card/40" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/30 p-10 text-center text-muted-foreground">
            No cases here yet. Be the first to file one.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}