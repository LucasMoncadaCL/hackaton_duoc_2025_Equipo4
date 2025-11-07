"use client";

import { useState } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Goal {
  id: string;
  category: string;
  title: string;
  description: string;
  target: string;
  frequency: string;
  completed_days: number[];
  total_days: number;
  is_completed: boolean;
}

interface PlanGoalCardProps {
  goal: Goal;
  planId: string;
}

export function PlanGoalCard({ goal }: PlanGoalCardProps) {
  const [completed, setCompleted] = useState(goal.is_completed);
  const [completedDays, setCompletedDays] = useState<number[]>(
    goal.completed_days || []
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleDay = async (day: number) => {
    setIsUpdating(true);
    const newCompletedDays = completedDays.includes(day)
      ? completedDays.filter((d) => d !== day)
      : [...completedDays, day];

    const isComplete = newCompletedDays.length >= goal.total_days;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("plan_goals")
        .update({
          completed_days: newCompletedDays,
          is_completed: isComplete,
        })
        .eq("id", goal.id);

      if (!error) {
        setCompletedDays(newCompletedDays);
        setCompleted(isComplete);
      }
    } catch (error) {
      console.error("Error updating goal:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const progress = (completedDays.length / goal.total_days) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {goal.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              <strong>Meta:</strong> {goal.target}
            </span>
            <span>
              <strong>Frecuencia:</strong> {goal.frequency}
            </span>
          </div>
        </div>
        {completed && (
          <div className="flex-shrink-0">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm font-medium text-gray-700">
            {completedDays.length} / {goal.total_days} días
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              completed ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: goal.total_days }, (_, i) => i + 1).map((day) => {
          const isCompleted = completedDays.includes(day);
          return (
            <button
              key={day}
              onClick={() => handleToggleDay(day)}
              disabled={isUpdating}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                isCompleted
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

