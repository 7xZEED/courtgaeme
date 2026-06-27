import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, ArrowLeft, Gavel } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCaseById, submitPartyBResponse } from "@/lib/cases.functions";
import { useLocale } from "@/lib/app-providers";

export const Route = createFileRoute("/party-b/$caseId")({
  loader: async ({ params }) => {
    const row = await getCaseById({ data: { case_id: params.caseId } });
    if (!row) throw notFound();
    return row;
  },
  head: () => ({
    meta: [
      { title: "Your side — Drama Court" },
      { name: "description", content: "Someone filed a case about you. Tell your side, let the AI judge with both stories." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PartyBPage,
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-8 text-center">
      <h1 className="font-display text-2xl font-bold">Case not found</h1>
    </div>
  ),
});

function PartyBPage() {
  const row = Route.useLoaderData();
  const navigate = useNavigate();
  const { locale } = useLocale();
  const bn = locale === "bn";

  const [expanded, setExpanded] = useState(row.story.length < 400);
  const [response, setResponse] = useState("");
  const submit = useServerFn(submitPartyBResponse);
  const mut = useMutation({
    mutationFn: () => submit({ data: { case_id: row.id, response: response.trim() } }),
    onSuccess: ({ slug }) => navigate({ to: "/case/$slug", params: { slug } }),
  });

  const alreadySubmitted = !!row.defendant_response;

  return (
    <div className="courtroom-bg min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> {bn ? "হোম" : "Home"}
        </Link>

        <header className="mt-4 space-y-2">
          <div className="text-xs font-mono uppercase tracking-[0.22em] text-[var(--gavel)]">
            {bn ? "তোমার পক্ষ" : "Your side"}
          </div>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{row.title}</h1>
          <p className="text-muted-foreground">
            {bn
              ? "কেউ তোমার সম্পর্কে একটা কেস ফাইল করেছে। তোমার পক্ষ বলো, AI দুই পাশ শুনে রায় দেবে।"
              : "Someone filed a case about you. Share your side and the AI will re-judge with both stories."}
          </p>
        </header>

        {alreadySubmitted ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {bn ? "এই পক্ষ ইতিমধ্যে জমা হয়েছে।" : "This side has already been submitted."}
            </p>
            <Link
              to="/case/$slug"
              params={{ slug: row.slug }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
            >
              {bn ? "রায় দেখো" : "View the verdict"}
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-8 space-y-3 rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold">
                {bn ? "তাদের গল্প" : "Their story"}
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {expanded || row.story.length <= 400 ? row.story : row.story.slice(0, 400) + "…"}
              </p>
              {row.story.length > 400 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-xs font-semibold text-[var(--gavel)] hover:underline"
                >
                  {expanded ? (bn ? "সংক্ষিপ্ত করো" : "Show less") : (bn ? "পুরোটা দেখো" : "Read more")}
                </button>
              )}
            </section>

            <section className="mt-6 rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
              <label className="mb-2 block text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                {bn ? "তোমার পক্ষ" : "Your version"}
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value.slice(0, 2000))}
                rows={8}
                placeholder={bn ? "তোমার কথা লেখো…" : "Tell your side…"}
                className="w-full resize-y rounded-xl border border-border bg-background/40 px-4 py-3 text-base outline-none focus:border-foreground"
              />
              <div className="mt-1 text-right text-[11px] font-mono text-muted-foreground">{response.length} / 2000</div>

              {mut.isError && (
                <p className="mt-3 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {(mut.error as Error)?.message ?? "Could not submit."}
                </p>
              )}

              <button
                onClick={() => mut.mutate()}
                disabled={mut.isPending || response.trim().length === 0}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background disabled:opacity-40 sm:w-auto"
              >
                {mut.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {bn ? "জাজ ভাবছে…" : "Judge thinking…"}
                  </>
                ) : (
                  <>
                    <Gavel className="h-4 w-4" /> {bn ? "আমার পক্ষ জমা দাও" : "Submit my side"}
                  </>
                )}
              </button>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}