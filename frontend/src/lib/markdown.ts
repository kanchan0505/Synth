// src/lib/markdown.ts
export function markdownToHtml(md: string): string {
  if (!md) return "";
  return (
    md
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h2>$1</h2>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/^[\-\*] (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener" style="color:var(--blue)">$1</a>'
      )
      .replace(
        /(?<!href=")(https?:\/\/[^\s)<]+)/g,
        (url) => {
          const cleanUrl = url.replace(/[.,;:]+$/, "");
          const trailing = url.slice(cleanUrl.length);
          return `<a href="${cleanUrl}" target="_blank" rel="noopener" style="color:var(--blue)">${cleanUrl}</a>${trailing}`;
        }
      )
      .replace(/\n\n+/g, "</p><p>")
      .replace(/^(?!<[hul])(.+)/, "<p>$1") + "</p>"
  );
}

export function extractScore(text: string): string {
  const match = text.match(/Score:\s*([0-9.]+\/10)/);
  return match ? match[1] : "N/A";
}
