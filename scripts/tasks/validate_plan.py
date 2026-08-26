#!/usr/bin/env python3
"""편성 원장 정합성 검증 — `docs/goals/uxui-integration-stage.md`의 완료 게이트.

I1~I6은 재편성 전후로 항상 성립해야 하는 불변식이고(기준 편성 46/46 실측),
G1~G5는 UXUI 통합 단계가 끝났을 때 성립하는 목표 조건이다.
전부 통과하면 exit 0, 하나라도 어기면 exit 1.

불변식에서 「의존 타이밍」을 검사하지 않는 이유는 DECISION_LOG.md CORE-1에 있다 —
FASTTRACK 압축 편성이 parts로 부분 착수 중첩을 쓰므로 es == max(선행 ef)가 성립하지 않는다.
"""
import datetime, glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MANIFEST = os.path.join(ROOT, 'scripts/github/manifest.json')
BASE = datetime.date(2026, 9, 7)          # 착수 기준일 · 주말 제외
MAX_EF = 56                               # FASTTRACK 압축 편성 상한 (영업일)
DESIGN_MAX_ES = 10                        # 디자인 명세가 앞당겨졌다고 볼 상한
SPLIT_TARGETS = ['UX-00%d' % n for n in range(2, 10)]   # UX-002~009 (UX-001은 제외)
ID_RE = re.compile(r'\b((?:FR|UX)-\d{3}d?)\b')

_bd_cache = {}
def bd(n):
    """기준일부터 n 영업일 뒤 날짜."""
    if n in _bd_cache:
        return _bd_cache[n]
    d, c = BASE, 0
    while c < n:
        d += datetime.timedelta(days=1)
        if d.weekday() < 5:
            c += 1
    _bd_cache[n] = d
    return d

def load():
    with open(MANIFEST, encoding='utf-8') as f:
        return json.load(f)

