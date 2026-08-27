#!/usr/bin/env node
/**
 * 스타일 단일 경로 검사 — REQ-TEC-012 · C-TEC-018
 *
 * 정식 게이트 G5는 FR-005에서 온다. 여기서는 같은 검사를 grep 수준으로만 한다.
 * 켜 두지 않으면 화면들이 갈라지고 FR-005 시점에 전량 재작업한다.
 *
 * 검사 4종 — 각 0건이어야 한다:
 *   1. app/globals.css 외의 CSS 파일
 *   2. CSS-in-JS (styled-components · @emotion)
 *   3. 인라인 style={{ ... }}
 *   4. 임의 색상 리터럴 (#hex · rgb() · hsl())
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN = ["app", "src"];
const CSS_ENTRY = "app/globals.css";
const CODE_EXT = /\.(tsx?|jsx?|mjs)$/;

/** 색 리터럴 예외 — 이 파일만 색을 직접 쓴다 */
const COLOR_ALLOWED = new Set([CSS_ENTRY]);

const violations = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else check(full);
  }
}

function check(full) {
  const rel = relative(ROOT, full).split("\\").join("/");

  // 1. globals.css 외의 CSS 파일
  if (/\.(css|scss|sass|less|styl)$/.test(rel) && rel !== CSS_ENTRY) {
    violations.push([1, rel, 0, "globals.css 외의 스타일시트"]);
    return;
  }
  if (!CODE_EXT.test(rel) && rel !== CSS_ENTRY) return;

  const lines = readFileSync(full, "utf8").split("\n");
  lines.forEach((line, i) => {
    const n = i + 1;
    const code = line.replace(/\/\/.*$/, ""); // 한 줄 주석 제외

    // 2. CSS-in-JS
    if (/from\s+["'](styled-components|@emotion\/[\w-]+)["']/.test(code)) {
      violations.push([2, rel, n, "CSS-in-JS import"]);
    }
    // 3. 인라인 style
    if (/\bstyle=\{\{/.test(code)) {
      violations.push([3, rel, n, "인라인 style={{ }}"]);
    }
    // 4. 색 리터럴
    if (!COLOR_ALLOWED.has(rel)) {
      if (/#[0-9a-fA-F]{3,8}\b/.test(code) || /\b(rgba?|hsla?)\s*\(/.test(code)) {
        violations.push([4, rel, n, "색 리터럴 — CSS 변수를 참조하라"]);
      }
    }
  });
}

for (const d of SCAN) {
  try {
    walk(join(ROOT, d));
  } catch {
    /* 아직 없는 디렉터리는 건너뛴다 */
  }
}

const LABEL = {
  1: "globals.css 외 CSS",
  2: "CSS-in-JS",
  3: "인라인 style",
  4: "색 리터럴",
};
const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
for (const [rule] of violations) counts[rule]++;

console.log("check:style — 스타일 단일 경로");
for (const r of [1, 2, 3, 4]) {
  console.log(`  ${r}. ${LABEL[r].padEnd(18)} ${counts[r]}건`);
}
if (violations.length) {
  console.error("\n위반 목록:");
  for (const [rule, file, line, msg] of violations) {
    console.error(`  ${file}:${line}  [${LABEL[rule]}] ${msg}`);
  }
  console.error(`\n총 ${violations.length}건 — 통과하려면 0건이어야 한다.`);
  process.exit(1);
}
console.log("\n총 0건 — 통과");
