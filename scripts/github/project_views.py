#!/usr/bin/env python3
# FinFriends — Project 뷰 6종 + README. project_setup.py 이후 실행.
import json,subprocess,os
SP=os.path.dirname(os.path.abspath(__file__))+'/'
S=json.load(open(SP+'project.json')); PID=S['PID']; FID=S['fields']
def gql(q):
    r=subprocess.run(['gh','api','graphql','-f','query='+q],capture_output=True,text=True)
    if r.returncode!=0: raise RuntimeError(r.stderr.strip()[:400])
    d=json.loads(r.stdout)
    if 'errors' in d: raise RuntimeError(json.dumps(d['errors'],ensure_ascii=False)[:400])
    return d['data']
def esc(s): return json.dumps(s,ensure_ascii=False)
def vis(*names): return '['+','.join('"%s"'%FID[n] for n in names if n in FID)+']'

VIEWS=[
 ('🗓 로드맵 — 압축 56일','ROADMAP_LAYOUT','',('Start date','Target date','기간(일)','여유(일)','임계도','레인')),
 ('🔴 임계 경로 — 하루도 못 민다','TABLE_LAYOUT','label:critical-path',('Start date','Target date','기간(일)','파급(건)','선행','레인')),
 ('⛔ 착수 차단 — 답이 필요한 것','TABLE_LAYOUT','label:blocked:T-1,blocked:T-2,blocked:T-3,blocked:T-4,blocked:D-TEC-2,blocked:D-TEC-3,blocked:D-TEC-4,blocked:D-TEC-6,blocked:D-TEC-7,blocked:D-TEC-8',('착수 차단','Start date','D+착수','임계도','레인')),
 ('🧱 M1 기반 — 지금 구간','BOARD_LAYOUT','milestone:"M1 기반 — 인프라·스키마·접근계층·계약·Mock"',('Start date','Target date','여유(일)','레인')),
 ('🎨 UI/UX 트랙 9건','TABLE_LAYOUT','label:lane:X',('Start date','Target date','기간(일)','여유(일)','선행')),
 ('🧪 M4 검증·릴리스 게이트','TABLE_LAYOUT','milestone:"M4 검증·릴리스 게이트"',('Start date','Target date','기간(일)','여유(일)','선행')),
]
cur={v['name']:v['id'] for v in gql('query{node(id:"%s"){... on ProjectV2{views(first:30){nodes{id name}}}}}'%PID)['node']['views']['nodes']}
for name,layout,filt,fs in VIEWS:
    try:
        if name in cur: vid=cur[name]; print('  · 뷰 있음:',name)
        else:
            r=gql('mutation{createProjectV2View(input:{projectId:"%s",name:%s,layout:%s,configuration:{visibleFieldIds:%s}}){projectV2View{id name}}}'%(PID,esc(name),layout,vis(*fs)))
            vid=r['createProjectV2View']['projectV2View']['id']; print('  + 뷰 생성:',name)
        if filt:
            gql('mutation{updateProjectV2View(input:{viewId:"%s",filter:%s}){projectV2View{id}}}'%(vid,esc(filt)))
            print('      필터:',filt[:60])
    except Exception as e:
        print('  ! 실패:',name,'—',str(e)[:200])

README=open(SP+'project_readme.md').read()
gql('mutation{updateProjectV2(input:{projectId:"%s",shortDescription:%s,readme:%s}){projectV2{id url}}}'%(
    PID,esc('FinFriends 개발 46건 · 압축 편성 56 영업일 (2026-09-07 ~ 2026-11-23) · 임계 9건'),esc(README)))
print('README 반영 완료')
