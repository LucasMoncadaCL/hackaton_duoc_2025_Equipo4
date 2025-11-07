"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Bot, User } from "lucide-react";
import { healthAPI } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components";
import type { AssessmentData } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ source: string; text: string }>;
  timestamp: Date;
}

export default function CoachPage() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams?.get("assessment");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<{
    assessment_data: AssessmentData;
    risk_score: number;
    risk_level: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAssessment = async () => {
      if (!assessmentId) return;

      const supabase = createClient();
      const { data } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (data) {
        setAssessmentData({
          assessment_data: data.assessment_data,
          risk_score: data.risk_score,
          risk_level: data.risk_level,
        });
      }
    };

    loadAssessment();
  }, [assessmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await healthAPI.coach(input, assessmentData ? {
        assessment_data: assessmentData.assessment_data,
        risk_score: assessmentData.risk_score,
        chat_history: chatHistory,
      } : undefined);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        citations: response.citations,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!sessionId && assessmentId) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: session } = await supabase
            .from("chat_sessions")
            .insert({
              user_id: user.id,
              assessment_id: assessmentId,
              title: input.slice(0, 50),
            })
            .select()
            .single();

          if (session) {
            setSessionId(session.id);

            await supabase.from("chat_messages").insert([
              {
                session_id: session.id,
                role: "user",
                content: userMessage.content,
              },
              {
                session_id: session.id,
                role: "assistant",
                content: assistantMessage.content,
                citations: assistantMessage.citations,
              },
            ]);
          }
        }
      } else if (sessionId) {
        const supabase = createClient();
        await supabase.from("chat_messages").insert([
          {
            session_id: sessionId,
            role: "user",
            content: userMessage.content,
          },
          {
            session_id: sessionId,
            role: "assistant",
            content: assistantMessage.content,
            citations: assistantMessage.citations,
          },
        ]);
      }
    } catch (error) {
      console.error("Error calling coach:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 sm:px-6 lg:px-8 py-8 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Coach de Salud IA</h1>
              <p className="text-blue-100 text-lg">
                Recomendaciones personalizadas basadas en evidencia científica
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-200 px-4 py-3 shadow-sm">
            <p className="text-sm text-yellow-900 text-center font-medium">
              <strong className="text-yellow-700">⚕️ Recordatorio:</strong> Este coach es una herramienta
              educativa. No reemplaza el consejo médico profesional.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-2xl mb-6 animate-bounce-slow">
                  <Bot className="h-20 w-20 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  ¿En qué puedo ayudarte?
                </h2>
                <p className="text-gray-600 text-lg max-w-md mb-6">
                  Pregúntame sobre nutrición, ejercicio, hábitos de sueño, o
                  cómo mejorar tu salud cardiovascular.
                </p>
                {process.env.NEXT_PUBLIC_API_AVAILABLE === "false" && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 max-w-md mb-8 shadow-sm">
                    <p className="text-sm text-orange-900 font-medium">
                      <strong className="text-orange-700">🔔 Nota:</strong> Modo demostración activo. 
                      Las respuestas serán de ejemplo hasta que conectes el backend.
                    </p>
                  </div>
                )}
                <div className="grid gap-4 max-w-2xl w-full">
                  <button
                    onClick={() =>
                      setInput(
                        "¿Qué cambios puedo hacer en mi dieta para reducir mi riesgo cardiovascular?"
                      )
                    }
                    className="px-6 py-4 bg-white border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg transition-all text-left font-medium text-gray-800 flex items-start gap-3"
                  >
                    <span className="text-2xl">🥗</span>
                    <span>¿Qué cambios puedo hacer en mi dieta?</span>
                  </button>
                  <button
                    onClick={() =>
                      setInput(
                        "¿Cuánto ejercicio debería hacer semanalmente?"
                      )
                    }
                    className="px-6 py-4 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-400 hover:shadow-lg transition-all text-left font-medium text-gray-800 flex items-start gap-3"
                  >
                    <span className="text-2xl">💪</span>
                    <span>¿Cuánto ejercicio debería hacer?</span>
                  </button>
                  <button
                    onClick={() =>
                      setInput("¿Cómo puedo mejorar la calidad de mi sueño?")
                    }
                    className="px-6 py-4 bg-white border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-400 hover:shadow-lg transition-all text-left font-medium text-gray-800 flex items-start gap-3"
                  >
                    <span className="text-2xl">😴</span>
                    <span>¿Cómo mejorar mi calidad de sueño?</span>
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-5 shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                      : "bg-white border-2 border-gray-100"
                  }`}
                >
                  <p className={`text-base whitespace-pre-wrap leading-relaxed ${
                    message.role === "user" ? "text-white" : "text-gray-800"
                  }`}>
                    {message.content}
                  </p>

                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-blue-100">
                      <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                        <span>📚</span> Fuentes científicas:
                      </p>
                      <ul className="space-y-2">
                        {message.citations.map((citation, idx) => (
                          <li key={idx} className="text-xs text-gray-700 bg-blue-50 rounded-lg p-2">
                            <span className="font-bold text-blue-600">[{idx + 1}]</span> {citation.source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className={`text-xs mt-3 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-400"
                  }`}>
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
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-md">
                  <div className="flex items-center gap-3">
                    <LoadingSpinner size="sm" />
                    <span className="text-base text-gray-700 font-medium">
                      Generando respuesta...
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
                  placeholder="Escribe tu pregunta aquí... (Presiona Enter para enviar)"
                  className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all text-base"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

