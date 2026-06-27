import { Link } from "@tanstack/react-router";
import { CATEGORY_BY_ID } from "@/lib/categories";
import type { CaseRow } from "@/lib/verdict";
import { totalVotes, votePcts } from "@/lib/verdict";
import { Flame, Eye } from "lucide-react";

function GuiltyBadge({ g }: { g: "a" | "b" | "both" | "neither" }) {
  const map = {
    a: { label: "PLAINTIFF WRONG", color: "var(--verdict)" },
    b: { label: "DEFENDANT WRONG", color: "var(--verdict)" },
    both: { label: "BOTH WRONG", color: "var(--gavel)" },
    neither: { label: "BOTH FINE", color: "var(--cat-group-chat)" },
  } as const;
  const m = map[g];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
      style={{
        background: `color-mix(in oklab, ${m.color} 16%, transparent)`,
        color: m.color,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${m.color} 45%, transparent)`,
      }}
    >
      {m.label}
    </span>
  );
}

export function CaseCard({ c }: { c: CaseRow }) {
  const cat = CATEGORY_BY_ID[c.category];
  const Icon = cat.icon;
  const v = c.verdict;
  const pct = votePcts(c);
  const total = totalVotes(c);

  return (
    <Link
      to="/case/$slug"
      params={{ slug: c.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 hover:border-border hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: cat.accentVar }}
      />
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: cat.accentVar }}>
          <Icon className="h-3.5 w-3.5" /> {cat.short}
        </span>
        {v && <GuiltyBadge g={v.guilty} />}
      </div>

      <div className="px-4 pt-2">
        <h3 className="font-display text-base font-bold leading-snug text-balance line-clamp-2 group-hover:text-foreground">
          {c.title}
        </h3>
        {v && (
          <p className="mt-2 line-clamp-2 text-sm italic text-muted-foreground">
            "{v.one_liner}"
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 px-4 text-[10px] font-mono uppercase tracking-wider">
        {v && (
          <>
            <Stat label="Drama" value={v.drama_level} color="var(--verdict)" />
            <Stat label="Red Flag" value={v.red_flag_score} color="var(--cat-bf-gf)" />
            <Stat label="Delulu" value={v.delusion_meter} color="var(--cat-situationship)" />
          </>
        )}
      </div>

      <div className="mt-3 px-4 pb-4">
        <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
          <div style={{ width: `${pct.a}%`, background: "var(--cat-friend)" }} />
          <div style={{ width: `${pct.both}%`, background: "var(--gavel)" }} />
          <div style={{ width: `${pct.b}%`, background: "var(--cat-bf-gf)" }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-mono">{total} {total === 1 ? "juror" : "jurors"}</span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {c.view_count}</span>
            <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" /> {v?.drama_level ?? 0}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-md border border-border/60 px-2 py-1.5">
      <div className="text-[9px] text-muted-foreground">{label}</div>
      <div className="font-bold text-foreground" style={{ color }}>{value}</div>
    </div>
  );
}