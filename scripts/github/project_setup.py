#!/usr/bin/env python3
# FinFriends — GitHub Project(v2) 일괄 세팅. `gh auth refresh -s project` 이후 실행.
import json,subprocess,sys,os,re
SP=os.path.dirname(os.path.abspath(__file__))+'/'
OWNER='new-rim'; PNUM=1
M={o['id']:o for o in json.load(open(SP+'manifest.json'))}

def gql(q,**kw):
    cmd=['gh','api','graphql','-f','query='+q]
    for k,v in kw.items(): cmd+=['-f','%s=%s'%(k,v)]
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode!=0: raise RuntimeError(r.stderr.strip()[:500]+'\n'+r.stdout[:500])
    d=json.loads(r.stdout)
    if 'errors' in d: raise RuntimeError(json.dumps(d['errors'],ensure_ascii=False)[:600])
    return d['data']

def esc(s): return json.dumps(s,ensure_ascii=False)

# ── 1. 프로젝트 ID
p=gql('query{user(login:"%s"){projectV2(number:%d){id title url}}}'%(OWNER,PNUM))['user']['projectV2']
PID=p['id']; print('프로젝트:',p['title'],p['url'])

# ── 2. 기존 필드
def fields():
    d=gql('query{node(id:"%s"){... on ProjectV2{fields(first:60){nodes{__typename ... on ProjectV2FieldCommon{id name} ... on ProjectV2SingleSelectField{id name options{id name}}}}}}}'%PID)
    return {f['name']:f for f in d['node']['fields']['nodes']}
F=fields()

LANE={'P':'P 플랫폼·데이터','D':'D 도메인·기능','X':'X UI/UX'}
TYPE={'type:infra':'Infra','type:db':'DB','type:sec':'Sec','type:contract':'Contract','type:mock':'Mock',
      'type:test':'Test','type:feature-command':'Feature/Command','type:feature-query':'Feature/Query','type:ui-ux':'UI/UX'}
SPECS=[
 ('Start date','DATE',None),('Target date','DATE',None),
 ('기간(일)','NUMBER',None),('여유(일)','NUMBER',None),('D+착수','NUMBER',None),('파급(건)','NUMBER',None),
 ('레인','SINGLE_SELECT',[('P 플랫폼·데이터','GREEN'),('D 도메인·기능','PURPLE'),('X UI/UX','ORANGE')]),
 ('임계도','SINGLE_SELECT',[('🔴 임계 경로 (여유 0)','RED'),('🟡 여유 4일 이하','YELLOW'),('🟢 여유 5일 이상','GREEN')]),
 ('복잡도','SINGLE_SELECT',[('H 아키텍처·동시성·규제·외부연동','ORANGE'),('M 표준 구현 + 검증','GRAY')]),
 ('유형','SINGLE_SELECT',[(v,'BLUE') for v in ['Infra','DB','Sec','Contract','Mock','Test','Feature/Command','Feature/Query','UI/UX']]),
 ('마일스톤 단계','SINGLE_SELECT',[('M1 기반','BLUE'),('M2 기능','GREEN'),('M3 전달·운영','YELLOW'),('M4 검증·릴리스','RED')]),
 ('착수 차단','TEXT',None),('선행','TEXT',None),
]
for name,dt,opts in SPECS:
    if name in F: print('  · 필드 있음:',name); continue
    if dt=='SINGLE_SELECT':
        o=','.join('{name:%s,color:%s,description:""}'%(esc(n),c) for n,c in opts)
        q='mutation{createProjectV2Field(input:{projectId:"%s",dataType:SINGLE_SELECT,name:%s,singleSelectOptions:[%s]}){projectV2Field{... on ProjectV2SingleSelectField{id name}}}}'%(PID,esc(name),o)
    else:
        q='mutation{createProjectV2Field(input:{projectId:"%s",dataType:%s,name:%s}){projectV2Field{... on ProjectV2Field{id name}}}}'%(PID,dt,esc(name))
    gql(q); print('  + 필드 생성:',name)
F=fields()

# ── 3. 이슈 노드 ID
q='query{repository(owner:"%s",name:"finfriends-prd-to-srs"){issues(first:100,orderBy:{field:CREATED_AT,direction:ASC}){nodes{number id}}}}'%OWNER
NID={n['number']:n['id'] for n in gql(q)['repository']['issues']['nodes']}
print('이슈 노드 %d건'%len(NID))

# ── 4. 아이템 추가
cur=gql('query{node(id:"%s"){... on ProjectV2{items(first:100){nodes{id content{... on Issue{number}}}}}}}'%PID)
have={i['content']['number']:i['id'] for i in cur['node']['items']['nodes'] if i.get('content',{}).get('number')}
for o in sorted(M.values(),key=lambda x:x['num']):
    if o['num'] in have: continue
    r=gql('mutation{addProjectV2ItemById(input:{projectId:"%s",contentId:"%s"}){item{id}}}'%(PID,NID[o['num']]))
    have[o['num']]=r['addProjectV2ItemById']['item']['id']
print('프로젝트 아이템 %d건'%len(have))

# ── 5. 필드 값
def opt(fn,name):
    for o in F[fn]['options']:
        if o['name']==name: return o['id']
    raise KeyError(fn+'/'+name)
n=0
for o in sorted(M.values(),key=lambda x:x['num']):
    it=have[o['num']]; muts=[]
    def add(fn,val):
        muts.append('m%d:updateProjectV2ItemFieldValue(input:{projectId:"%s",itemId:"%s",fieldId:"%s",value:{%s}}){projectV2Item{id}}'%(len(muts),PID,it,F[fn]['id'],val))
    add('Start date','date:"%s"'%o['start']); add('Target date','date:"%s"'%o['target'])
    add('기간(일)','number:%d'%o['dur']); add('여유(일)','number:%d'%o['slack'])
    add('D+착수','number:%d'%o['es']); add('파급(건)','number:%d'%o['downstream'])
    add('레인','singleSelectOptionId:"%s"'%opt('레인',LANE[o['lane']]))
    add('임계도','singleSelectOptionId:"%s"'%opt('임계도','🔴 임계 경로 (여유 0)' if o['critical'] else ('🟡 여유 4일 이하' if o['slack']<=4 else '🟢 여유 5일 이상')))
    add('복잡도','singleSelectOptionId:"%s"'%opt('복잡도','H 아키텍처·동시성·규제·외부연동' if o['cx']=='H' else 'M 표준 구현 + 검증'))
    t=next((TYPE[l] for l in o['labels'] if l in TYPE),'Infra')
    add('유형','singleSelectOptionId:"%s"'%opt('유형',t))
    MSMAP={'M1':'M1 기반','M2':'M2 기능','M3':'M3 전달·운영','M4':'M4 검증·릴리스'}
    add('마일스톤 단계','singleSelectOptionId:"%s"'%opt('마일스톤 단계',MSMAP[o['milestone'][:2]]))
    add('착수 차단','text:%s'%esc(' · '.join(o['blocked']) if o['blocked'] else '—'))
    add('선행','text:%s'%esc(' · '.join(o['deps']) if o['deps'] else '(진입점)'))
    gql('mutation{%s}'%'\n'.join(muts)); n+=1
    print('  · #%-2d %-7s %s ~ %s'%(o['num'],o['id'],o['start'],o['target']))
print('필드 값 %d건 기입'%n)
json.dump({'PID':PID,'items':have,'fields':{k:v['id'] for k,v in F.items()}},open(SP+'project.json','w'))
