import { requireUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Target, Check, Plus } from "lucide-react";
import Link from "next/link";
import { PlanGoalCard } from "./PlanGoalCard";

export const runtime = "edge";

interface PlanGoal {
  id: string;
  category: "nutrition" | "exercise" | "sleep" | "lifestyle";
  title: string;
  description: string;
  target: string;
  frequency: string;
  completed_days: number[];
  total_days: number;
  is_completed: boolean;
}

interface ActionPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  progress: number;
  created_at: string;
  plan_goals: PlanGoal[];
}

export default async function ActionPlanPage() {
  const session = await requireUser();
  const supabase = await createClient();

  const { data: activePlans } = await supabase
    .from("action_plans")
    .select(`
      *,
      plan_goals(*)
    `)
    .eq("user_id", session.user.id)
    .gte("end_date", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false });

  const activePlan = activePlans?.[0] as ActionPlan | undefined;

  if (!activePlan) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No tienes un plan activo
          </h1>
          <p className="text-gray-600 mb-6">
            Habla con el Coach IA para generar un plan personalizado de 2 semanas
          </p>
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Crear Mi Plan
          </Link>
        </div>
      </div>
    );
  }

  const goals = activePlan.plan_goals || [];
  const completedGoals = goals.filter((g) => g.is_completed).length;
  const progress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  const startDate = new Date(activePlan.start_date);
  const endDate = new Date(activePlan.end_date);
  const today = new Date();
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = Math.ceil(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  const goalsByCategory = {
    nutrition: goals.filter((g) => g.category === "nutrition"),
    exercise: goals.filter((g) => g.category === "exercise"),
    sleep: goals.filter((g) => g.category === "sleep"),
    lifestyle: goals.filter((g) => g.category === "lifestyle"),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {activePlan.title}
        </h1>
        <p className="text-gray-600">{activePlan.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Días Restantes</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{daysRemaining}</p>
          <p className="text-sm text-gray-600 mt-1">de {totalDays} días</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Progreso</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {Math.round(progress)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {completedGoals} de {goals.length} objetivos
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Objetivos</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{goals.length}</p>
          <p className="text-sm text-gray-600 mt-1">metas totales</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Progreso General
        </h2>
        <div className="relative w-full bg-gray-200 rounded-full h-4">
          <div
            className="absolute top-0 left-0 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {goalsByCategory.nutrition.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-green-600">🥗</span> Nutrición
          </h2>
          <div className="grid gap-4">
            {goalsByCategory.nutrition.map((goal) => (
              <PlanGoalCard key={goal.id} goal={goal} planId={activePlan.id} />
            ))}
          </div>
        </div>
      )}

      {goalsByCategory.exercise.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-blue-600">💪</span> Ejercicio
          </h2>
          <div className="grid gap-4">
            {goalsByCategory.exercise.map((goal) => (
              <PlanGoalCard key={goal.id} goal={goal} planId={activePlan.id} />
            ))}
          </div>
        </div>
      )}

      {goalsByCategory.sleep.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-purple-600">😴</span> Sueño
          </h2>
          <div className="grid gap-4">
            {goalsByCategory.sleep.map((goal) => (
              <PlanGoalCard key={goal.id} goal={goal} planId={activePlan.id} />
            ))}
          </div>
        </div>
      )}

      {goalsByCategory.lifestyle.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-orange-600">🌟</span> Estilo de Vida
          </h2>
          <div className="grid gap-4">
            {goalsByCategory.lifestyle.map((goal) => (
              <PlanGoalCard key={goal.id} goal={goal} planId={activePlan.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

