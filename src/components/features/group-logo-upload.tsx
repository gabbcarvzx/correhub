"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface GroupLogoUploadProps {
  groupSlug: string;
  groupName: string;
  currentSignedUrl: string | null;
}

export function GroupLogoUpload({
  groupSlug,
  groupName,
  currentSignedUrl,
}: GroupLogoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentSignedUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resetKey = currentSignedUrl ?? "";
  const [signedUrlKey, setSignedUrlKey] = useState(resetKey);
  if (resetKey !== signedUrlKey) {
    setSignedUrlKey(resetKey);
    if (!selectedFile) setPreviewUrl(currentSignedUrl);
  }

  const initials = groupName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 5 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) return "Formato não permitido. Use PNG, JPEG ou WebP.";
    if (file.size > maxSize) return `Arquivo muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). Máximo: 5MB.`;
    if (file.size === 0) return "Arquivo vazio.";
    return null;
  }, []);

  const handleFileSelected = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) { toast.error(error); return; }
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
  }, [validateFile, previewUrl]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("entityType", "groups");
      formData.append("entityId", groupSlug);
      formData.append("file", selectedFile);

      const response = await fetch("/api/v1/uploads", { method: "POST", body: formData });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? `Erro ${response.status}`);

      const { storageKey, signedUrl } = await response.json();
      const updateResponse = await fetch(`/api/v1/groups/${groupSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoStorageKey: storageKey }),
      });

      if (!updateResponse.ok) throw new Error((await updateResponse.json().catch(() => ({}))).error ?? "Erro ao salvar logo.");

      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(signedUrl);
      setSelectedFile(null);
      toast.success("Logo do grupo atualizado!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao fazer upload.");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, groupSlug, previewUrl]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
  }, [handleFileSelected]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn("relative cursor-pointer group", isDragging && "scale-105")}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        aria-label="Alterar logo do grupo">
        <Avatar size="xl">
          {previewUrl ? <AvatarImage src={previewUrl} alt={groupName} /> : <AvatarFallback>{initials}</AvatarFallback>}
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Camera className="h-6 w-6 text-white" />}
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelected(file); e.target.value = ""; }} />
      </div>

      {selectedFile && <p className="text-xs text-muted">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</p>}
      {selectedFile && (
        <Button variant="primary" size="sm" onClick={handleUpload} loading={isUploading} disabled={isUploading}>
          {isUploading ? "Enviando..." : <><Upload className="h-4 w-4" />Fazer upload</>}
        </Button>
      )}
      {!selectedFile && <p className="text-xs text-muted">Clique para alterar o logo • PNG, JPEG ou WebP • até 5MB</p>}
      {selectedFile && (
        <button type="button" className="text-xs text-muted underline hover:text-fg transition-colors"
          onClick={() => { if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl); setSelectedFile(null); setPreviewUrl(currentSignedUrl); }}>
          Cancelar
        </button>
      )}
    </div>
  );
}
