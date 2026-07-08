"use client";

interface MarkdownExportSlide {
  elements: Array<{
    type: string;
    content: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: string;
    alt?: string;
    href?: string;
    codeLanguage?: string;
  }>;
}

export function exportToMarkdown(slides: MarkdownExportSlide[]): string {
  const parts: string[] = [];

  for (const slide of slides) {
    const lines: string[] = [];
    let hasTitle = false;

    for (const el of slide.elements) {
      if (el.type === "text") {
        const content = el.content || "";
        if (!hasTitle && el.fontSize && el.fontSize >= 36 && el.fontWeight === "bold") {
          lines.push(`# ${content}`);
          hasTitle = true;
        } else if (el.fontSize && el.fontSize >= 28 && el.fontWeight === "bold") {
          lines.push(`## ${content}`);
        } else if (el.fontSize && el.fontSize >= 22 && el.fontWeight === "bold") {
          lines.push(`### ${content}`);
        } else if (content.startsWith("• ")) {
          lines.push(`- ${content.slice(2)}`);
        } else if (/^\d+\.\s/.test(content)) {
          lines.push(content);
        } else if (el.fontStyle === "italic") {
          lines.push(`> ${content}`);
        } else if (el.href) {
          lines.push(`[${content}](${el.href})`);
        } else {
          lines.push(content);
        }
      } else if (el.type === "image") {
        const alt = el.alt || "image";
        lines.push(`![${alt}](${el.content})`);
      } else if (el.type === "code") {
        const lang = el.codeLanguage || "";
        lines.push("```" + lang);
        lines.push(el.content);
        lines.push("```");
      }
    }

    parts.push(lines.join("\n"));
  }

  return parts.join("\n\n---\n\n");
}

export function downloadMarkdown(slides: MarkdownExportSlide[], title: string) {
  const md = exportToMarkdown(slides);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyMarkdownToClipboard(slides: MarkdownExportSlide[]) {
  const md = exportToMarkdown(slides);
  navigator.clipboard.writeText(md).catch(() => {
    const textarea = document.createElement("textarea");
    textarea.value = md;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  });
}