def ids_in(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return set(ID_RE.findall(f.read()))

results = []
def check(code, title, ok, detail):
    results.append((code, title, ok, detail))

L = load()
M = {o['id']: o for o in L}
IDS = set(M)

# ── I1 · 건수·ID 집합 4중 일치 ────────────────────────────────────────────
files = {os.path.basename(p).split('_')[0] for p in glob.glob(os.path.join(ROOT, 'tasks/stage-*/*.md'))
         if not os.path.basename(p).startswith('_')}
idx, summ = ids_in('tasks/_index.md') & IDS, ids_in('tasks/_summary.md') & IDS
gaps = []
for name, s in (('태스크 파일', files), ('_index.md', idx), ('_summary.md', summ)):
    miss, extra = IDS - s, s - IDS
    if miss or extra:
        gaps.append('%s(누락 %s / 잉여 %s)' % (name, sorted(miss) or '-', sorted(extra) or '-'))
check('I1', 'manifest ↔ 태스크 파일 ↔ _index ↔ _summary ID 집합 일치',
      not gaps, 'manifest %d건 · 파일 %d · _index %d · _summary %d%s'
      % (len(IDS), len(files), len(idx), len(summ), ' | ' + ' ; '.join(gaps) if gaps else ''))

# ── I2 · manifest.file 경로 실존 ──────────────────────────────────────────
missing = [o['id'] for o in L if not os.path.exists(os.path.join(ROOT, o['file']))]
check('I2', 'manifest의 file 경로 전건 실존', not missing, '없는 경로: %s' % (missing or '없음'))

# ── I3 · deps 실존 + 순환 없음 ────────────────────────────────────────────
dangling = sorted({d for o in L for d in o['deps'] if d not in M})
WHITE, BLACK, cycles = 0, 2, []
state = {}
def visit(i, stack):
    if state.get(i) == BLACK:
        return
    if state.get(i) == 1:
        cycles.append(' → '.join(stack[stack.index(i):] + [i]))
        return
    state[i] = 1
    for d in M.get(i, {}).get('deps', []):
        if d in M:
            visit(d, stack + [d])
    state[i] = BLACK
for i in M:
    visit(i, [i])
check('I3', 'deps 전건 실존 · 의존 순환 0건', not dangling and not cycles,
      '미존재 선행: %s · 순환: %s' % (dangling or '없음', cycles or '없음'))

# ── I4 · 날짜 사상 · 진입점 ───────────────────────────────────────────────
bad = []
for o in L:
    if o['start'] != bd(o['es']).isoformat():
        bad.append('%s start=%s≠%s' % (o['id'], o['start'], bd(o['es'])))
    if o['target'] != bd(o['ef'] - 1).isoformat():
        bad.append('%s target=%s≠%s' % (o['id'], o['target'], bd(o['ef'] - 1)))
    if not o['deps'] and o['es'] != 0:
        bad.append('%s 선행없음인데 es=D+%d' % (o['id'], o['es']))
check('I4', 'start==영업일(es) · target==영업일(ef-1) · 선행없음→es=0',
      not bad, '위반 %d건 %s' % (len(bad), bad[:4]))

# ── I5 · 여유·임계 정합 ───────────────────────────────────────────────────
bad = [o['id'] for o in L if o['slack'] < 0 or o['critical'] != (o['slack'] == 0)]
check('I5', 'slack >= 0 · critical ⇔ slack==0', not bad, '위반: %s' % (bad or '없음'))

# ── I6 · parts 정합 ───────────────────────────────────────────────────────
bad = []
for o in L:
    p = o.get('parts') or []
    if not p:
        bad.append('%s parts 없음' % o['id']); continue
    if sum(x[1] for x in p) != o['dur']:
        bad.append('%s dur합 %d≠%d' % (o['id'], sum(x[1] for x in p), o['dur']))
    if min(x[2] for x in p) != o['es'] or max(x[3] for x in p) != o['ef']:
        bad.append('%s parts 구간이 [es,ef]와 불일치' % o['id'])
    for x in p:
        if x[3] - x[2] < x[1]:
            bad.append('%s/%s 구간(%d) < dur(%d)' % (o['id'], x[0], x[3] - x[2], x[1]))
check('I6', 'parts — dur합==dur · es==min · ef==max · 각 part 구간>=dur',
      not bad, '위반 %d건 %s' % (len(bad), bad[:4]))

# ── G1~G5 · 목표 조건 ─────────────────────────────────────────────────────
design = [o for o in L if o['id'].endswith('d')]
d_ids = {o['id'] for o in design}
expected = {t + 'd' for t in SPLIT_TARGETS}

check('G1', 'stage-0 디자인 명세 8건 존재 (UX-002d~UX-009d)',
      d_ids == expected and all(o['file'].startswith('tasks/stage-0/') for o in design),
      '%d/8건 · 누락 %s · stage-0 밖 %s'
      % (len(d_ids), sorted(expected - d_ids) or '없음',
         [o['id'] for o in design if not o['file'].startswith('tasks/stage-0/')] or '없음'))

fr_dep = [(o['id'], d) for o in design for d in o['deps'] if d.startswith('FR-')]
check('G2', '디자인 명세의 FR-* 선행 0건', not fr_dep, 'FR 선행: %s' % (fr_dep or '없음'))

d_es = max((o['es'] for o in design), default=None)
check('G3', '디자인 명세 max(es) <= D+%d' % DESIGN_MAX_ES,
      d_es is not None and d_es <= DESIGN_MAX_ES,
      'max(es)=%s (기준 편성에서는 D+25~42)' % ('D+%d' % d_es if d_es is not None else '디자인 태스크 없음'))

unpaired = [t for t in SPLIT_TARGETS if t in M and (t + 'd') not in M[t]['deps']]
check('G4', '구현 8건이 각각 대응 디자인 명세를 선행으로 보유',
      not unpaired and all(t in M for t in SPLIT_TARGETS),
      '짝 %d/8 · 미연결: %s' % (8 - len(unpaired), unpaired or '없음'))

mx = max(o['ef'] for o in L)
check('G5', '전체 max(ef) <= %d 영업일' % MAX_EF, mx <= MAX_EF, 'max(ef)=D+%d' % mx)

# ── 출력 ──────────────────────────────────────────────────────────────────
# --invariants-only : 분리 진행 중 건별 게이트. G1~G5는 8건이 다 끝나야 성립한다 (DECISION_LOG MINOR-5).
ONLY_INV = '--invariants-only' in sys.argv
if ONLY_INV:
    results = [r for r in results if r[0].startswith('I')]
W = max(len(t) for _, t, _, _ in results)
print('편성 원장 검증 — %s' % os.path.relpath(MANIFEST, ROOT))
print('=' * (W + 22))
fails = 0
for code, title, ok, detail in results:
    if not ok:
        fails += 1
    print('%s %-3s %-*s  %s' % ('✅' if ok else '❌', code, W, title, detail))
print('=' * (W + 22))
print('%s — 통과 %d / %d' % ('불변식 I1~I6 (건별 게이트)' if ONLY_INV else '불변식 I1~I6 · 목표 조건 G1~G5',
                              len(results) - fails, len(results)))
sys.exit(1 if fails else 0)
