#!/usr/bin/env python3
"""분리된 UX-00N(화면 구현) 태스크 파일의 기계적 부분을 고친다.

- 머리 주석에 「디자인 선행」 한 줄 추가
- 「🎨 이 이슈는 디자인과 구현을 함께 진다」 절 → 분리 사실과 역할 표로 교체
- Depends on 줄에 디자인 태스크 추가
- 「🔴 UX 선행:」 줄 → 「🔴 디자인 선행:」으로 교체

AC·DoD·Task Breakdown은 건드리지 않는다 (DECISION_LOG MINOR-2).
사용법: python3 scripts/tasks/rewrite_impl.py UX-003
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sync_ledgers import GIST                                  # 디자인 산출물 한 줄 요약

def main():
    if len(sys.argv) != 2:
        sys.exit('사용법: rewrite_impl.py <UX-00N>')
    base = sys.argv[1]
    did = base + 'd'
    with open(os.path.join(ROOT, 'scripts/github/manifest.json'), encoding='utf-8') as f:
        M = {o['id']: o for o in json.load(f)}
    if did not in M:
        sys.exit('%s 없음 — split_ux.py를 먼저 실행한다' % did)
    d, impl = M[did], M[base]
    fr = [x for x in impl['deps'] if x.startswith('FR-')]
    path = os.path.join(ROOT, impl['file'])
    s = io.open(path, encoding='utf-8').read()
    hits = []

    # ① 머리 주석
    m = re.search(r'^(FR 선행: .*)$', s, flags=re.M)
    if m and '디자인 선행:' not in s:
        s = s[:m.end()] + ('\n디자인 선행: %s (tasks/stage-0/ · UXUI 통합 단계에서 디자인 묶음 분리)' % did) + s[m.end():]
        hits.append('머리 주석')

    # ② 🎨 절 교체
    a = s.find('### 🎨 이 이슈는 디자인과 구현을 함께 진다')
    b = s.find('## 🔗 References')
    if a != -1 and b > a:
        new = ('### 🎨 디자인 명세는 `%s`로 분리되었다\n\n'
               '개정 3.1은 디자인과 화면 구현을 한 이슈로 합쳤고, 그 대가를 스스로 이렇게 적어 두었다.\n\n'
               '- 🔴 **DoD가 두 묶음이다** — 「디자인 완료」와 「구현 완료」를 나눠 체크한다.\n'
               '- 🔴 **FR 선행이 생겼다** — 통합 전에는 디자인이 개발과 무관하게 먼저 갈 수 있었다.\n\n'
               '**UXUI 통합 단계에서 그 두 묶음의 경계를 두 태스크로 승격했다.** 디자인 명세는 '
               '`%s`(Stage 0 · D+%d~%d · **FR 선행 0건**)가 지고, 이 이슈는 **화면 구현만** 진다.\n\n'
               '| | 디자인 명세 `%s` | 화면 구현 `%s` (이 이슈) |\n| --- | --- | --- |\n'
               '| 무엇 | %s | 그 명세를 화면으로 구현 · 조회·액션 결과 바인딩 · 계측 |\n'
               '| 선행 | `UX-001` | %s · **`%s`** |\n'
               '| 판정 | 산출물 확정 (DoD 디자인 묶음) | **아래 AC와 DoD 전건** |\n\n'
               '> AC와 DoD는 **하나도 옮기지 않았다.** 행위 기준은 동작하는 화면이 있어야 판정되고, '
               'DoD는 전부 *만들어진 화면의 성질*을 묻기 때문이다. 근거: '
               '`docs/uxui-integration-stage/DECISION_LOG.md` MINOR-2.\n\n'
               % (did, did, d['es'], d['ef'], did, base, GIST.get(did, '디자인 명세'),
                  ' · '.join('`%s`' % x for x in fr) or '—', did))
        s = s[:a] + new + s[b:]
        hits.append('🎨 절')

    # ③ Depends on
    m = re.search(r'^- \*\*Depends on:\*\* (.+)$', s, flags=re.M)
    if m and did not in m.group(1):
        s = s.replace(m.group(0), m.group(0) + ' · 🆕 **`%s`**(디자인 명세)' % did, 1)
        hits.append('Depends on')

    # ④ UX 선행 줄
    m = re.search(r'^- 🔴 \*\*UX 선행:\*\*.*$', s, flags=re.M)
    if m:
        s = s.replace(m.group(0),
                      '- 🔴 **디자인 선행:** `%s` — %s *(Stage 0 · D+%d~%d)*'
                      % (did, GIST.get(did, '디자인 명세'), d['es'], d['ef']), 1)
        hits.append('디자인 선행 줄')

    io.open(path, 'w', encoding='utf-8').write(s)
    print('%s 구현 파일 갱신 — %s' % (base, ' · '.join(hits) or '변경 없음'))

if __name__ == '__main__':
    main()
