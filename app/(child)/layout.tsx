// 테마는 라우트 그룹 레이아웃에서 한 번만 건다 — 계획 §6.3 · 규칙 §7
//
// 🔴 이 파일은 자리만 잡는다. 동의 게이트 판정(REQ-TEC-001 · X-1)은 FR-011의 범위이며
//    프로토타입에서 구현하지 않는다. 아동 화면이 (child) 아래에 있어야 그 판정이
//    나중에 여기 한 곳에 붙는다.
export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="child">{children}</div>;
}
