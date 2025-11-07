"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validators/auth";

export async function signInAction(
  prevState: { error: string | undefined } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: "Credenciales inválidas" };
  }

  revalidatePath("/", "layout");
  redirect("/app");
}

export async function signUpAction(
  prevState: { error: string | undefined } | undefined,
  formData: FormData
) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    age: formData.get("age") as string,
    sex: formData.get("sex") as string,
  };

  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        first_name: result.data.firstName,
        last_name: result.data.lastName,
        age: result.data.age,
        sex: result.data.sex,
      },
    },
  });

  if (error) {
    return { error: error.message || "Error al crear la cuenta" };
  }

  revalidatePath("/", "layout");
  redirect("/app");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

