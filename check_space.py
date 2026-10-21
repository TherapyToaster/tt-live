# Server-side checker: writes status.json for the Home live banner. Needs env X_BEARER_TOKEN (Twitter API app bearer token).
import json,os,sys,urllib.request,datetime
try:
  req=urllib.request.Request('https://api.twitter.com/2/spaces/by/creator_ids?user_ids=215425902&space.fields=state,title,started_at',
    headers={'Authorization':'Bearer '+os.environ['X_BEARER_TOKEN']})
  data=json.load(urllib.request.urlopen(req,timeout=20)).get('data') or []
  live=[s for s in data if s.get('state')=='live']
  s=live[0] if live else {}
  out={'live':bool(live),'id':s.get('id'),'title':s.get('title'),'url':('https://twitter.com/i/spaces/'+s['id']) if live else None,
       'started_at':s.get('started_at'),'updated':datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}
  json.dump(out,open('status.json','w'),ensure_ascii=False); print(out)
except Exception as e:
  # API error: keep previous status.json untouched (its 'updated' goes stale, so the banner hides)
  print('check failed, status.json unchanged:',type(e).__name__,getattr(e,'code',''))
  sys.exit(0)
