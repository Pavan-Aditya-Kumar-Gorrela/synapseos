// app/(dashboard)/documents/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DocumentService, DocumentListItem } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore"; // adjust to your auth hook

// ── helpers ───────────────────────────────────────────────


const STATUS_META: Record<DocumentListItem["status"], { label: string; dot: string; text: string }> = {
  ready:      { label: "READY",      dot: "bg-emerald-400",              text: "text-emerald-400" },
  processing: { label: "PROCESSING", dot: "bg-yellow-400 animate-pulse", text: "text-yellow-400" },
  uploading:  { label: "UPLOADING",  dot: "bg-blue-400 animate-pulse",   text: "text-blue-400"   },
  failed:     { label: "FAILED",     dot: "bg-red-500",                  text: "text-red-400"    },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status: DocumentListItem["status"] }) {
  const m = STATUS_META[status] ?? STATUS_META.failed;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono font-bold tracking-wider">
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      <span className={m.text}>{m.label}</span>
    </span>
  );
}

// ── page ──────────────────────────────────────────────────

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

export default function DocumentsPage() {
  const { token } = useAuthStore();

  const [docs, setDocs]         = useState<DocumentListItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError]       = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── fetch ──────────────────────────────────────────────

  const fetchDocs = useCallback(
    async (q?: string) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await DocumentService.list(token, 0, 50, q);
        setDocs(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load documents.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // ── search debounce ─────────────────────────────────────

  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchDocs(search || undefined), 350);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [search, fetchDocs]);

  // ── upload ──────────────────────────────────────────────

  const handleFile = async (file: File) => {
    if (!token) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Unsupported type: ${file.type}. Use PDF, DOCX, TXT, or CSV.`);
      return;
    }
    setError(null);
    setUploading(true);
    setUploadProgress(10);

    // Fake progress ticks while upload is in-flight
    const ticker = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 5 : p));
    }, 200);

    try {
      const doc = await DocumentService.upload(file, token);
      clearInterval(ticker);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
        // Prepend to list
        setDocs((prev) => [doc as DocumentListItem, ...prev]);
      }, 600);
    } catch (e: unknown) {
      clearInterval(ticker);
      setUploadProgress(0);
      setUploading(false);
      setError(e instanceof Error ? e.message : "Upload failed.");
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // ── delete ──────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await DocumentService.delete(id, token);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  // ── render ──────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0B1020] text-[#dee1f9] p-6 md:p-8 font-sans">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-[#adc6ff] tracking-tight">
              Document Intelligence
            </h2>
            <p className="text-sm text-[#94A3B8] mt-1">
              Upload, process, and search your organization's documents.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-[#111827]/70 border border-white/5 px-4 py-2 rounded-lg text-xs font-mono">
            <span className="text-[#94A3B8] tracking-widest text-[10px]">DOCUMENTS</span>
            <span className="font-bold text-[#2fd9f4]">{docs.length}</span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-950/40 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            <span>⚠</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-300 hover:text-white">✕</button>
          </div>
        )}

        {/* Upload zone */}
        <div
          className={`relative mb-6 bg-[#111827]/70 backdrop-blur-xl border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
            ${dragging
              ? "border-[#2fd9f4]/70 bg-[#2fd9f4]/5"
              : "border-[#adc6ff]/20 hover:border-[#adc6ff]/50"
            }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.csv"
            onChange={onFileInputChange}
          />

          <div className="flex flex-col items-center gap-4 py-8 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-[#adc6ff]/10 flex items-center justify-center text-2xl">
              {uploading ? "⏳" : "☁️"}
            </div>
            <div>
              <p className="text-lg font-medium text-[#dee1f9]">
                {uploading ? "Processing upload…" : "Drop file here or click to browse"}
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">PDF · DOCX · TXT · CSV · Max 50 MB</p>
            </div>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2f3446] rounded-b-xl overflow-hidden">
              <div
                className="h-full bg-[#2fd9f4] shadow-[0_0_8px_#2fd9f4] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-5 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111827]/70 border border-white/10 text-[#dee1f9] placeholder-[#4a5568] text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-[#adc6ff]/50 transition-colors"
          />
        </div>

        {/* Document list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#94A3B8] text-sm gap-3">
            <span className="animate-spin">⟳</span> Loading documents…
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8] gap-3">
            <span className="text-4xl opacity-30">📄</span>
            <p className="text-sm">{search ? "No documents match your search." : "No documents yet. Upload your first file."}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 bg-[#111827]/70 border border-white/5 rounded-xl px-5 py-4 hover:border-[#adc6ff]/20 transition-all group"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-[#2f3446] flex items-center justify-center text-base flex-shrink-0">
                  {doc.file_type.includes("pdf") ? "📕"
                    : doc.file_type.includes("word") ? "📘"
                    : doc.file_type.includes("csv") ? "📊"
                    : "📄"}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#dee1f9] truncate">
                    {doc.original_filename}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {formatBytes(doc.file_size)} ·{" "}
                    {new Date(doc.created_at).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>

                {/* Status */}
                <StatusBadge status={doc.status} />

                {/* Delete */}
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#94A3B8] hover:text-red-400 transition-all text-sm px-2 py-1 rounded"
                  title="Delete document"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}