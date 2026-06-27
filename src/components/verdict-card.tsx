import { Meter } from "@/components/meter";
import { JUDGE_BY_ID } from "@/lib/categories";
import type { Verdict } from "@/lib/verdict";
import { Gavel, Quote } from "lucide-react";

const guiltyCopy: Record<Verdict["guilty"], { stamp: string; tone: string; sub: string }> = {
  a: { stamp: "PLAINTIFF — GUILTY", tone: "var(--verdict)", sub: "The submitter is in the wrong." },
  b: { stamp: "DEFENDANT — GUILTY", tone: "var(--verdict)", sub: "The other party is in the wrong." },
  both: { stamp: "BOTH GUILTY", tone: "var(--gavel)", sub: "Mutually messy. Both parties at fault." },
  neither: { stamp: "CASE DISMISSED", tone: "var(--cat-group-chat)", sub: "Honestly? You're both fine." },
};

export function VerdictCard({ v }: { v: Verdict }) {
  const judge = JUDGE_BY_ID[v.judge_personality];
  const g = guiltyCopy[v.guilty];

  return (
    <article className="relative overflow-hidden rounded-3xl border border-border/70 bg-card">
      {/* Drama gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse at 80% -10%, color-mix(in oklab, ${g.tone} 30%, transparent), transparent 60%)`,
        }}
      />

      <div className="relative space-y-6 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              <Gavel className="h-3 w-3" /> Official Ruling
            </div>
            <div className="text-xs text-muted-foreground">
              Presiding: <span className="text-foreground">{judge.emoji} {judge.label}</span>
            </div>
          </div>
          <div
            className="animate-stamp shrink-0 rounded-md border-2 px-3 py-1.5 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] sm:text-xs"
            style={{
              color: g.tone,
              borderColor: g.tone,
              boxShadow: `0 0 28px -10px ${g.tone}`,
            }}
          >
            {g.stamp}
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h2
            className="font-display text-3xl font-extrabold leading-[1.05] text-balance sm:text-4xl"
            style={{ color: g.tone }}
          >
            {v.headline}
          </h2>
          <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{v.ruling}</p>
          <p className="text-sm text-muted-foreground">{g.sub}</p>
        </div>

        {/* Meters */}
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Meter label="Red Flag Score" value={v.red_flag_score} tone="danger" />
          <Meter label="Delusion Meter" value={v.delusion_meter} tone="warn" />
          <Meter label="Communication" value={v.communication_score} tone="ok" />
          <Meter label="Toxicity Index" value={v.toxicity_index} tone="danger" />
          <Meter label="Relationship Survival" value={v.survival_chance} tone="ok" />
          <Meter label="Drama Level" value={v.drama_level} tone="warn" />
        </div>

        {/* Sentence */}
        <div className="rounded-2xl border border-border/70 bg-background/40 p-4 sm:p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            Sentence
          </div>
          <p className="mt-1 font-display text-lg font-bold sm:text-xl">{v.sentence}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold gavel-gradient text-background">
            ⚖️ Punishment: {v.punishment}
          </div>
        </div>

        {/* One-liner */}
        <blockquote className="relative rounded-2xl border border-dashed border-border bg-background/30 p-4">
          <Quote className="absolute -top-2 left-4 h-4 w-4 bg-card px-0.5 text-muted-foreground" />
          <p className="text-base italic leading-relaxed text-foreground sm:text-lg">{v.one_liner}</p>
        </blockquote>
      </div>
    </article>
  );
}