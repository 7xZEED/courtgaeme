import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { makeSlug, type CaseRow, type Verdict } from "./verdict";

const SubmitSchema = z.object({
  category: z.enum(["bf_gf", "situationship", "friend", "ex_to_ex", "group_chat", "gaming"]),
  role: z.enum(["plaintiff", "defendant"]),
  title: z.string().trim().min(5).max(120),
  story: z.string().trim().min(1).max(4000),
  defendant_response: z.string().trim().min(1).max(2000).optional().nullable(),
  judge_personality: z.enum(["brutal", "genz", "wise", "chaotic"]),
  language: z.enum(["en", "bn"]).default("en"),
});

const ListSchema = z.object({
  category: z
    .enum(["bf_gf", "situationship", "friend", "ex_to_ex", "group_chat", "gaming"])
    .optional(),
  sort: z.enum(["new", "trending", "controversial", "voted"]).default("new"),
  search: z.string().trim().max(80).optional(),
  limit: z.number().int().min(1).max(60).default(24),
});

const VoteSchema = z.object({
  case_id: z.string().uuid(),
  choice: z.enum(["a", "b", "both"]),
});

const SlugSchema = z.object({ slug: z.string().min(3).max(160) });

function sanitize(input: string): string {
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*script\b[^>]*>/gi, "")
    .replace(/javascript:/gi, "");
}

type VerdictInput = {
  category: z.infer<typeof SubmitSchema>["category"];
  role: "plaintiff" | "defendant";
  title: string;
  story: string;
  defendant_response?: string | null;
  judge_personality: z.infer<typeof SubmitSchema>["judge_personality"];
  language: "en" | "bn";
};

function generateVerdict(input: VerdictInput): Verdict {
  // Mock verdict — no AI API needed, works for free on any host
  const personalities: Record<string, { ruling: string; sentence: string; punishment: string; one_liner: string }> = {
    brutal: {
      ruling: "Both parties came in here with their feelings hurt and their logic left at the door. The facts have been weighed and someone is clearly in the wrong.",
      sentence: "Guilty as charged. No appeals.",
      punishment: "48 hours of silent reflection and one sincere apology.",
      one_liner: "You played yourself and somehow blamed the other person.",
    },
    genz: {
      ruling: "Bestie, this is giving main character syndrome fr fr. The audacity is unmatched and the vibe check has officially failed. No cap, this situation is cooked.",
      sentence: "Caught in 4K. It's giving red flag energy.",
      punishment: "Delete the talking stage texts and log off for 24 hours.",
      one_liner: "The delulu is not the solulu this time, bestie.",
    },
    wise: {
      ruling: "In every conflict, truth lives somewhere between the stories told. Both parties carry responsibility for how this unfolded, yet the weight is not equally shared.",
      sentence: "The court rules with measured judgment and clear eyes.",
      punishment: "One week of active listening before speaking.",
      one_liner: "Peace is not found by winning arguments, but by understanding them.",
    },
    chaotic: {
      ruling: "CHAOS DETECTED. The court has reviewed the evidence while eating chips and watching telenovelas. This drama? Shakespearean. The verdict? Unhinged but fair.",
      sentence: "GUILTY! The gavel has spoken! *slams desk theatrically*",
      punishment: "Must explain themselves using only interpretive dance.",
      one_liner: "This drama could power a small city for three business days.",
    },
  };

  const p = personalities[input.judge_personality] ?? personalities.brutal;
  const guiltyOptions: Verdict["guilty"][] = ["a", "b", "both", "neither"];
  // Deterministic based on story length so same case always gets same result
  const guiltyIdx = input.story.length % 4;

  return {
    guilty: guiltyOptions[guiltyIdx],
    headline: `THE COURT HAS SPOKEN ON: ${input.title.toUpperCase().slice(0, 40)}`,
    ruling: p.ruling,
    red_flag_score: 45 + (input.story.length % 40),
    delusion_meter: 30 + (input.title.length % 50),
    communication_score: 20 + (input.story.length % 60),
    toxicity_index: 10 + (input.story.length % 55),
    survival_chance: 15 + (input.title.length % 70),
    drama_level: 50 + (input.story.length % 45),
    sentence: p.sentence,
    punishment: p.punishment,
    one_liner: p.one_liner,
    judge_personality: input.judge_personality,
  };
}


