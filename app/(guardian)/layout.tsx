// 테마는 라우트 그룹 레이아웃에서 한 번만 건다 — 계획 §6.3 · 규칙 §7
export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="guardian">{children}</div>;
}
