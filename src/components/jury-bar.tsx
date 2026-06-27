import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { castVote } from "@/lib/cases.functions";
import { hasVoted, markVoted } from "@/lib/fingerprint";
import type { CaseRow } from "@/lib/verdict";
import { totalVotes, votePcts } from "@/lib/verdict";
import { Check } from "lucide-react";

export function JuryBar({ row }: { row: CaseRow }) {
  const vote = useServerFn(castVote);
  const [local, setLocal] = useState({
    votes_a: row.votes_a,
    votes_b: row.votes_b,
    votes_both: row.votes_both,
  });
  const [picked, setPicked] = useState<"a" | "b" | "both" | null>(() => hasVoted(row.id));

  const mut = useMutation({
    mutationFn: (choice: "a" | "b" | "both") => vote({ data: { case_id: row.id, choice } }),
    onSuccess: (data, choice) => {
      if (data) setLocal({ votes_a: data.votes_a, votes_b: data.votes_b, votes_both: data.votes_both });
      markVoted(row.id, choice);
      setPicked(choice);
    },
  });

  const pct = votePcts(local);
  const total = totalVotes(local);
  const choose = (c: "a" | "b" | "both") => {
    if (picked) return;
    const key = c === "a" ? "votes_a" : c === "b" ? "votes_b" : "votes_both";
    setLocal((p) => ({ ...p, [key]: p[key] + 1 }));
    setPicked(c);
    mut.mutate(c);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg font-bold">The Jury Speaks</h3>
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {total} {total === 1 ? "juror" : "jurors"}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <VoteButton
          label="Plaintiff is right"
          subtitle={row.role === "plaintiff" ? "the submitter" : "the accused"}
          pct={pct.a}
          color="var(--cat-friend)"
          active={picked === "a"}
          locked={!!picked}
          onClick={() => choose("a")}
        />
        <VoteButton
          label="Both wrong"
          subtitle="messy on all sides"
          pct={pct.both}
          color="var(--gavel)"
          active={picked === "both"}
          locked={!!picked}
          onClick={() => choose("both")}
        />
        <VoteButton
          label="Defendant is right"
          subtitle={row.role === "defendant" ? "the submitter" : "the accused"}
          pct={pct.b}
          color="var(--cat-bf-gf)"
          active={picked === "b"}
          locked={!!picked}
          onClick={() => choose("b")}
        />
      </div>

      {picked && (
        <p className="text-center text-xs text-muted-foreground">
          Your vote is in. The court appreciates your civic duty.
        </p>
      )}
    </div>
  );
}

function VoteButton({
  label,
  subtitle,
  pct,
  color,
  active,
  locked,
  onClick,
}: {
  label: string;
  subtitle: string;
  pct: number;
  color: string;
  active: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className="group relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 text-left transition disabled:cursor-default enabled:hover:-translate-y-0.5 enabled:hover:border-border"
      style={active ? { boxShadow: `inset 0 0 0 1.5px ${color}, 0 0 30px -10px ${color}` } : undefined}
    >
      {locked && (
        <div
          className="absolute inset-y-0 left-0 transition-all"
          style={{ width: `${pct}%`, background: `color-mix(in oklab, ${color} 18%, transparent)` }}
        />
      )}
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-sm font-bold">{label}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
        {active && (
          <span
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
            style={{ background: color }}
          >
            <Check className="h-3 w-3 text-background" strokeWidth={3} />
          </span>
        )}
      </div>
      {locked && (
        <div className="relative mt-3 font-mono text-2xl font-bold" style={{ color }}>
          {pct}%
        </div>
      )}
    </button>
  );
}