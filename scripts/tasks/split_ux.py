#!/usr/bin/env python3
"""UX-00N 한 건의 manifest 편성을 「디자인 명세 + 화면 구현」 2건으로 쪼갠다.

편성 수치·파생 필드 규칙의 근거는 docs/uxui-integration-stage/DECISION_LOG.md
MINOR-3(dur 분배) · MINOR-4(일정·파생 필드) · CORE-2(num=null)에 있다.
태스크 마크다운은 이 스크립트가 만들지 않는다 — 사람이 이음선을 보고 쓴다.

사용법:  python3 scripts/tasks/split_ux.py UX-002 [--dry-run]
"""
import datetime, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MANIFEST = os.path.join(ROOT, 'scripts/github/manifest.json')
BASE = datetime.date(2026, 9, 7)
PROJECT_END = 56                       # FR-036의 ef — slack 산출 기준
M1 = 'M1 기반 — 인프라·스키마·접근계층·계약·Mock'

# 디자인 명세의 dur(MINOR-3)과 착수 D+(MINOR-4 · 2트랙 병렬)
PLAN = {
    'UX-002': (2, 3),  'UX-003': (2, 3),
    'UX-004': (5, 5),  'UX-005': (2, 5),
    'UX-009': (2, 7),  'UX-007': (1, 9),
    'UX-006': (3, 10), 'UX-008': (1, 10),
}

def bd(n):
    d, c = BASE, 0
    while c < n:
        d += datetime.timedelta(days=1)
        if d.weekday() < 5:
            c += 1
    return d

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry-run' in sys.argv
    if len(args) != 1 or args[0] not in PLAN:
        sys.exit('사용법: split_ux.py <%s> [--dry-run]' % '|'.join(sorted(PLAN)))
    base = args[0]
    d_dur, d_es = PLAN[base]

    with open(MANIFEST, encoding='utf-8') as f:
        L = json.load(f)
    idx = next((i for i, o in enumerate(L) if o['id'] == base), None)
    if idx is None:
        sys.exit('%s 없음' % base)
    impl = L[idx]
    did = base + 'd'
    if any(o['id'] == did for o in L):
        sys.exit('%s 이미 존재 — 재실행 불필요' % did)

    orig_dur = impl['dur']
    if d_dur >= orig_dur:
        sys.exit('%s: 디자인 dur %d >= 원본 %d' % (base, d_dur, orig_dur))

    # ── 디자인 명세 (신설) ──────────────────────────────────────────────
    d_ef = d_es + d_dur
    d_slack = PROJECT_END - d_ef
    slug = os.path.basename(impl['file']).split('_', 1)[1].rsplit('.', 1)[0]
    design = {
        'id': did,
        'file': 'tasks/stage-0/%s_%s-spec.md' % (did, slug),
        'title': impl['title'].replace('[UI/UX] %s:' % base, '[UI/UX] %s:' % did),
        'labels': list(impl['labels']),
        'milestone': M1,
        'start': bd(d_es).isoformat(),
        'target': bd(d_ef - 1).isoformat(),
        'es': d_es, 'ef': d_ef, 'dur': d_dur, 'slack': d_slack,
        'lane': 'X', 'cx': impl['cx'],
        'absorb': 0,
        'ac': 0,                                  # 행위 기준은 전건 구현 귀속 (MINOR-2)
        'downstream': 1,                          # 후행은 짝 구현 1건 (구현은 말단)
        'deps': ['UX-001'],                       # FR 선행 0건 — 이것이 통합 단계의 핵심
        'blocked': [],
        'critical': d_slack == 0,
        'parts': [[did, d_dur, d_es, d_ef, d_slack]],
        'num': None,                              # GitHub 미반영 (CORE-2)
    }

    # ── 화면 구현 (제자리 수정) ─────────────────────────────────────────
    i_dur = orig_dur - d_dur
    i_ef = impl['es'] + i_dur
    i_slack = PROJECT_END - i_ef
    before = (impl['dur'], impl['ef'], impl['target'], impl['slack'])
    impl['dur'] = i_dur
    impl['ef'] = i_ef
    impl['target'] = bd(i_ef - 1).isoformat()
    impl['slack'] = i_slack
    impl['critical'] = i_slack == 0
    impl['deps'] = impl['deps'] + [did]
    impl['parts'] = [[base, i_dur, impl['es'], i_ef, i_slack]]

    L.insert(idx, design)      # 짝 구현 바로 앞에 넣는다 — 원본 순서를 흩지 않는다

    print('%s 분리' % base)
    print('  + %-9s D+%-2d~%-2d dur=%d slack=%d  선행=%s  %s'
          % (did, d_es, d_ef, d_dur, d_slack, design['deps'], design['file']))
    print('  ~ %-9s D+%-2d~%-2d dur=%d→%d ef=%d→%d target=%s→%s slack=%d→%d'
          % (base, impl['es'], i_ef, before[0], i_dur, before[1], i_ef,
             before[2], impl['target'], before[3], i_slack))
    print('  ~ %-9s 선행 += %s' % ('', did))
    if dry:
        print('  (--dry-run — 저장하지 않음)')
        return
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump(L, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('  → manifest.json 저장 (%d건)' % len(L))

if __name__ == '__main__':
    main()
