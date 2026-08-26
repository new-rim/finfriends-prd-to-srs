#!/usr/bin/env python3
"""manifest.json의 디자인 명세(stage-0) 항목으로 tasks/_index.md · tasks/_summary.md를 재생성한다.

손으로 세 원장을 맞추면 어긋난다. 이 스크립트는 마커 사이 블록만 갈아 끼우므로
몇 번 실행해도 결과가 같다(멱등). 검증은 validate_plan.py I1이 한다.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MANIFEST = os.path.join(ROOT, 'scripts/github/manifest.json')
BEGIN, END = '<!-- STAGE0:BEGIN -->', '<!-- STAGE0:END -->'

# 디자인 명세 한 줄 요약 — 원본의 「🔴 UX 선행」 열거에서 뽑았다
GIST = {
    'UX-002d': '온보딩 5단계 플로우 · Stepper 시각 규칙 · 재개 표기 문구 · 실패 화면 사유 · PWA 배너 배치',
    'UX-003d': '아동 온보딩 첫 보상 루프 5분 구성 · 학습·퀴즈 화면 · 아동용 문구 체계 적용',
    'UX-004d': '성장 나무 단계 표현 · **정체 원인의 조건 단위 표시** · 월간 숲 · 빈 상태 · 소비 내역',
    'UX-005d': '승인 대기 목록 · 거절 사유 Dialog · **시각 구별 규칙**(대기/승인/거절)',
    'UX-006d': '계획 카드 Form · Select(업종) · Input(금액) · 두 갈래 회고의 색 분기',
    'UX-007d': '아바타·옷장 · 위시리스트 단계 보상 표기 · 별 잔액 표현',
    'UX-008d': '운영자 콘솔 · AI 초안 검토 · 문장 풀 잔여율 표시',
    'UX-009d': '카드 없는 체험 잠금 화면 — 잠금 사유와 해제 경로의 표현',
}

def design_tasks():
    with open(MANIFEST, encoding='utf-8') as f:
        L = json.load(f)
    d = [o for o in L if o['id'].endswith('d')]
    return sorted(d, key=lambda o: (o['es'], o['id'])), len(L)

def splice(text, block):
    """마커 블록을 갈아 끼운다. 없으면 삽입 위치를 호출자가 정한 상태여야 한다."""
    if BEGIN in text:
        return re.sub(re.escape(BEGIN) + r'.*?' + re.escape(END), block, text, flags=re.S)
    return None

def sync_index(D, total):
    p = os.path.join(ROOT, 'tasks/_index.md')
    t = open(p, encoding='utf-8').read()

    rows = '\n'.join(
        '| `%s` | `%s` | %s | %s ~ %s | D+%d | 여유 %d일 |'
        % (o['id'], o['file'].split('/', 1)[1], o['milestone'][:2], o['start'], o['target'], o['es'], o['slack'])
        for o in D)
    block = (BEGIN + '\n\n### Stage 0 — 디자인 명세 (UXUI 통합 단계 · %d건)\n\n'
             '> `UX-002`~`UX-009`에서 **디자인 묶음을 분리**한 것이다. **FR 선행이 없어** `UX-001` 직후에 착수한다.\n'
             '> GitHub 이슈 번호가 없다 — 로컬 편성만이다 (`docs/uxui-integration-stage/DECISION_LOG.md` CORE-2).\n\n'
             '| Task ID | 파일 | 마일스톤 | 착수 ~ 완료 | D+ | 여유 |\n'
             '| --- | --- | :-: | :-: | :-: | :-: |\n%s\n\n' % (len(D), rows) + END)

    new = splice(t, block)
    if new is None:                                     # 최초 삽입 — Stage 표 뒤에
        anchor = '\n## 2. FR-### ↔ GitHub 이슈 번호 매핑'
        new = t.replace(anchor, '\n' + block + '\n' + anchor, 1)
    t = new

    # Stage 표 — Stage 0 행과 합계
    row0 = ('| **0** | `[UI/UX]` **디자인 명세 %d건** — `UX-002d`~`UX-009d` '
            '*(FR 선행 없음)* | %d | 🆕 **UXUI 통합 단계** |' % (len(D), len(D)))
    if re.search(r'^\| \*\*0\*\* \|', t, flags=re.M):
        t = re.sub(r'^\| \*\*0\*\* \|.*$', row0, t, flags=re.M)
    elif D:
        t = t.replace('| **1** | `[Infra]`', row0 + '\n| **1** | `[Infra]`', 1)
    t = re.sub(r'^\| \| \*\*합계\*\* \| \*\*\d+\*\* \| \|$',
               '| | **합계** | **%d** | |' % total, t, flags=re.M)
    open(p, 'w', encoding='utf-8').write(t)
    return len(D)

def sync_summary(D, total):
    p = os.path.join(ROOT, 'tasks/_summary.md')
    t = open(p, encoding='utf-8').read()

    rows = '\n'.join('| `%s` | %s |' % (o['id'], GIST.get(o['id'], '디자인 명세')) for o in D)
    block = (BEGIN + '\n\n## Stage 0 — 디자인 명세 (UXUI 통합 단계 · %d건 · FR 선행 0건)\n\n'
             '| Task ID | 핵심 제약 |\n| --- | --- |\n%s\n\n' % (len(D), rows) + END)

    new = splice(t, block)
    if new is None:
        anchor = '\n## Stage 1 — '
        new = t.replace(anchor, '\n' + block + '\n' + anchor, 1)
    t = new
    t = re.sub(r'\*\*\d+건 \(FR 37 \+ UI/UX 9 · 전건 Stage 배정\)\*\*',
               '**%d건 (FR 37 + UI/UX 9 + 디자인 명세 %d · 전건 Stage 배정)**' % (total, len(D)), t)
    t = re.sub(r'\*\*대상:\*\* `tasks/stage-1/`', '**대상:** `tasks/stage-0/`', t)
    open(p, 'w', encoding='utf-8').write(t)

def main():
    D, total = design_tasks()
    n = sync_index(D, total)
    sync_summary(D, total)
    print('원장 동기화 — 디자인 명세 %d건 · 전체 %d건' % (n, total))
    for o in D:
        print('  %-9s D+%-2d~%-2d  %s' % (o['id'], o['es'], o['ef'], o['file']))

if __name__ == '__main__':
    main()
