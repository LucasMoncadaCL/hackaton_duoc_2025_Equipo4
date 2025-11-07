import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export function getUserRole(user: User): string | null {
  const role =
    (user.app_metadata as Record<string, unknown>)?.role ??
    (user.user_metadata as Record<string, unknown>)?.role;

  return typeof role === "string" ? role : null;
}

export async function requireAdmin() {
  const session = await requireUser();
  const role = getUserRole(session.user);

  if (role !== "admin") {
    redirect("/app");
  }

  return session;
}

