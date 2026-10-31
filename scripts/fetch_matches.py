#!/usr/bin/env python3
"""Fetch at most three API endpoints per run; publish sanitized static snapshots.
GitHub Actions uses a repository secret, never a browser-side key.
"""
import datetime as dt
import json
import os
import pathlib
import time
import urllib.error
import urllib.request

ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/'data'
LEDGER=DATA/'request-ledger.json'
CACHE=DATA/'matches.json'
API='https://realtimesportsapi.com/api/v1'
LEAGUES=(('nfl','football'),('nba','basketball'),('mlb','baseball'))
# 3 calls/day * 31 days = 93. Hard ceiling allows a few manual runs and failures.
MONTHLY_CEILING=115

def read(path,default):
    try:return json.loads(path.read_text(encoding='utf-8'))
    except (FileNotFoundError,ValueError):return default

def write(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def value(v):
    return str(v)[:180] if v is not None else ''

def score(v):
    try:
        if v is None or v=='':return None
        n=float(v)
        return int(n) if n.is_integer() and 0<=n<10000 else None
    except (TypeError,ValueError,OverflowError):return None

def normalize_event(e,league):
    if not isinstance(e,dict):return None
    home=e.get('homeTeam') or {};away=e.get('awayTeam') or {}
    if not isinstance(home,dict) or not isinstance(away,dict):return None
    event_id=value(e.get('id'))
    if not event_id or not (home.get('name') and away.get('name')):return None
    status=e.get('status') or {}
    if isinstance(status,dict):
        type_info=status.get('type')
        status=value(status.get('detail') or (type_info.get('description') if isinstance(type_info,dict) else None) or status.get('state'))
    else:status=value(status)
    venue=e.get('venue') or {}
    if isinstance(venue,dict):venue=value(venue.get('name') or venue.get('city'))
    else:venue=value(venue)
    periods=[]
    # Score breakdown is included only if explicitly returned; never synthesize it.
    raw=e.get('periods') or e.get('linescores') or []
    if isinstance(raw,list):
        for i,p in enumerate(raw[:10]):
            if isinstance(p,dict):
                a=score(p.get('away') if not isinstance(p.get('away'),dict) else p['away'].get('score'))
                h=score(p.get('home') if not isinstance(p.get('home'),dict) else p['home'].get('score'))
                if a is not None and h is not None:periods.append({'label':value(p.get('name') or p.get('label') or f'Period {i+1}'),'away':a,'home':h})
    def team(t):
        logo=value(t.get('logo'))
        if not logo.startswith('https://'):logo=''
        return {'name':value(t.get('name')),'score':score(t.get('score')),'logo':logo}
    return {'id':event_id,'league':league,'name':value(e.get('name')),'date':value(e.get('date')),'status':status,'venue':venue,'home':team(home),'away':team(away),'periods':periods}

def main():
    key=os.environ.get('REALTIME_SPORTS_API_KEY','').strip()
    if not key:
        print('REALTIME_SPORTS_API_KEY missing. No requests made.');return
    now=dt.datetime.now(dt.timezone.utc)
    month=now.strftime('%Y-%m')
    ledger=read(LEDGER,{'month':'','attempts':0})
    if ledger.get('month')!=month:ledger={'month':month,'attempts':0}
    cache=read(CACHE,{'games':[]})
    previous={league:[g for g in cache.get('games',[]) if g.get('league')==league] for league,_ in LEAGUES}
    errors=[];new=[];successes=0
    for league,sport in LEAGUES:
        if ledger['attempts']>=MONTHLY_CEILING:
            errors.append(f'{league.upper()}: monthly safety cap reached');new.extend(previous[league]);continue
        # Count before attempting: failed requests can still count against the provider quota.
        ledger['attempts']+=1
        write(LEDGER,ledger)
        url=f'{API}/sports/{sport}/leagues/{league}/events?limit=50'
        req=urllib.request.Request(url,headers={'Authorization':'Bearer '+key,'Accept':'application/json','User-Agent':'BettaoScoresMatchCenter/1.0'})
        try:
            with urllib.request.urlopen(req,timeout=20) as response:
                payload=json.load(response)
            if not isinstance(payload,dict) or payload.get('success') is False or not isinstance(payload.get('data'),list):raise ValueError('Unexpected API response shape')
            normalized=[normalize_event(e,league) for e in payload['data']]
            new.extend(g for g in normalized if g)
            successes+=1
            print(f'{league}: {len(payload["data"])} events received')
        except (urllib.error.URLError,TimeoutError,ValueError,KeyError,TypeError) as exc:
            errors.append(f'{league.upper()}: {type(exc).__name__}')
            new.extend(previous[league])
            print(f'{league}: request failed ({type(exc).__name__})')
        time.sleep(1.2) # Free tier: <= 1 request/second.
    # Retain historical games across daily snapshots without extra API requests.
    # A daily endpoint usually contains only the current schedule; replacing it
    # would erase completed matches needed for meaningful form statistics.
    # Keep one record per (league, id); newest API result wins.
    merged={}
    for g in cache.get('games',[]):
        if isinstance(g,dict) and g.get('id') and g.get('league'):
            merged[(g['league'],str(g['id']))]=g
    for g in new:
        merged[(g['league'],str(g['id']))]=g
    cutoff=now-dt.timedelta(days=550)
    grouped={league:[] for league,_ in LEAGUES}
    for g in merged.values():
        if g.get('league') not in grouped:continue
        try:
            event_date=dt.datetime.fromisoformat(g.get('date','').replace('Z','+00:00'))
            if event_date.tzinfo is None:event_date=event_date.replace(tzinfo=dt.timezone.utc)
            if event_date<cutoff:continue
        except (ValueError,TypeError,AttributeError):continue
        grouped[g['league']].append(g)
    # 900 games per league prevents indefinite repository growth.
    archived=[]
    for league in grouped:
        archived.extend(sorted(grouped[league],key=lambda x:x.get('date',''),reverse=True)[:900])
    new=archived
    # Only mark snapshot refreshed if at least one league actually updated.
    generated=now.isoformat().replace('+00:00','Z') if successes else cache.get('generatedAt')
    write(CACHE,{'configured':True,'generatedAt':generated,'games':new,'errors':errors})
    write(LEDGER,ledger)
    print(f'Monthly attempts: {ledger["attempts"]}/{MONTHLY_CEILING}; games: {len(new)}; errors: {len(errors)}')

if __name__=='__main__':main()
