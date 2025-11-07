"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function ApiStatusBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkApiStatus = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${apiUrl}/`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        setShowBanner(!response.ok);
      } catch {
        setShowBanner(true);
      }
    };

    checkApiStatus();
  }, []);

  if (!showBanner) return null;

  return (
    <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-orange-800">
              <strong>Modo demostración:</strong> El backend no está conectado. 
              Las funciones de evaluación y coaching mostrarán datos de ejemplo.
            </p>
            <p className="text-xs text-orange-700 mt-1">
              Para funcionalidad completa, inicia el backend en{" "}
              <code className="bg-orange-100 px-1 py-0.5 rounded">
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
              </code>
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

