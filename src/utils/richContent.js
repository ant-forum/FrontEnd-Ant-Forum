import { sanitizeHtml } from "./sanitizeHtml";

export const looksLikeHtml = (value = "") =>
  /<\/?[a-z][\s\S]*>/i.test(String(value));

export const looksLikeMarkdown = (value = "") => {
  const text = String(value);
  return (
    /(^|\n)\s{0,3}#{1,3}\s+/.test(text) ||
    /(^|\n)\s*```/.test(text) ||
    /(^|\n)\s*[-*]\s+/.test(text) ||
    /(^|\n)\s*\d+\.\s+/.test(text) ||
    /(^|\n)\s*> /.test(text) ||
    /\|.+\|\n\s*\|?\s*:?-{3,}/.test(text) ||
    /!\[[^\]]*]\([^)]+\)/.test(text) ||
    /\[[^\]]+]\([^)]+\)/.test(text) ||
    /[*_~`]/.test(text)
  );
};

const escapeHtml = (text = "") =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderInlineMarkdown = (text = "") => {
  let html = escapeHtml(text);

  html = html.replace(/!\[([^\]]*)]\(([^)]+)\)/g, (_, alt, url) => {
    return `<img class="markdown-image" src="${url}" alt="${alt}" loading="lazy">`;
  });

  html = html.replace(
    /\[([^\]]+)]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/~~(.*?)~~/g, "<s>$1</s>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  return html;
};

const splitTableRow = (line = "") =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const isTableSeparator = (line = "") =>
  /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);

const isSpecialMarkdownLine = (line = "", nextLine = "") => {
  const trimmed = line.trim();

  return (
    trimmed.startsWith("```") ||
    trimmed.startsWith("# ") ||
    trimmed.startsWith("## ") ||
    trimmed.startsWith("### ") ||
    trimmed.startsWith("> ") ||
    trimmed.startsWith("- ") ||
    /^\d+\.\s+/.test(trimmed) ||
    trimmed === "---" ||
    (line.includes("|") && isTableSeparator(nextLine))
  );
};

export const markdownToHtml = (markdown = "") => {
  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextLine = lines[i + 1] || "";

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      i++;
      const codeLines = [];

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }

      if (i < lines.length && lines[i].trim().startsWith("```")) i++;
      output.push(
        `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    if (trimmed === "---") {
      output.push("<hr>");
      i++;
      continue;
    }

    if (line.includes("|") && isTableSeparator(nextLine)) {
      const headers = splitTableRow(line);
      i += 2;
      const rows = [];

      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }

      output.push(`
        <table>
          <thead>
            <tr>${headers.map((header) => `<th>${renderInlineMarkdown(header)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      `);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      output.push(`<h3>${renderInlineMarkdown(trimmed.slice(4))}</h3>`);
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      output.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      output.push(`<h1>${renderInlineMarkdown(trimmed.slice(2))}</h1>`);
      i++;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      output.push(
        `<blockquote>${quoteLines.map(renderInlineMarkdown).join("<br>")}</blockquote>`,
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().replace(/^-\s?/, ""));
        i++;
      }
      output.push(
        `<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      output.push(
        `<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`,
      );
      continue;
    }

    const paragraphLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isSpecialMarkdownLine(lines[i], lines[i + 1] || "")
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    output.push(
      `<p>${paragraphLines.map(renderInlineMarkdown).join("<br>")}</p>`,
    );
  }

  return output.join("\n");
};

export const renderStoredContent = (value = "") => {
  const content = String(value || "");
  if (!content.trim()) return "";

  if (looksLikeHtml(content)) return sanitizeHtml(content);
  if (looksLikeMarkdown(content)) return sanitizeHtml(markdownToHtml(content));

  return sanitizeHtml(
    content
      .split(/\n{2,}/)
      .map(
        (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
      )
      .join(""),
  );
};

export const htmlToPlainText = (value = "") => {
  if (typeof document === "undefined") {
    return String(value)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const div = document.createElement("div");
  div.innerHTML = renderStoredContent(value);
  return div.textContent.replace(/\s+/g, " ").trim();
};
