import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CaseCard } from "@/components/case-card";
import { CATEGORIES } from "@/lib/categories";
import { listCases } from "@/lib/cases.functions";
import type { CategoryId } from "@/lib/categories";

type Sort = "new" | "trending" | "controversial" | "voted";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Drama — Drama Court" },
      { name: "description", content: "Browse the full Drama Court docket. Filter by courtroom, sort by trending, controversial, or newest." },
      { property: "og:title", content: "Browse Drama — Drama Court" },
      { property: "og:description", content: "Trending verdicts, the most controversial cases, and the freshest drama on the internet." },
    ],
  }),
  component: BrowsePage,
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">Not found.</div>,
});

function BrowsePage() {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<Sort>("new");
  const [search, setSearch] = useState("");

  const fetcher = useServerFn(listCases);
  const { data = [], isLoading } = useQuery({
    queryKey: ["cases", cat, sort, search],
    queryFn: () =>
      fetcher({
        data: {
          category: cat === "all" ? undefined : cat,
          sort,
          search: search || undefined,
          limit: 60,
        },
      }),
    staleTime: 15_000,
  });

  return (
    <div className="courtroom-bg min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-[0.22em] text-[var(--gavel)]">The docket</div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Browse Drama</h1>
          <p className="max-w-xl text-muted-foreground">Trending verdicts, controversial rulings, and freshly filed cases.</p>
        </div>

        <div className="mt-8 space-y-4">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases — 'birthday', 'ghosted', 'in-laws'…"
              className="w-full rounded-full border border-border bg-card/60 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-foreground"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={cat === "all"} onClick={() => setCat("all")}>All courts</FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c.id}
                active={cat === c.id}
                onClick={() => setCat(c.id)}
                color={c.accentVar}
              >
                {c.badge} {c.short}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["new", "trending", "controversial", "voted"] as Sort[]).map((s) => (
              <SortChip key={s} active={sort === s} onClick={() => setSort(s)}>
                {s === "new" ? "Newest" : s === "trending" ? "Trending" : s === "controversial" ? "Most controversial" : "Most viewed"}
              </SortChip>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl border border-border/60 bg-card/40" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/30 p-10 text-center">
              <p className="text-muted-foreground">No cases match your filters yet.</p>
              <Link to="/submit" className="mt-4 inline-flex rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">
                File the first one
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((c) => (
                <CaseCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
      style={
        active
          ? {
              borderColor: color ?? "var(--foreground)",
              background: color ? `color-mix(in oklab, ${color} 18%, transparent)` : "var(--foreground)",
              color: color ?? "var(--background)",
            }
          : { borderColor: "var(--border)", color: "var(--muted-foreground)", background: "transparent" }
      }
    >
      {children}
    </button>
  );
}

function SortChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-mono uppercase tracking-[0.14em] transition ${
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}