"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AvatarUploadProps {
  currentStorageKey: string | null;
  currentSignedUrl: string | null;
  userName: string;
  userId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AvatarUpload({
  currentStorageKey: _currentStorageKey,
  currentSignedUrl,
  userName,
  userId,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentSignedUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Força re-render quando currentSignedUrl muda (ex: após refresh)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resetKey = currentSignedUrl ?? "";
  const [signedUrlKey, setSignedUrlKey] = useState(resetKey);
  if (resetKey !== signedUrlKey) {
    setSignedUrlKey(resetKey);
    if (!selectedFile) {
      setPreviewUrl(currentSignedUrl);
    }
  }

  // Extrai iniciais do nome (ex: "João Silva" → "JS")
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // -----------------------------------------------------------------------
  // Validação client-side antes do upload
  // -----------------------------------------------------------------------
  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return "Formato não permitido. Use PNG, JPEG ou WebP.";
    }

    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `Arquivo muito grande (${sizeMB}MB). Máximo: 5MB.`;
    }

    if (file.size === 0) {
      return "Arquivo vazio.";
    }

    return null;
  }, []);

  // -----------------------------------------------------------------------
  // Handler: arquivo selecionado
  // -----------------------------------------------------------------------
  const handleFileSelected = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      // Preview local
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);
    },
    [validateFile, previewUrl]
  );

  // -----------------------------------------------------------------------
  // Handler: upload
  // -----------------------------------------------------------------------
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("entityType", "users");
      formData.append("entityId", userId);
      formData.append("file", selectedFile);

      const response = await fetch("/api/v1/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(body.error ?? `Erro ${response.status}`);
      }

      const result = await response.json();
      const { storageKey, signedUrl } = result;

      // Salva o storageKey no registro do usuário
      const updateResponse = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarStorageKey: storageKey }),
      });

      if (!updateResponse.ok) {
        console.warn("Avatar salvo no storage mas não foi possível atualizar o perfil.");
      }

      // Atualiza estado
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setAvatarKey(storageKey);
      setPreviewUrl(signedUrl);
      setSelectedFile(null);
      toast.success("Avatar atualizado com sucesso!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer upload.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, userId, previewUrl]);

  // -----------------------------------------------------------------------
  // Handlers: drag & drop
  // -----------------------------------------------------------------------
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelected(file);
    },
    [handleFileSelected]
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar com overlay de hover para upload */}
      <div
        className={cn(
          "relative cursor-pointer group",
          isDragging && "scale-105"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="Alterar foto do perfil"
      >
        <Avatar size="xl" ring={!!avatarKey}>
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt={userName} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>

        {/* Overlay na hover */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Input de arquivo oculto */}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelected(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Nome do arquivo selecionado */}
      {selectedFile && (
        <p className="text-xs text-muted">
          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
        </p>
      )}

      {/* Botão de upload */}
      {selectedFile && (
        <Button
          variant="primary"
          size="sm"
          onClick={handleUpload}
          loading={isUploading}
          disabled={isUploading}
        >
          {isUploading ? (
            "Enviando..."
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Fazer upload
            </>
          )}
        </Button>
      )}

      {/* Dica */}
      {!selectedFile && !avatarKey && (
        <p className="text-xs text-muted">
          Clique na foto para alterar • PNG, JPEG ou WebP • até 5MB
        </p>
      )}

      {!selectedFile && avatarKey && (
        <p className="text-xs text-muted">
          Clique na foto para trocar a imagem
        </p>
      )}

      {/* Atalho: remover seleção */}
      {selectedFile && (
        <button
          type="button"
          className="text-xs text-muted underline hover:text-fg transition-colors"
          onClick={() => {
            if (previewUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(previewUrl);
            }
            setSelectedFile(null);
            setPreviewUrl(currentSignedUrl);
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
