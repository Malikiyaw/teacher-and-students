"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, Image, Trash2, Download, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FileItem {
  name: string;
  id: string | null;
  metadata?: { size?: number; mimetype?: string } | null;
  created_at: string | null;
}

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchFiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase.storage.from("files").list(user.id, {
        limit: 50,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (data) setFiles(data.filter((f) => f.name !== ".emptyFolderPlaceholder"));
      setLoading(false);
    };
    fetchFiles();
  }, [supabase, router]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    for (const file of Array.from(fileList)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      await supabase.storage.from("files").upload(path, file, { cacheControl: "3600", upsert: false });
    }

    const { data } = await supabase.storage.from("files").list(user.id, {
      limit: 50,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (data) setFiles(data.filter((f) => f.name !== ".emptyFolderPlaceholder"));
    setUploading(false);
  };

  const handleDelete = async (fileName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.storage.from("files").remove([`${user.id}/${fileName}`]);
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage.from("files").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Files</h1>
          <p className="text-sm text-charcoal/45">{formatSize(totalSize)} of 1 GB used</p>
        </div>
        <label className="flex items-center gap-2 bg-sienna text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-sienna-dark transition-all duration-300 cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload"}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center mb-8 transition-all duration-300 ${
          dragOver ? "border-sienna bg-sienna/5" : "border-border hover:border-charcoal/20"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
      >
        <div className="w-12 h-12 bg-charcoal/5 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-5 h-5 text-charcoal/30" />
        </div>
        <p className="text-sm text-charcoal/50 mb-1">Drag & drop files here, or <span className="text-sienna font-medium">browse</span></p>
        <p className="text-xs text-charcoal/30">Images, PDFs, and documents up to 10MB</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-sm text-charcoal/40">Loading...</div>
      ) : files.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <File className="w-10 h-10 text-charcoal/10 mx-auto mb-3" />
          <p className="text-sm text-charcoal/40">No files uploaded yet</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl divide-y divide-border">
          {files.map((file) => {
            const isImage = file.metadata?.mimetype?.startsWith("image/");
            return (
              <div key={file.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream/50 transition-colors group">
                <div className="w-10 h-10 bg-charcoal/5 rounded-lg flex items-center justify-center shrink-0">
                  {isImage ? <Image className="w-5 h-5 text-charcoal/30" /> : <File className="w-5 h-5 text-charcoal/30" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-charcoal truncate">{file.name}</div>
                  <div className="text-xs text-charcoal/40">{formatSize(file.metadata?.size)}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={getFileUrl(file.name)} download className="p-2 text-charcoal/30 hover:text-charcoal/60 rounded-lg hover:bg-charcoal/5 transition-all">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDelete(file.name)} className="p-2 text-charcoal/30 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
