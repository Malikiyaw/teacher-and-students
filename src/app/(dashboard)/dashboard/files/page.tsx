"use client";

import { useState } from "react";
import { Upload, FolderOpen, File, Image, Trash2, Download, MoreHorizontal, Search } from "lucide-react";

const files = [
  { id: "1", name: "biology-diagram.png", type: "image", size: "2.4 MB", uploaded: "2 days ago" },
  { id: "2", name: "chapter-4-notes.pdf", type: "document", size: "1.1 MB", uploaded: "3 days ago" },
  { id: "3", name: "class-photo.jpg", type: "image", size: "3.8 MB", uploaded: "1 week ago" },
  { id: "4", name: "quiz-template.pdf", type: "document", size: "0.4 MB", uploaded: "2 weeks ago" },
];

export default function FilesPage() {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
            Files
          </h1>
          <p className="text-sm text-charcoal/45">
            7.7 MB of 1 GB used (Starter plan)
          </p>
        </div>
        <label className="flex items-center gap-2 bg-sienna text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-sienna-dark transition-all duration-300 cursor-pointer">
          <Upload className="w-4 h-4" />
          Upload
          <input type="file" className="hidden" multiple />
        </label>
      </div>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center mb-8 transition-all duration-300 ${
          dragOver
            ? "border-sienna bg-sienna/5"
            : "border-border hover:border-charcoal/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => setDragOver(false)}
      >
        <div className="w-12 h-12 bg-charcoal/5 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-5 h-5 text-charcoal/30" />
        </div>
        <p className="text-sm text-charcoal/50 mb-1">
          Drag & drop files here, or{" "}
          <span className="text-sienna font-medium cursor-pointer">
            browse
          </span>
        </p>
        <p className="text-xs text-charcoal/30">
          Images, PDFs, and documents up to 10MB
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
        <input
          type="text"
          placeholder="Search files..."
          className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-sienna/40 outline-none transition-colors"
        />
      </div>

      {/* File list */}
      <div className="bg-white border border-border rounded-xl divide-y divide-border">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-4 px-5 py-4 hover:bg-cream/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-charcoal/5 rounded-lg flex items-center justify-center shrink-0">
              {file.type === "image" ? (
                <Image className="w-5 h-5 text-charcoal/30" />
              ) : (
                <File className="w-5 h-5 text-charcoal/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-charcoal truncate">
                {file.name}
              </div>
              <div className="text-xs text-charcoal/40">
                {file.size} &middot; {file.uploaded}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-charcoal/30 hover:text-charcoal/60 rounded-lg hover:bg-charcoal/5 transition-all">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 text-charcoal/30 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
