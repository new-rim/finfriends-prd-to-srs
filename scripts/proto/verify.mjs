#!/usr/bin/env node
/**
 * 프로토타입 완료 판정 L1~L6 — 런 파일 §2
 * 각 조건의 실측값을 stdout에 출력하고, 하나라도 위반이면 non-zero로 종료한다.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SNAP = "docs/prototype-visual-plan/render-snapshot";
const only = process.argv.includes("--screen")
  ? process.argv[process.argv.indexOf("--screen") + 1]
  : null;

const results = [];
const pass = (id, label, detail) => results.push({ id, ok: true, label, detail });
const fail = (id, label, detail) => results.push({ id, ok: false, label, detail });

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");
const sh = (cmd) => {
  try {
    return { ok: true, out: execSync(cmd, { encoding: "utf8", stdio: "pipe" }) };
  } catch (e) {
    return { ok: false, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
};

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir)) {
    if (n === "node_modules" || n === ".next" || n.startsWith(".")) continue;
    const f = join(dir, n);
    statSync(f).isDirectory() ? walk(f, out) : out.push(relative(ROOT, f));
  }
  return out;
}
const SRC = [...walk("app"), ...walk("src")].filter((f) => /\.(tsx?|mjs)$/.test(f));

// ── L1 로컬 완결 ────────────────────────────────────────────────
// 🔴 캐시가 낡았으면 「미측정」이지 「통과」가 아니다. 신선도를 안 보면 서버가
// 꺼져 있어도 옛 응답으로 ✅가 난다 — 계측기가 거짓말을 하게 된다(5R EVIDENCE 1).
const HTTP_CACHE = "/tmp/proto-http.json";
const cacheAgeSec = existsSync(HTTP_CACHE)
  ? (Date.now() - statSync(HTTP_CACHE).mtimeMs) / 1000
  : Infinity;
const CACHE_MAX_AGE = 120;
const http = cacheAgeSec <= CACHE_MAX_AGE ? JSON.parse(read(HTTP_CACHE) || "{}") : {};
const envFiles = readdirSync(ROOT).filter((f) => f.startsWith(".env"));
const netHits = SRC.filter((f) =>
  /\b(fetch\(|axios|XMLHttpRequest|new WebSocket)/.test(readFileSync(f, "utf8")),
);
const codes = Object.entries(http);
const bad = codes.filter(([, c]) => c !== 200);
if (envFiles.length === 0 && netHits.length === 0 && codes.length >= 3 && bad.length === 0)
  pass(
    "L1",
    "로컬 완결",
    `.env ${envFiles.length}개 · 외부호출 ${netHits.length}건 · HTTP ${codes.map(([p, c]) => `${p}=${c}`).join(" ")} (실측 ${Math.round(cacheAgeSec)}초 전)`,
  );
else if (codes.length === 0)
  fail(
    "L1",
    "로컬 완결",
    cacheAgeSec === Infinity
      ? "미측정 — HTTP 캐시가 없다. verify_prototype.sh 로 실행하라"
      : `미측정 — HTTP 캐시가 ${Math.round(cacheAgeSec)}초 전 것이다(상한 ${CACHE_MAX_AGE}초). verify_prototype.sh 로 실행하라`,
  );
else
  fail("L1", "로컬 완결", `.env ${envFiles.length}개 · 외부호출 ${netHits.length}건(${netHits}) · 비200 ${JSON.stringify(bad)}`);

// ── L2 빌드 · 라우트 그룹 ────────────────────────────────────────
const ROUTES = [
  ["app/(guardian)/tree/page.tsx", "/tree"],
  ["app/(child)/learn/spend/page.tsx", "/learn/spend"],
  ["app/(child)/retro/page.tsx", "/retro"],
  ["app/(child)/wishlist/page.tsx", "/wishlist"],
  ["app/(child)/missions/page.tsx", "/missions"],
  ["app/(guardian)/forest/page.tsx", "/forest"],
  ["app/(child)/plan/page.tsx", "/plan"],
  ["app/(child)/history/page.tsx", "/history"],
  ["app/(child)/avatar/page.tsx", "/avatar"],
  ["app/(guardian)/guardian/missions/page.tsx", "/guardian/missions"],
];
const missing = ROUTES.filter(([f]) => !existsSync(f));
const skip = (id) => only !== null && only !== id;
const build = skip("L2") ? { ok: true, out: "(--screen: 건너뜀)" } : sh("npx next build");
if (build.ok && missing.length === 0)
  pass("L2", "빌드 · 라우트 그룹", `next build exit 0 · 10/10 경로 존재 (${ROUTES.map(([, r]) => r).join(" ")})`);
else fail("L2", "빌드 · 라우트 그룹", build.ok ? `누락 ${missing.map(([f]) => f)}` : "next build 실패");

// ── L3 스타일 단일 경로 ─────────────────────────────────────────
const style = skip("L3") ? { ok: true, out: "(--screen: 건너뜀)" } : sh("node scripts/gates/check-style.mjs");
style.ok
  ? pass("L3", "스타일 단일 경로", "위반 0건 (CSS·CSS-in-JS·인라인 style·색 리터럴)")
  : fail("L3", "스타일 단일 경로", style.out.trim().split("\n").slice(-1)[0]);

// ── L4 아동 접근성 (터치 44px · 대비 4.5:1) ──────────────────────
const css = read("app/globals.css");
const childBlock = /\[data-theme="child"\]\s*\{([\s\S]*?)\}/.exec(css)?.[1] ?? "";
const touch = Number(/--touch-min:\s*(\d+)px/.exec(childBlock)?.[1] ?? 0);
const hex = (name) => /^#?([0-9a-f]{6})$/i.exec((new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(childBlock)?.[1] ?? "").trim())?.[1];
const lum = (h) => {
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const surface = hex("surface"), text = hex("text"), muted = hex("text-muted"), accent = hex("accent");
const r1 = ratio(text, surface), r2 = ratio(muted, surface), r3 = ratio(accent, surface);
const minRatio = Math.min(r1, r2, r3);
// 🔴 토큰이 「정의됐다」와 「화면에 걸린다」는 다르다.
// CSS 변수는 조상 → 자손으로만 상속되므로, [data-theme] 안에 정의한 변수를
// body 같은 조상 셀렉터에서 참조하면 해석되지 않는다 — 값은 파일에 있는데
// 화면에는 안 걸린다. 4R이 이 어긋남을 잡았다. 아래 두 검사가 재발을 막는다.
const themeVars = new Set([...childBlock.matchAll(/--([\w-]+):/g)].map((m) => m[1]));
const cssBare = css.replace(/\/\*[\s\S]*?\*\//g, ""); // 주석 안의 문장을 셀렉터로 오인하지 않게
const scopeErrors = [];
for (const [, sel, blockBody] of cssBare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const selector = sel.trim();
  // [data-theme]을 포함하지 않는 셀렉터 = 테마 블록의 조상일 수 있는 자리
  if (/\[data-theme/.test(selector)) continue;
  for (const [, v] of blockBody.matchAll(/var\(--([\w-]+)\)/g)) {
    if (themeVars.has(v)) scopeErrors.push(`${selector} { var(--${v}) }`);
  }
}
const allSrc = SRC.map((f) => readFileSync(f, "utf8")).join("\n") + css;
const unusedVars = [...themeVars].filter(
  (v) => (allSrc.match(new RegExp(`var\\(--${v}\\)`, "g")) ?? []).length === 0,
);
if (touch >= 44 && minRatio >= 4.5 && scopeErrors.length === 0 && unusedVars.length === 0)
  pass(
    "L4",
    "아동 접근성 · 토큰",
    `터치 ${touch}px ≥ 44 · 대비 text ${r1.toFixed(1)} · muted ${r2.toFixed(1)} · accent ${r3.toFixed(1)} (최소 ${minRatio.toFixed(1)} ≥ 4.5) · 스코프 이탈 0 · 미소비 토큰 0/${themeVars.size}`,
  );
else
  fail(
    "L4",
    "아동 접근성 · 토큰",
    `터치 ${touch}px · 최소 대비 ${minRatio.toFixed(2)} · 스코프 이탈 ${scopeErrors.length}건 ${scopeErrors} · 미소비 토큰 ${unusedVars.length}건 ${unusedVars.map((v) => "--" + v)}`,
  );

// ── L5 빈 상태 3종 · 4영역 표기 일치 ────────────────────────────
const areasSrc = read("src/contracts/areas.ts");
const labels = [...areasSrc.matchAll(/label:\s*"([^"]+)"/g)].map((m) => m[1]);
const treeSnap = read(`${SNAP}/tree.txt`);
const learnSnap = read(`${SNAP}/learn.txt`);
const retroSnap = read(`${SNAP}/retro.txt`);
const empties = [
  ["실천 0건", /아직 기록이 없어요[\s\S]*미션 하나만 해내도/.test(treeSnap)],
  ["곧 열려요", /곧 열려요[\s\S]*지금은 배우기만 할 수 있어요/.test(treeSnap)],
  ["회고 큐 빔", /지금은 돌아볼 게 없어요[\s\S]*계획을 적고 쓰면/.test(retroSnap)],
];
const treeLabels = labels.filter((l) => treeSnap.includes(l));
const learnLabel = labels.find((l) => learnSnap.includes(l));
// 🔴 규칙은 "화면에 나오면 안 된다"이지 "소스에 문자열이 없어야 한다"가 아니다.
// PRD 문서 명칭을 근거로 인용하는 주석(예: P-03「별은 모으기만」)은 정당하다.
// 그래서 ① 렌더 결과(권위) ② 주석을 걷어낸 소스 — 둘 다 본다.
const DOC_NAMES = ["벌기", "잘 쓰기", "모으기", "불리기"];
const stripComments = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const leakedSrc = SRC.filter((f) =>
  DOC_NAMES.some((d) => stripComments(readFileSync(f, "utf8")).includes(d)),
);
const leakedRender = ["home", "tree", "learn", "retro", "wishlist", "missions", "forest", "plan", "history"].filter((n) =>
  DOC_NAMES.some((d) => read(`${SNAP}/${n}.txt`).includes(d)),
);
const leaked = [...leakedSrc, ...leakedRender.map((n) => `render:${n}`)];
const emptyOk = empties.every(([, ok]) => ok);
// 🔴 계획 §5.4가 확정한 3단계 도형이 실제로 그려졌는가.
// 6R까지 아무도 못 잡은 이유는 계측기가 svg를 아예 안 봤기 때문이다 —
// html-to-text.mjs가 이제 <svg stage=...>를 DOM 개요에 남기고, 여기서 그것을 센다.
const stagesDrawn = new Set([...treeSnap.matchAll(/<svg[^>]*stage=(\w+)/g)].map((m) => m[1]));
const STAGES = ["SEED", "SPROUT", "TREE"];
const figureOk = STAGES.every((v) => stagesDrawn.has(v)); // 계획 §5.4 — 3단계 전부
if (emptyOk && treeLabels.length === 4 && learnLabel && leaked.length === 0 && figureOk)
  pass(
    "L5",
    "빈 상태 · 표기 · 도형",
    `빈 상태 3/3 · 나무 표기 4/4 (${treeLabels.join(" ")}) · 학습 "${learnLabel}" 일치 · PRD 문서 명칭 누출 0건 (렌더 4/4 · 소스 주석 제외) · 단계 도형 3/3 (${STAGES.join("/")})`,
  );
else
  fail(
    "L5",
    "빈 상태 · 표기 · 도형",
    `빈 상태 ${empties.filter(([, o]) => o).length}/3 (${empties.filter(([, o]) => !o).map(([n]) => n)}) · 나무 표기 ${treeLabels.length}/4 · 누출 ${leaked.length}건 ${leaked} · 단계 도형 ${stagesDrawn.size}/3 (${[...stagesDrawn].join("/") || "0건 — 계획 §5.4의 CSS/SVG 3단계 도형이 없다"})`,
  );

// ── L6 시나리오 불변식 ──────────────────────────────────────────
const test = skip("L6") ? { ok: true, out: "(--screen: 건너뜀)" } : sh('node --test "src/**/*.test.ts"');
const passCount = /# pass (\d+)/.exec(test.out)?.[1] ?? /pass (\d+)/.exec(test.out)?.[1] ?? "?";
test.ok
  ? pass("L6", "시나리오 불변식", `단위 테스트 ${passCount}건 통과 — 회고 별 건수 = 나무 「잘 써요」 실천 횟수`)
  : fail("L6", "시나리오 불변식", test.out.trim().split("\n").slice(-3).join(" "));

// ── 출력 ────────────────────────────────────────────────────────
const shown = only ? results.filter((r) => r.id === only) : results;
console.log("\n프로토타입 완료 판정 — L1~L6\n" + "─".repeat(72));
for (const r of shown) console.log(`  ${r.ok ? "✅" : "❌"} ${r.id}  ${r.label.padEnd(14)} ${r.detail}`);
const failed = shown.filter((r) => !r.ok);
console.log("─".repeat(72));
console.log(`  ${shown.length - failed.length}/${shown.length} 통과`);
process.exit(failed.length ? 1 : 0);
