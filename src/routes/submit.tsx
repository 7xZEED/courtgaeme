import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Copy, Gavel, Loader2, Share2 } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORIES, CATEGORY_BY_SLUG, JUDGES } from "@/lib/categories";
import type { CategoryId, JudgePersonality } from "@/lib/categories";
import { submitCase } from "@/lib/cases.functions";
import { useLocale } from "@/lib/app-providers";

const searchSchema = z.object({ category: z.string().optional() });

export const Route = createFileRoute("/submit")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Open a Case — Drama Court" },
      { name: "description", content: "Tell us what happened. Pick a courtroom, pick a judge, get a verdict in seconds." },
      { property: "og:title", content: "Open a Case — Drama Court" },
      { property: "og:description", content: "File your drama. Get a brutally honest AI verdict in under a minute." },
    ],
  }),
  component: SubmitPage,
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">Not found.</div>,
});

const STEPS = ["Courtroom", "Your role", "Story", "Judge"] as const;

function SubmitPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const presetCategory = search.category ? CATEGORY_BY_SLUG[search.category]?.id : undefined;
  const { locale } = useLocale();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<CategoryId | null>(presetCategory ?? null);
  const [role, setRole] = useState<"plaintiff" | "defendant" | null>(null);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [judge, setJudge] = useState<JudgePersonality>("brutal");
  const [shareInfo, setShareInfo] = useState<{ id: string; slug: string } | null>(null);

  const submit = useServerFn(submitCase);
  const mut = useMutation({
    mutationFn: () =>
      submit({
        data: {
          category: category!,
          role: role!,
          title: title.trim(),
          story: story.trim(),
          defendant_response: null,
          judge_personality: judge,
          language: locale,
        },
      }),
    onSuccess: ({ slug, id }) => {
      setShareInfo({ id, slug });
    },
  });

  const canNext = () => {
    if (step === 0) return !!category;
    if (step === 1) return !!role;
    if (step === 2) return title.trim().length >= 5 && story.trim().length >= 1;
    return true;
  };

  const next = () => {
    if (step === STEPS.length - 1) {
      mut.mutate();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="courtroom-bg min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <header className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-[0.22em] text-[var(--gavel)]">File a case</div>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Open your case</h1>
          <p className="text-muted-foreground">Five quick steps. Brutal verdict at the end.</p>
        </header>

        <Progress step={step} />

        <section className="mt-8 rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
          {shareInfo ? (
            <ShareScreen id={shareInfo.id} slug={shareInfo.slug} />
          ) : mut.isPending ? (
            <Generating />
          ) : (
            <>
              {step === 0 && (
                <StepWrap title="Choose your courtroom" subtitle="Where does this drama belong?">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {CATEGORIES.map((c) => {
                      const Icon = c.icon;
                      const active = category === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setCategory(c.id)}
                          className="group relative overflow-hidden rounded-2xl border bg-background/40 p-4 text-left transition"
                          style={
                            active
                              ? { borderColor: c.accentVar, boxShadow: `0 0 24px -8px ${c.accentVar}` }
                              : { borderColor: "var(--border)" }
                          }
                        >
                          <div className="flex items-start justify-between">
                            <span
                              className="grid h-9 w-9 place-items-center rounded-xl"
                              style={{ background: `color-mix(in oklab, ${c.accentVar} 18%, transparent)`, color: c.accentVar }}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="text-xl">{c.badge}</span>
                          </div>
                          <h3 className="mt-3 font-display text-base font-bold">{c.label}</h3>
                          <p className="text-xs text-muted-foreground">{c.tagline}</p>
                        </button>
                      );
                    })}
                  </div>
                </StepWrap>
              )}

              {step === 1 && (
                <StepWrap title="What's your role?" subtitle="Are you the one filing the complaint — or being accused?">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RoleCard
                      active={role === "plaintiff"}
                      onClick={() => setRole("plaintiff")}
                      title="I'm the Plaintiff"
                      sub="They wronged me. I'm bringing the case."
                      emoji="⚖️"
                    />
                    <RoleCard
                      active={role === "defendant"}
                      onClick={() => setRole("defendant")}
                      title="I'm the Defendant"
                      sub="I'm being accused. Hear my side first."
                      emoji="🙋"
                    />
                  </div>
                </StepWrap>
              )}

              {step === 2 && (
                <StepWrap title="Tell your story" subtitle="Headline first, then the full receipts. Be specific.">
                  <div className="space-y-4">
                    <div>
                      <Label>Case title</Label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                        placeholder="e.g. My friend invited my ex to MY birthday"
                        className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-base outline-none focus:border-foreground"
                      />
                      <Counter v={title.length} max={120} />
                    </div>
                    <div>
                      <Label>What happened?</Label>
                      <textarea
                        value={story}
                        onChange={(e) => setStory(e.target.value.slice(0, 4000))}
                        rows={9}
                        placeholder="Lay it all out. Context, timeline, exact quotes if you have them. The more detail, the sharper the verdict."
                        className="w-full resize-y rounded-xl border border-border bg-background/40 px-4 py-3 text-base outline-none focus:border-foreground"
                      />
                      <Counter v={story.length} max={4000} />
                    </div>
                  </div>
                </StepWrap>
              )}

              {step === 3 && (
                <StepWrap title="Pick your judge" subtitle="Same evidence. Wildly different vibes.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {JUDGES.map((j) => {
                      const active = judge === j.id;
                      return (
                        <button
                          key={j.id}
                          onClick={() => setJudge(j.id)}
                          className="relative rounded-2xl border bg-background/40 p-4 text-left transition"
                          style={
                            active
                              ? { borderColor: "var(--gavel)", boxShadow: "0 0 24px -8px var(--gavel)" }
                              : { borderColor: "var(--border)" }
                          }
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{j.emoji}</span>
                            <div>
                              <div className="font-display text-base font-bold">{j.label}</div>
                              <div className="text-xs text-muted-foreground">{j.tagline}</div>
                            </div>
                            {active && (
                              <span className="ml-auto grid h-5 w-5 place-items-center rounded-full gavel-gradient text-background">
                                <Check className="h-3 w-3" strokeWidth={3} />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </StepWrap>
              )}

              {mut.isError && (
                <p className="mt-4 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {(mut.error as Error)?.message ?? "Something went wrong filing your case."}
                </p>
              )}

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={!canNext()}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {step === STEPS.length - 1 ? (
                    <>
                      <Share2 className="h-4 w-4" /> Get share link
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <ol className="mt-8 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em]">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                done ? "bg-[var(--cat-group-chat)] text-background" : active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
            </span>
            <span className={active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/60"}>
              {s}
            </span>
            {i < STEPS.length - 1 && <span className="text-muted-foreground/40">/</span>}
          </li>
        );
      })}
    </ol>
  );
}

function StepWrap({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">{children}</div>;
}

function Counter({ v, max, min }: { v: number; max: number; min?: number }) {
  const ok = min ? v >= min : true;
  return (
    <div className="mt-1 flex justify-between text-[11px] font-mono">
      <span className={ok ? "text-muted-foreground" : "text-[var(--verdict)]"}>{min ? (ok ? "" : `at least ${min} chars`) : ""}</span>
      <span className="text-muted-foreground">{v} / {max}</span>
    </div>
  );
}

function ShareScreen({ id, slug }: { id: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/party-b/${id}` : `/party-b/${id}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="space-y-6 py-4 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full gavel-gradient">
        <Gavel className="h-7 w-7 text-background" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold">Your side is filed.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Now send this private link to the other person. They write their side, then the AI delivers the real verdict with both stories heard.
        </p>
      </div>
      <div className="mx-auto flex max-w-lg items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2">
        <span className="flex-1 truncate text-left text-xs font-mono text-muted-foreground">{link}</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
        >
          <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/case/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
        >
          See current verdict
        </Link>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, title, sub, emoji }: { active: boolean; onClick: () => void; title: string; sub: string; emoji: string }) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl border bg-background/40 p-5 text-left transition"
      style={active ? { borderColor: "var(--foreground)", boxShadow: "0 0 24px -8px var(--gavel)" } : { borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <div className="font-display text-lg font-bold">{title}</div>
          <div className="text-sm text-muted-foreground">{sub}</div>
        </div>
      </div>
    </button>
  );
}

function Generating() {
  return (
    <div className="grid place-items-center py-16 text-center">
      <div className="relative grid h-20 w-20 place-items-center rounded-full gavel-gradient">
        <Loader2 className="h-8 w-8 animate-spin text-background" />
        <span className="absolute -inset-2 -z-10 rounded-full opacity-40 blur-2xl gavel-gradient" />
      </div>
      <h2 className="mt-6 font-display text-2xl font-bold">The court is in session…</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        The judge is reviewing the evidence, calculating red flags, and preparing your sentence.
      </p>
    </div>
  );
}