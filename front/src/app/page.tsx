import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-12 px-6 py-16">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">
          CardioSense
        </p>
        <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
          Plataforma híbrida ML + LLM para riesgo cardiometabólico
        </h1>
        <p className="text-base text-foreground/70 sm:text-lg">
          Esta interfaz captura datos estilo NHANES, consulta al backend `/predict`
          y genera coaching personalizado con `/coach`. Inicia sesión para acceder
          a tu panel.
        </p>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/login"
          className="rounded-md bg-black px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/app"
          className="rounded-md border border-black/10 px-4 py-2 text-center text-sm font-semibold text-foreground transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/40"
        >
          Ir al panel (si ya tienes sesión)
        </Link>
      </div>

      <footer className="border-t border-black/10 pt-6 text-xs text-foreground/60 dark:border-white/10">
        CardioSense es informativo. No reemplaza diagnóstico médico
        profesional.
      </footer>
    </main>
  );
}
