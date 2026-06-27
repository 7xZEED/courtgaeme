import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VerdictCard } from "@/components/verdict-card";
import { JuryBar } from "@/components/jury-bar";
import { CATEGORY_BY_ID, type CategoryId } from "@/lib/categories";
import { getCaseBySlug, recordView } from "@/lib/cases.functions";
import { ArrowLeft, Copy, Share2, Eye } from "lucide-react";

export const Route = createFileRoute("/case/$slug")({
  loader: async ({ params }) => {
    const row = await getCaseBySlug({ data: { slug: params.slug } });
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData, params }) => {
    const row = loaderData;
    if (!row) {
      return { meta: [{ title: "Case — Drama Court" }] };
    }
    const v = row.verdict;
    const title = `${row.title} — Drama Court`;
    const desc = v ? `Verdict: ${v.headline}. ${v.one_liner}` : "Case filed in Drama Court.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: v?.headline ?? row.title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/case/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: v?.headline ?? row.title },
        { name: "twitter:description", content: desc },
      ],
    };
  },
  component: CasePage,
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-8 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold">Case dismissed</h1>
        <p className="mt-1 text-sm text-muted-foreground">This case doesn't exist or was never filed.</p>
        <Link to="/" className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to Drama Court</Link>
      </div>
    </div>
  ),
});

function CasePage() {
  const row = Route.useLoaderData();
  const cat = CATEGORY_BY_ID[row.category as CategoryId];
  const Icon = cat.icon;
  const v = row.verdict;

  useEffect(() => {
    // Fire-and-forget view increment
    recordView({ data: { case_id: row.id } }).catch(() => {});
  }, [row.id]);

  return (
    <div className="courtroom-bg min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <Link to="/browse" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to docket
        </Link>

        {/* Case header */}
        <header className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/court/$slug"
              params={{ slug: cat.slug }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: cat.accentVar }}
            >
              <Icon className="h-3.5 w-3.5" /> {cat.label}
            </Link>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" /> {row.view_count}
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {row.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-0.5 font-mono uppercase tracking-[0.16em]">
              {row.role}
            </span>
            <span>·</span>
            <time dateTime={row.created_at}>
              {new Date(row.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </time>
          </div>
        </header>

        {/* The story */}
        <section className="mt-8 space-y-4 rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold">
            {row.role === "plaintiff" ? "Plaintiff's statement" : "Defendant's statement"}
          </h2>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{row.story}</p>
          {row.defendant_response && (
            <>
              <h2 className="pt-4 font-display text-lg font-bold">The other side</h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{row.defendant_response}</p>
            </>
          )}
        </section>

        {/* Jury */}
        <section className="mt-8 rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
          <JuryBar row={row} />
        </section>

        {/* Verdict */}
        {v ? (
          <section className="mt-8">
            <VerdictCard v={v} />
            <div className="mt-4">
              <ShareRow slug={row.slug} headline={v.headline} oneLiner={v.one_liner} />
            </div>
          </section>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card/30 p-8 text-center text-sm text-muted-foreground">
            The verdict for this case is still being deliberated.
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function ShareRow({ slug, headline, oneLiner }: { slug: string; headline: string; oneLiner: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/case/${slug}` : `/case/${slug}`;
  const text = `⚖️ ${headline}\n\n"${oneLiner}"\n\nDrama Court verdict: ${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: "Drama Court verdict",
          text: `⚖️ ${headline} — "${oneLiner}"`,
          url,
        });
      } catch { /* user cancelled */ }
    } else {
      copy();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={share} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">
        <Share2 className="h-3.5 w-3.5" /> Share the verdict
      </button>
      <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">
        <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}