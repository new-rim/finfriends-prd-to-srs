#!/usr/bin/env node
/** HTML → 텍스트 + DOM 개요. 평가자(브라우저 없음)가 화면을 읽는 유일한 수단 */
let html = "";
process.stdin.setEncoding("utf8");
for await (const c of process.stdin) html += c;

const body = html.replace(/[\s\S]*?<body[^>]*>/i, "").replace(/<\/body>[\s\S]*/i, "");
const stripped = body
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "");

// DOM 개요 — 태그 흐름과 data-theme
const outline = [];
const tagRe = /<(h1|h2|h3|main|section|article|ol|ul|li|dl|a|button|label|input|svg|figure)\b([^>]*)>/gi;
let m;
while ((m = tagRe.exec(stripped))) {
  const attrs = m[2];
  const theme = /data-theme="([^"]+)"/.exec(attrs)?.[1];
  const role = /role="([^"]+)"/.exec(attrs)?.[1];
  const stage = /data-stage="([^"]+)"/.exec(attrs)?.[1];
  outline.push(
    `<${m[1].toLowerCase()}${theme ? ` theme=${theme}` : ""}${role ? ` role=${role}` : ""}${stage ? ` stage=${stage}` : ""}>`,
  );
}

const text = stripped
  .replace(/<[^>]+>/g, "\n")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .join("\n");

const theme = /data-theme="([^"]+)"/.exec(stripped)?.[1] ?? "(없음)";
console.log(`## THEME\n${theme}\n\n## DOM 개요\n${outline.join(" ")}\n\n## 렌더 텍스트\n${text}`);