export const submitCase = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SubmitSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const cleanTitle = sanitize(data.title);
    const cleanStory = sanitize(data.story);
    const cleanOther = data.defendant_response ? sanitize(data.defendant_response) : null;
    const slug = makeSlug(cleanTitle);
    // Insert pending row
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("cases")
      .insert({
        slug,
        category: data.category,
        role: data.role,
        title: cleanTitle,
        story: cleanStory,
        defendant_response: cleanOther,
        judge_personality: data.judge_personality,
        language: data.language,
        status: "pending",
      })
      .select("id, slug")
      .single();
    if (insertErr || !inserted) throw new Error(insertErr?.message ?? "Could not file the case");

    try {
      const verdict = generateVerdict({
        category: data.category,
        role: data.role,
        title: cleanTitle,
        story: cleanStory,
        defendant_response: cleanOther,
        judge_personality: data.judge_personality,
        language: data.language,
      });
      const { error: updErr } = await supabaseAdmin
        .from("cases")
        .update({ verdict, status: "ready" })
        .eq("id", inserted.id);
      if (updErr) throw new Error(updErr.message);
      return { slug: inserted.slug, id: inserted.id };
    } catch (e) {
      await supabaseAdmin.from("cases").update({ status: "failed" }).eq("id", inserted.id);
      throw e;
    }
  });

export const listCases = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ListSchema.parse(d ?? {}))
  .handler(async ({ data }): Promise<CaseRow[]> => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      "https://vjzwmfkhhdsjoispugbb.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqendtZmtoaGRzam9qc3B1Z2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDg0MzgsImV4cCI6MjA5ODEyNDQzOH0.O5rTQz1wvlKr-eExTDn0JmDWwc5qU1Lf-nCqBQfq9og",
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase.from("cases").select("*").eq("status", "ready").eq("is_hidden", false);
    if (data.category) q = q.eq("category", data.category);
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    switch (data.sort) {
      case "voted":
        q = q.order("view_count", { ascending: false });
        break;
      case "trending":
        q = q.order("view_count", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "controversial":
        q = q.order("votes_both", { ascending: false });
        break;
      default:
        q = q.order("created_at", { ascending: false });
    }
    q = q.limit(data.limit);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as CaseRow[];
  });

export const getCaseBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => SlugSchema.parse(d))
  .handler(async ({ data }): Promise<CaseRow | null> => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      "https://vjzwmfkhhdsjoispugbb.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqendtZmtoaGRzam9qc3B1Z2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDg0MzgsImV4cCI6MjA5ODEyNDQzOH0.O5rTQz1wvlKr-eExTDn0JmDWwc5qU1Lf-nCqBQfq9og",
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: row, error } = await supabase.from("cases").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    return (row as CaseRow | null) ?? null;
  });

export const castVote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => VoteSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("cast_jury_vote", {
      p_case_id: data.case_id,
      p_choice: data.choice,
    });
    if (error) throw new Error(error.message);
    const { data: row } = await supabaseAdmin
      .from("cases")
      .select("votes_a, votes_b, votes_both")
      .eq("id", data.case_id)
      .single();
    return row;
  });

export const recordView = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ case_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("increment_case_views", { p_case_id: data.case_id });
    return { ok: true };
  });

/** Public fetch by ID — used by the /party-b/[caseId] page so Party B can read the original story. */
export const getCaseById = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ case_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<CaseRow | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("cases")
      .select("*")
      .eq("id", data.case_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as CaseRow | null) ?? null;
  });

/** Party B submits their side via the shared link. Re-runs the AI verdict with both sides. */
export const submitPartyBResponse = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        case_id: z.string().uuid(),
        response: z.string().trim().min(1).max(2000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("cases")
      .select("*")
      .eq("id", data.case_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Case not found");
    if (row.defendant_response) {
      return { slug: row.slug as string, already: true as const };
    }

    const cleanResponse = sanitize(data.response);
    const verdict = generateVerdict({
      category: row.category as VerdictInput["category"],
      role: row.role as "plaintiff" | "defendant",
      title: row.title as string,
      story: row.story as string,
      defendant_response: cleanResponse,
      judge_personality: row.judge_personality as VerdictInput["judge_personality"],
      language: ((row.language as string) || "en") === "bn" ? "bn" : "en",
    });

    const { error: updErr } = await supabaseAdmin
      .from("cases")
      .update({ defendant_response: cleanResponse, verdict, status: "ready" })
      .eq("id", data.case_id);
    if (updErr) throw new Error(updErr.message);
    return { slug: row.slug as string, already: false as const };
  });