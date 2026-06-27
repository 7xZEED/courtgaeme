import type { CategoryId, JudgePersonality } from "./categories";

/** AI-produced verdict, persisted as JSONB on the cases row. */
export type Verdict = {
  /** "a" = plaintiff, "b" = the other party, "both" = both wrong, "neither" = both fine */
  guilty: "a" | "b" | "both" | "neither";
  headline: string;
  ruling: string;
  red_flag_score: number; // 0-100
  delusion_meter: number; // 0-100
  communication_score: number; // 0-100
  toxicity_index: number; // 0-100
  survival_chance: number; // 0-100
  drama_level: number; // 0-100
  sentence: string;
  punishment: string;
  one_liner: string;
  judge_personality: JudgePersonality;
};

export type CaseRow = {
  id: string;
  slug: string;
  category: CategoryId;
  role: "plaintiff" | "defendant";
  title: string;
  story: string;
  defendant_response: string | null;
  judge_personality: JudgePersonality;
  verdict: Verdict | null;
  status: "pending" | "ready" | "failed";
  votes_a: number;
  votes_b: number;
  votes_both: number;
  view_count: number;
  created_at: string;
};

export function totalVotes(c: Pick<CaseRow, "votes_a" | "votes_b" | "votes_both">) {
  return c.votes_a + c.votes_b + c.votes_both;
}

export function votePcts(c: Pick<CaseRow, "votes_a" | "votes_b" | "votes_both">) {
  const total = Math.max(1, totalVotes(c));
  return {
    a: Math.round((c.votes_a / total) * 100),
    b: Math.round((c.votes_b / total) * 100),
    both: Math.round((c.votes_both / total) * 100),
  };
}

export function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join("-");
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base || "case"}-${rand}`;
}