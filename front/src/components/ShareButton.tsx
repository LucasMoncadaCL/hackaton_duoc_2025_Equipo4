"use client";

import { Share2, Check, Copy } from "lucide-react";
import { useState } from "react";
import { generateShareToken, getShareableUrl, copyToClipboard } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ShareButtonProps {
  assessmentId: string;
  existingToken?: string;
  onTokenGenerated?: (token: string) => void;
}

export function ShareButton({
  assessmentId,
  existingToken,
  onTokenGenerated,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareToken, setShareToken] = useState(existingToken);

  const handleShare = async () => {
    setIsSharing(true);

    try {
      let token = shareToken;

      if (!token) {
        token = generateShareToken();
        const supabase = createClient();

        const { error } = await supabase
          .from("assessments")
          .update({ share_token: token })
          .eq("id", assessmentId);

        if (error) throw error;

        setShareToken(token);
        onTokenGenerated?.(token);
      }

      const shareUrl = getShareableUrl(token);
      const success = await copyToClipboard(shareUrl);

      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        alert("No se pudo copiar el enlace. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error sharing assessment:", error);
      alert("Error al generar el enlace compartible. Inténtalo de nuevo.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing || copied}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        copied
          ? "bg-green-600 text-white"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>¡Enlace copiado!</span>
        </>
      ) : isSharing ? (
        <>
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Generando...</span>
        </>
      ) : shareToken ? (
        <>
          <Copy className="h-4 w-4" />
          <span>Copiar enlace</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Compartir resultados</span>
        </>
      )}
    </button>
  );
}

