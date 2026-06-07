// Markdown utility for rendering and stripping markdown content

export function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderInlineMarkdown(text = "") {
  let html = escapeHtml(text);

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    // Skip blob URLs since they're temporary and won't persist
    if (url.startsWith("blob:")) {
      return `<span class="text-muted small"><i class="bi bi-image"></i> ${alt || "[image]"}</span>`;
    }
    // Otherwise render the image normally
    return `<img class="markdown-image" src="${url}" alt="${alt}" loading="lazy">`;
  });

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/~~(.*?)~~/g, "<s>$1</s>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  return html;
}

const splitTableRow = (line = "") => {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
};

const isTableSeparator = (line = "") => {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
};

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

export function markdownToHtml(markdown = "") {
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

      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++;
      }

      output.push(
        `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`
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

      const headerHtml = headers
        .map((header) => `<th>${renderInlineMarkdown(header)}</th>`)
        .join("");

      const rowsHtml = rows
        .map((row) => {
          const cellsHtml = row
            .map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`)
            .join("");

          return `<tr>${cellsHtml}</tr>`;
        })
        .join("");

      output.push(`
        <table>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
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
        `<blockquote>${quoteLines.map(renderInlineMarkdown).join("<br>")}</blockquote>`
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
        `<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`
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
        `<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`
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
      `<p>${paragraphLines.map(renderInlineMarkdown).join("<br>")}</p>`
    );
  }

  return output.join("\n");
}

export function stripMarkdown(md = "") {
  if (!md) return "";
  // First convert/remove HTML if any
  let text = md.replace(/<[^>]*>/g, "");
  // Remove markdown headers
  text = text.replace(/^\s*#+\s+/gm, "");
  // Remove markdown formatting (bold, italic, strikethrough)
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  text = text.replace(/~~(.*?)~~/g, "$1");
  // Remove code blocks and inline code
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`([^`]+)`/g, "$1");
  // Remove links markdown but keep text: [label](url) -> label
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  // Remove images
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
  // Remove blockquote symbol
  text = text.replace(/^\s*>\s+/gm, "");
  // Remove bullet points/numbered lists symbols
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");
  // Collapse multiple spaces/newlines
  text = text.replace(/\s+/g, " ").trim();
  return text;
}
