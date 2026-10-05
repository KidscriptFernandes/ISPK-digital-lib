import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list_users") }),
  z.object({ action: z.literal("invite_admin"), email: z.string().trim().email().max(255), full_name: z.string().trim().min(1).max(120), redirect_to: z.string().url().optional() }),
  z.object({ action: z.literal("delete_user"), user_id: z.string().uuid() }),
  z.object({ action: z.literal("restrict_user"), user_id: z.string().uuid() }),
  z.object({ action: z.literal("unrestrict_user"), user_id: z.string().uuid() }),
  z.object({ action: z.literal("demote_admin"), user_id: z.string().uuid() }),
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Não autenticado." }, 401);
    const { data: u, error: ue } = await admin.auth.getUser(token);
    if (ue || !u.user) return json({ error: "Sessão inválida. Inicie sessão novamente." }, 401);
    const callerId = u.user.id;
    const { data: isAdm } = await admin.from("user_roles").select("id").eq("user_id", callerId).eq("role", "admin").maybeSingle();
    if (!isAdm) return json({ error: "Apenas administradores podem executar esta ação." }, 403);

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Dados inválidos.", details: parsed.error.flatten().fieldErrors }, 400);
    const b = parsed.data;

    const countAdmins = async () => (await admin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin")).count ?? 0;
    const targetIsAdmin = async (id: string) => !!(await admin.from("user_roles").select("id").eq("user_id", id).eq("role", "admin").maybeSingle()).data;

    if (b.action === "list_users") {
      const all: any[] = [];
      for (let page = 1; page < 50; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        all.push(...data.users);
        if (data.users.length < 1000) break;
      }
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        admin.from("profiles").select("user_id, full_name"),
        admin.from("user_roles").select("user_id, role"),
      ]);
      const users = all.map((x) => {
        const r = (roles ?? []).filter((y) => y.user_id === x.id).map((y) => y.role);
        return {
          user_id: x.id,
          email: x.email,
          full_name: profiles?.find((p) => p.user_id === x.id)?.full_name ?? x.user_metadata?.full_name ?? null,
          role: r.includes("admin") ? "admin" : "student",
          created_at: x.created_at,
          confirmed: !!x.email_confirmed_at,
          last_sign_in_at: x.last_sign_in_at ?? null,
          banned: !!x.banned_until && new Date(x.banned_until) > new Date(),
        };
      });
      return json({ users });
    }

    if (b.action === "invite_admin") {
      const { data, error } = await admin.auth.admin.inviteUserByEmail(b.email, {
        data: { full_name: b.full_name },
        redirectTo: b.redirect_to,
      });
      if (error) {
        const msg = /already|registered|exists/i.test(error.message)
          ? "Já existe uma conta com este email."
          : error.message;
        return json({ error: msg }, 400);
      }
      const id = data.user.id;
      await admin.from("profiles").upsert({ user_id: id, full_name: b.full_name }, { onConflict: "user_id" }).then(async (r) => {
        if (r.error) await admin.from("profiles").update({ full_name: b.full_name }).eq("user_id", id);
      });
      await admin.from("user_roles").delete().eq("user_id", id);
      const { error: re } = await admin.from("user_roles").insert({ user_id: id, role: "admin" });
      if (re) return json({ error: "Convite enviado mas falhou a atribuição de admin: " + re.message }, 500);
      return json({ ok: true, message: `Convite enviado para ${b.email}.` });
    }

    const target = b.user_id;
    if (target === callerId) return json({ error: "Não pode executar esta ação na sua própria conta." }, 400);

    if (b.action === "demote_admin" || b.action === "delete_user" || b.action === "restrict_user") {
      if ((await targetIsAdmin(target)) && (await countAdmins()) <= 1) {
        return json({ error: "Não é possível remover o último administrador." }, 400);
      }
    }

    if (b.action === "delete_user") {
      const { error } = await admin.auth.admin.deleteUser(target);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, message: "Utilizador eliminado." });
    }
    if (b.action === "restrict_user" || b.action === "unrestrict_user") {
      const { error } = await admin.auth.admin.updateUserById(target, {
        ban_duration: b.action === "restrict_user" ? "876000h" : "none",
      } as any);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, message: b.action === "restrict_user" ? "Acesso restringido." : "Acesso reposto." });
    }
    if (b.action === "demote_admin") {
      await admin.from("user_roles").delete().eq("user_id", target);
      const { error } = await admin.from("user_roles").insert({ user_id: target, role: "student" });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, message: "Privilégios de administrador removidos." });
    }
    return json({ error: "Ação desconhecida." }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message ?? "Erro interno." }, 500);
  }
});
