import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (password.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

const PasswordSchema = z.object({ password: z.string().min(1).max(200) });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PasswordSchema.parse(d))
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) {
      // Small delay to slow brute-force
      await new Promise((r) => setTimeout(r, 400));
      return { ok: false as const };
    }
    return { ok: true as const };
  });

export const adminListCases = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        password: z.string().min(1).max(200),
        search: z.string().trim().max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("cases")
      .select(
        "id, slug, title, category, status, created_at, view_count, votes_a, votes_b, votes_both, is_hidden, is_featured",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.search) {
      q = q.or(`title.ilike.%${data.search}%,category.ilike.%${data.search}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminToggleHidden = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ password: z.string().min(1).max(200), case_id: z.string().uuid(), value: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("cases").update({ is_hidden: data.value }).eq("id", data.case_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminToggleFeatured = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ password: z.string().min(1).max(200), case_id: z.string().uuid(), value: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("cases").update({ is_featured: data.value }).eq("id", data.case_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteCase = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ password: z.string().min(1).max(200), case_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("cases").delete().eq("id", data.case_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });