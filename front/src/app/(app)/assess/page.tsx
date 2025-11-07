"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User } from "lucide-react";
import { healthAPI } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner, PermanentDisclaimer, DataExtractionCard } from "@/components";
import type { AssessmentData, ConversationMessage } from "@/lib/types";

const STORAGE_KEY = "conversation-draft";

export default function AssessmentPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<AssessmentData>>({});
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed.messages || []);
          setExtractedData(parsed.extractedData || {});
        } catch {
          // Ignore parsing errors
        }
      }
    }

    const loadUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.age) {
        setExtractedData((prev) => ({
          ...prev,
          age: Number(user.user_metadata.age),
          sex: user.user_metadata.sex as "F" | "M",
        }));
      }
    };
    loadUserData();

    if (messages.length === 0) {
      const welcomeMessage: ConversationMessage = {
        id: "welcome",
        role: "assistant",
        content: "¡Hola! Soy tu asistente de salud CardioSense 🩺\n\nVoy a ayudarte a evaluar tu riesgo cardiometabólico de manera conversacional. Solo cuéntame sobre ti de forma natural, como si conversáramos.\n\nPor ejemplo, puedes decirme: \"Tengo 35 años, mido 170cm, peso 75kg y mi cintura mide 85cm. Duermo unas 7 horas y hago ejercicio 3 veces por semana.\"\n\n¿Qué me puedes contar sobre ti?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages,
          extractedData,
        })
      );
    }
  }, [messages, extractedData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const conversationHistory = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await healthAPI.message(
        input,
        conversationHistory,
        extractedData
      );

      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.extracted_data) {
        setExtractedData((prev) => ({
          ...prev,
          ...response.extracted_data,
        }));
      }

      if (response.action === "redirect_results" && response.prediction) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Usuario no autenticado");

        const { data: assessment, error: dbError } = await supabase
          .from("assessments")
          .insert({
            user_id: user.id,
            assessment_data: extractedData as AssessmentData,
            risk_score: response.prediction.score,
            risk_level: response.prediction.risk_level,
            drivers: response.prediction.drivers,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        localStorage.removeItem(STORAGE_KEY);

        setTimeout(() => {
          router.push(`/results/${assessment.id}`);
        }, 2000);
      } else if (response.action === "redirect_coach" && response.assessment_id) {
        localStorage.removeItem(STORAGE_KEY);
        setTimeout(() => {
          router.push(`/coach?assessment=${response.assessment_id}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      let errorMessage = "Error al procesar tu mensaje. Inténtalo de nuevo.";

      if (err instanceof Error) {
        if (err.message.includes("fetch") || err.message.includes("Network")) {
          errorMessage = "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      const errorAssistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Lo siento, hubo un error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-red-50 via-white to-pink-50">
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 text-white px-4 sm:px-6 lg:px-8 py-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Evaluación Conversacional</h1>
              <p className="text-red-100 text-base">
                Cuéntame sobre tu salud de forma natural
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          {error && (
            <div className="bg-red-50 border-b-2 border-red-200 px-4 py-3">
              <p className="text-sm text-red-900 text-center font-medium">
                <strong className="text-red-700">⚠️ Error:</strong> {error}
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-200 px-4 py-3 shadow-sm">
            <p className="text-sm text-yellow-900 text-center font-medium">
              <strong className="text-yellow-700">⚕️ Recordatorio:</strong> Esta es una evaluación educativa. No reemplaza el consejo médico profesional.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {Object.keys(extractedData).length > 0 && (
              <DataExtractionCard extractedData={extractedData} />
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-5 shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-red-600 to-pink-600 text-white"
                      : "bg-white border-2 border-gray-100"
                  }`}
                >
                  <p
                    className={`text-base whitespace-pre-wrap leading-relaxed ${
                      message.role === "user" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {message.content}
                  </p>

                  <p
                    className={`text-xs mt-3 ${
                      message.role === "user" ? "text-red-100" : "text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-md">
                  <div className="flex items-center gap-3">
                    <LoadingSpinner size="sm" />
                    <span className="text-base text-gray-700 font-medium">
                      Procesando tu información...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t-2 border-gray-200 p-4 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tus datos aquí... (Presiona Enter para enviar)"
                  className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all text-base"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t-2 border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <PermanentDisclaimer />
        </div>
      </div>
    </div>
  );
}
