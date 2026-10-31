/* BETTAO INTELLIGENCE STUDIO v4 · static site, no extra API calls */
(()=>{'use strict';
const $=id=>document.getElementById(id), root=$('api-results');if(!root)return;
const N={demo:'FOOTBALL LAB',nfl:'NFL',nba:'NBA',mlb:'MLB'};
const safe=(x,d='—')=>x===null||x===undefined||x===''?d:String(x);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmtDate=x=>{if(!x)return 'Date TBA';const d=new Date(x);return Number.isNaN(+d)?'Date TBA':d.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})};
const node=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e};
const make=(tag,cls,html)=>{const e=node(tag,cls);e.innerHTML=html;return e};
const uid=g=>g.league+':'+g.id;
const readFav=()=>{try{const v=JSON.parse(localStorage.getItem('bettao_api_favorites_v1')||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string').slice(-150):[]}catch(_){return []}};
let fav=readFav(), games=[],real=[],league='demo',state='all',search='',sort='smart',selected='',visible=12, scenario='balanced',showMethod=false;
const isFinal=g=>/final|finished|completed/i.test(String(g.status||''))&&Number.isFinite(Number(g.home.score))&&Number.isFinite(Number(g.away.score));
const dateMs=g=>new Date(g.date||0).getTime()||0;
const demoTeams=[
 ['Northbridge FC',1.24,1.06],['Royal Harbor',1.10,1.13],['Atlas United',1.35,1.00],['Redmont City',0.98,1.21],
 ['Silverlake Athletic',1.14,1.09],['Eastford Rovers',0.94,1.24],['Portside Union',1.19,1.07],['Aurora Sporting',1.04,1.16],
 ['Kingsport FC',1.27,1.04],['Union Vale',0.92,1.26]
];
const hash=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const random=seed=>{let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}};
const poisson=(lambda,r)=>{let p=Math.exp(-lambda),n=0,t=r();while(t>p&&n<9){t-=p;n++;p+=Math.exp(-lambda)*Math.pow(lambda,n)/fact(n)}return n};
const fact=n=>{let x=1;for(let i=2;i<=n;i++)x*=i;return x};
const pmf=(k,l)=>Math.exp(-l)*Math.pow(l,k)/fact(k);
const teamInfo=Object.fromEntries(demoTeams.map(([name,attack,defense])=>[name,{attack,defense}]));
const makeDemo=()=>{
 const now=new Date();now.setHours(19,45,0,0);
 const pairs=[[0,1],[2,3],[4,5],[6,7],[8,9],[0,2],[1,4],[3,6],[5,8],[7,9],[2,4],[0,6]];
 const fixtures=pairs.map(([a,b],i)=>{const d=new Date(now);d.setDate(d.getDate()+Math.floor(i/3)+1);return {id:'demo-'+i,league:'demo',name:demoTeams[a][0]+' vs '+demoTeams[b][0],date:d.toISOString(),status:'Scheduled · simulated',venue:'Fictional Premier Division',home:{name:demoTeams[a][0],score:null},away:{name:demoTeams[b][0],score:null},demo:true}});
 const history=[];
 // Deterministic fictional results, never mixed into the real sports feed.
 for(let round=0;round<16;round++)for(let i=0;i<10;i++){
  const a=(i+round*3)%10,b=(i+round*3+3+round%5)%10;if(a===b)continue;
  const home=demoTeams[a],away=demoTeams[b],r=random(hash('bettao-fiction-'+round+'-'+i));
  const h=poisson(clamp(1.48*home[1]/away[2],.4,3.2),r),v=poisson(clamp(1.12*away[1]/home[2],.3,3.1),r);
  const d=new Date(now);d.setDate(d.getDate()-round*5-i-2);
  history.push({id:'historical-'+round+'-'+i,league:'demo',name:away[0]+' at '+home[0],date:d.toISOString(),status:'Final · simulated',venue:'Fictional Premier Division',home:{name:home[0],score:h},away:{name:away[0],score:v},demo:true,archive:true});
 }
 return {fixtures,history};
};
const DEMO=makeDemo();
const allGames=()=>[...DEMO.fixtures,...real];
const archive=()=>[...DEMO.history,...real.filter(isFinal)];
function record(name,kind){const list=(kind==='demo'?DEMO.history:real).filter(g=>isFinal(g)&&(g.home.name===name||g.away.name===name)).sort((a,b)=>dateMs(b)-dateMs(a));
 const last=list.slice(0,8);let w=0,d=0,l=0,scored=0,allowed=0;
 const form=[];for(const g of last){const home=g.home.name===name,s=Number(home?g.home.score:g.away.score),c=Number(home?g.away.score:g.home.score);scored+=s;allowed+=c;const f=s>c?'W':s<c?'L':'D';form.push(f);if(f==='W')w++;else if(f==='L')l++;else d++}
 return {name,n:last.length,w,d,l,scored,allowed,avgScored:last.length?scored/last.length:0,avgAllowed:last.length?allowed/last.length:0,form,last};}
const H2H=(g)=>archive().filter(x=>x.league===g.league&&((x.home.name===g.home.name&&x.away.name===g.away.name)||(x.home.name===g.away.name&&x.away.name===g.home.name))).sort((a,b)=>dateMs(b)-dateMs(a)).slice(0,5);
const model=(g,mode)=>{
 const h=record(g.home.name,g.league),a=record(g.away.name,g.league),demo=g.league==='demo';
 const count=Math.min(h.n,a.n),weight=demo?.58:Math.min(.62,count/18);
 // League-level prior. Real sports priors are generic illustration, not fitted odds.
 const base=g.league==='nba'?110:g.league==='nfl'?23:g.league==='mlb'?4.3:1.38;
 const modifier=mode==='home'?1.17:mode==='form'?1.08:mode==='chaos'?1:1.08;
 const attackH=h.n?clamp(h.avgScored/base,.55,1.6):1,attackA=a.n?clamp(a.avgScored/base,.55,1.6):1;
 const defenseH=h.n?clamp(h.avgAllowed/base,.55,1.6):1,defenseA=a.n?clamp(a.avgAllowed/base,.55,1.6):1;
 const rawHome=base*modifier*attackH*defenseA,rawAway=base/1.08*attackA*defenseH;
 const home=clamp(base*(1-weight)+rawHome*weight,base*.45,base*1.85);
 const away=clamp((base/1.08)*(1-weight)+rawAway*weight,base*.45,base*1.85);
 let pH=0,pD=0,pA=0,over=0,btts=0,zeroH=0,zeroA=0;
 if(demo||g.league==='mlb'){
  for(let i=0;i<15;i++)for(let j=0;j<15;j++){
   const p=pmf(i,home)*pmf(j,away);
   if(i>j)pH+=p;else if(i===j)pD+=p;else pA+=p;
   if(i+j>=3)over+=p;if(i>0&&j>0)btts+=p;if(i===0)zeroH+=p;if(j===0)zeroA+=p;
  }
  if(g.league==='mlb'){pH+=pD*.5;pA+=pD*.5;pD=0}
 }else{
  const delta=home-away,spread=g.league==='nba'?14:10;
  pH=1/(1+Math.exp(-delta/spread));pA=1-pH;pD=0;
 }
 if(mode==='chaos'){
  const f=.73;pH=pH*f+(1-f)*(demo?1/3:.5);pA=pA*f+(1-f)*(demo?1/3:.5);pD=demo?pD*f+(1-f)/3:0;
 }
 const total=pH+pA+pD;pH/=total;pA/=total;pD/=total;
 const confidence=demo?'SIMULATED':count>=6?'LIMITED DATA':'LOW DATA';
 return {h,a,home,away,pH,pD,pA,over,btts,zeroH,zeroA,confidence,weight,base,historyCount:count};
};
function matches(){const source=league==='demo'?[...DEMO.fixtures,...DEMO.history]:allGames();let arr=source.filter(g=>(league==='all'||league==='favorites'?league!=='favorites'||fav.includes(uid(g)):g.league===league)&&(!search||[g.home.name,g.away.name,g.name].join(' ').toLowerCase().includes(search))&&(state==='all'||(state==='final'?isFinal(g):!isFinal(g))));
 arr.sort((a,b)=>sort==='oldest'?dateMs(a)-dateMs(b):sort==='newest'?dateMs(b)-dateMs(a):(isFinal(a)?1:0)-(isFinal(b)?1:0)||(a.league==='demo'?0:1)-(b.league==='demo'?0:1)||Math.abs(dateMs(a)-Date.now())-Math.abs(dateMs(b)-Date.now()));return arr}
function renderList(){const arr=matches();root.replaceChildren();$('api-results-count').textContent=`${arr.length} MATCHES`;
 if(!arr.length){root.append(node('div','api-empty','No matches for these filters. Try another sport or clear the search.'));$('api-detail').replaceChildren(node('p','api-placeholder','Select a match to explore the model.'));$('api-more').hidden=true;return}
 if(!arr.some(g=>uid(g)===selected))selected=uid(arr[0]);
 for(const g of arr.slice(0,visible)){
  const b=node('button','api-game'+(uid(g)===selected?' is-selected':''));b.type='button';b.setAttribute('aria-label','Open '+g.home.name+' vs '+g.away.name);
  const top=node('div','api-game-top');top.append(node('span','api-league',g.demo?'⚽ FICTIONAL FOOTBALL':N[g.league]||g.league.toUpperCase()),node('span','api-game-time',fmtDate(g.date)));b.append(top);
  const main=node('div','api-game-main'),teams=node('div','api-team-names'),scores=node('div','api-scores');
  for(const t of [g.away,g.home]){const row=node('div','api-team-line');if(t.logo&&/^https:\/\//.test(t.logo)){const img=node('img');img.src=t.logo;img.alt='';img.loading='lazy';row.append(img)}row.append(node('span','',t.name));teams.append(row);scores.append(node('strong','',isFinal(g)?safe(t.score):'–'))}
  main.append(teams,scores);b.append(main);
  const foot=node('div','api-game-bottom');foot.append(node('span','',g.demo?'◈ DEMO / SIMULATED':safe(g.status)),node('span','',fav.includes(uid(g))?'★ Saved':'Explore model ↗'));b.append(foot);
  b.addEventListener('click',()=>{selected=uid(g);scenario='balanced';showMethod=false;renderList();renderDetail(g);if(window.matchMedia('(max-width:850px)').matches)$('api-detail').scrollIntoView({behavior:'smooth',block:'start'})});root.append(b)
 }
 const more=$('api-more');more.hidden=arr.length<=visible;more.textContent=`Load more · ${arr.length-visible} remaining`;
 const chosen=arr.find(g=>uid(g)===selected)||arr[0];renderDetail(chosen);
}
const percent=n=>Math.round(n*100)+'%';
function miniMetric(label,value,note){const e=node('div','intel-mini');e.append(node('span','',label),node('strong','',value),node('small','',note));return e}
function formChips(rec){const r=node('div','intel-form');if(!rec.form.length){r.append(node('span','intel-form-empty','No completed games in archive'));return r}for(const v of rec.form){r.append(node('span','intel-result '+v.toLowerCase(),v))}return r}
function compare(g,m){
 const wrap=node('div','intel-panel intel-comparison');
 wrap.append(node('div','intel-overline','TEAM PERFORMANCE · LAST 8 AVAILABLE GAMES'),node('h4','intel-panel-title','Form & scoring comparison'));
 wrap.append(node('p','intel-flip-intro','Two perspectives on each team. Tap a card to reveal advanced insights. Cards also flip automatically when motion is enabled.'));
 const pair=node('div','intel-flip-grid');
 for(const [rec,side] of [[m.a,'away'],[m.h,'home']]){
  const card=node('button','intel-flip-card');card.type='button';card.dataset.side=side;
  card.setAttribute('aria-label',rec.name+' · reveal advanced team statistics');card.setAttribute('aria-pressed','false');
  const inner=node('span','intel-flip-inner');
  const front=node('span','intel-flip-face intel-flip-front');
  const header=node('span','intel-flip-header');header.append(node('span','intel-flip-eyebrow',side==='home'?'HOME / FORM SNAPSHOT':'AWAY / FORM SNAPSHOT'),node('span','intel-flip-cue','↻ FLIP'));
  front.append(header,node('strong','intel-flip-name',rec.name));
  const recordLine=node('span','intel-flip-record',rec.n?`${rec.w} W  ·  ${rec.d} D  ·  ${rec.l} L`:'Not enough completed games');front.append(recordLine);
  const form=node('span','intel-flip-form');if(rec.form.length){for(const v of rec.form)form.append(node('span','intel-result '+v.toLowerCase(),v))}else form.append(node('span','intel-form-empty','No completed games in archive'));front.append(form);
  const metrics=node('span','intel-flip-metrics');metrics.append(miniMetric('AVG SCORED',rec.n?rec.avgScored.toFixed(1):'—','per game'),miniMetric('AVG ALLOWED',rec.n?rec.avgAllowed.toFixed(1):'—','per game'));front.append(metrics,node('span','intel-flip-hint','TAP TO EXPLORE  ↗'));
  const back=node('span','intel-flip-face intel-flip-back');back.setAttribute('aria-hidden','true');
  const backHead=node('span','intel-flip-header');backHead.append(node('span','intel-flip-eyebrow','ADVANCED INSIGHTS'),node('span','intel-flip-cue','↶ RETURN'));back.append(backHead,node('strong','intel-flip-name',rec.name));
  const advanced=node('span','intel-flip-advanced');
  const insight=(label,value)=>{const line=node('span','intel-flip-insight');line.append(node('span','',label),node('strong','',value));return line};
  advanced.append(insight('Win rate',rec.n?Math.round(rec.w/rec.n*100)+'%':'—'),insight('Net points / game',rec.n?((rec.scored-rec.allowed)/rec.n>=0?'+':'')+((rec.scored-rec.allowed)/rec.n).toFixed(2):'—'),insight('Points scored / conceded',rec.n?`${rec.scored} / ${rec.allowed}`:'—'),insight('Sample size',rec.n+' completed games'));
  back.append(advanced,node('span','intel-flip-backnote',g.demo?'SIMULATED FOOTBALL DATA · FOR ENTERTAINMENT':'MODEL INPUTS · LIMITED TO SAVED API RESULTS'),node('span','intel-flip-hint','RETURNS AUTOMATICALLY  ↶'));
  inner.append(front,back);card.append(inner);pair.append(card);
 }
 wrap.append(pair);return wrap;
}
function bar(label,value,cls){const e=node('div','intel-bar-line');const header=node('div','intel-bar-label');header.append(node('span','',label),node('strong','',percent(value)));const track=node('div','intel-bar-track');const fill=node('div','intel-bar-fill '+cls);fill.style.width=percent(value);track.append(fill);e.append(header,track);return e}
function scoreDist(m){const e=node('div','intel-panel');e.append(node('div','intel-overline','GOALS MODEL · POISSON DISTRIBUTION'),node('h4','intel-panel-title','Most likely scorelines'));const scores=[];for(let i=0;i<=5;i++)for(let j=0;j<=5;j++)scores.push({s:i+' – '+j,p:pmf(i,m.home)*pmf(j,m.away)});scores.sort((a,b)=>b.p-a.p);const max=scores[0].p;for(const s of scores.slice(0,5)){const line=node('div','intel-scoreline');line.append(node('strong','',s.s));const track=node('div','intel-score-track'),fill=node('div','intel-score-fill');fill.style.width=percent(s.p/max);track.append(fill);line.append(track,node('span','',percent(s.p)));e.append(line)}return e}
function historyBlock(g){const list=H2H(g),e=node('div','intel-panel');e.append(node('div','intel-overline','MATCHUP ARCHIVE'),node('h4','intel-panel-title','Head-to-head'));if(!list.length){e.append(node('p','intel-muted','No recorded meetings between these teams in the available archive.'));return e}
 for(const x of list){const row=node('div','intel-h2h');row.append(node('span','',fmtDate(x.date).split(',')[0]),node('span','',x.home.name+' vs '+x.away.name),node('strong','',x.home.score+' : '+x.away.score));e.append(row)}return e}
function renderDetail(g){const d=$('api-detail');d.replaceChildren();const m=model(g,scenario),demo=g.demo;
 const top=node('div','api-detail-head');top.append(node('span','api-detail-kicker',demo?'◈ FICTIONAL FOOTBALL / SIMULATION':'◈ '+N[g.league]+' / MODEL ESTIMATE'));
 const favBtn=node('button','api-fav'+(fav.includes(uid(g))?' is-saved':''),fav.includes(uid(g))?'★ Saved':'☆ Save');favBtn.type='button';favBtn.addEventListener('click',()=>{fav=fav.includes(uid(g))?fav.filter(x=>x!==uid(g)):[...fav,uid(g)].slice(-150);try{localStorage.setItem('bettao_api_favorites_v1',JSON.stringify(fav))}catch(_){}renderList()});top.append(favBtn);d.append(top);
 d.append(node('h3','intel-match-title',g.home.name+' vs '+g.away.name));const sub=node('div','intel-match-sub');sub.append(node('span','',fmtDate(g.date)),node('span','',demo?'Fictional Premier Division':safe(g.status)),node('span','',demo?'SIMULATED DATA':safe(g.venue)));d.append(sub);
 if(isFinal(g)){const sc=node('div','intel-actual-score','FINAL SCORE · '+g.home.score+' — '+g.away.score);d.append(sc)}
 const hero=node('div','intel-projection');hero.append(node('div','intel-projection-caption','BETTAO MODEL · '+m.confidence));const line=node('div','intel-projection-line');line.append(node('span','intel-projection-team',g.home.name),node('strong','intel-projection-score',m.home.toFixed(demo?2:1)+' : '+m.away.toFixed(demo?2:1)),node('span','intel-projection-team',g.away.name));hero.append(line,node('div','intel-projection-foot',demo?'Expected goals (xG-like simulated model)':'Illustrative expected points · not market odds'));d.append(hero);
 const panel=node('div','intel-panel intel-main-panel');panel.append(node('div','intel-overline','OUTCOME PROBABILITIES · INTERACTIVE ESTIMATE'),node('h4','intel-panel-title','Win probability'));
 const split=node('div','intel-split');for(const [v,cls] of [[m.pH,'home'],[m.pD,'draw'],[m.pA,'away']]){if(v<=0)continue;const seg=node('div','intel-split-seg '+cls);seg.style.width=percent(v);split.append(seg)}panel.append(split);
 const row=node('div','intel-prob-row');row.append(miniMetric('HOME WIN',percent(m.pH),'model estimate'));if(demo)row.append(miniMetric('DRAW',percent(m.pD),'model estimate'));row.append(miniMetric('AWAY WIN',percent(m.pA),'model estimate'));panel.append(row);
 const scenarioBox=node('div','intel-scenario');scenarioBox.append(node('span','intel-overline','WHAT-IF SCENARIOS'));
 const buttons=node('div','intel-scenario-buttons');for(const [key,label] of [['balanced','Balanced'],['home','Home edge'],['form','Home attack'],['chaos','High variance']]){const b=node('button','intel-scenario-btn'+(scenario===key?' active':''),label);b.type='button';b.setAttribute('aria-pressed',String(scenario===key));b.addEventListener('click',()=>{scenario=key;renderDetail(g)});buttons.append(b)}scenarioBox.append(buttons,node('p','intel-muted','Change a model assumption to explore how the estimated probabilities shift. These are not live betting odds.'));panel.append(scenarioBox);d.append(panel);
 if(demo){const grid=node('div','intel-grid-2');const goals=node('div','intel-panel');goals.append(node('div','intel-overline','SIMULATED GOAL MARKETS'),node('h4','intel-panel-title','Game dynamics'));goals.append(bar('Over 2.5 goals',m.over,'orange'),bar('Both teams to score',m.btts,'blue'),bar('Home clean sheet',m.zeroA,'green'),bar('Away clean sheet',m.zeroH,'gray'));grid.append(goals,scoreDist(m));d.append(grid)}
 d.append(compare(g,m),historyBlock(g));
 const method=node('div','intel-method');const toggle=node('button','intel-method-toggle','◈ HOW THIS MODEL WORKS '+(showMethod?'−':'+'));toggle.type='button';toggle.setAttribute('aria-expanded',String(showMethod));toggle.addEventListener('click',()=>{showMethod=!showMethod;renderDetail(g)});method.append(toggle);
 if(showMethod){const body=node('div','intel-method-body');body.append(node('p','','The model blends a neutral scoring baseline with the last eight available completed games for each team. Football uses a Poisson goal distribution. NFL/NBA use a simple score-difference logistic approximation; MLB uses a Poisson run model. Scenarios alter the home advantage or uncertainty.'));
 body.append(node('p','',demo?'Football Lab uses entirely fictional teams and deterministic synthetic history. The displayed percentages are entertainment simulations, not validated forecasts.':'Real sports data comes from the daily published API snapshot. When the archive is sparse, the baseline dominates. No bookmaker odds, injuries, lineups, player stats or external ratings are included.'));
 body.append(node('p','',`Historical sample: home ${m.h.n} games, away ${m.a.n} games. Model history weight: ${Math.round(m.weight*100)}%. Confidence label: ${m.confidence}.`));method.append(body)}d.append(method);
 d.append(node('p','intel-disclaimer',demo?'⚠ FICTIONAL DATA · DEMONSTRATION ONLY. All football teams, results, fixtures and probabilities are simulated. No financial or betting advice.':'⚠ ESTIMATED, NOT VERIFIED PROBABILITIES. Scores and schedules are API snapshots; model percentages are illustrative calculations and may be inaccurate.'));
}
function stats(){const g=allGames(),finished=real.filter(isFinal);$('api-metric-games').textContent=String(g.length);$('api-metric-upcoming').textContent=String(g.filter(x=>!isFinal(x)).length);$('api-metric-final').textContent=String(finished.length);$('api-metric-history').textContent=String(finished.length);$('api-updated').textContent=real.length?'API snapshot loaded':'Demo ready · offline';}
function statusText(data){const status=$('api-status');if(league==='demo'){status.textContent=`FOOTBALL LAB · ${DEMO.fixtures.length} fictional fixtures · ${DEMO.history.length} simulated historical games · 100% free entertainment`;return}
 const at=data&&data.generatedAt?fmtDate(data.generatedAt):'not available';status.textContent=real.length?`${real.length} real API matches · Last snapshot: ${at} · Not live · Predictions are illustrative`: 'Real API feed unavailable. The fictional Football Lab works offline.'}
function refresh(){visible=12;stats();$('api-demo-banner').hidden=league!=='demo';statusText(window.__bettaoData);renderList()}
for(const b of document.querySelectorAll('[data-api-league]'))b.addEventListener('click',()=>{league=b.dataset.apiLeague;document.querySelectorAll('[data-api-league]').forEach(x=>{x.classList.toggle('is-active',x===b);x.setAttribute('aria-pressed',String(x===b))});selected='';refresh()});
for(const b of document.querySelectorAll('[data-api-state]'))b.addEventListener('click',()=>{state=b.dataset.apiState;document.querySelectorAll('[data-api-state]').forEach(x=>{x.classList.toggle('is-active',x===b);x.setAttribute('aria-pressed',String(x===b))});selected='';refresh()});
$('api-search').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();selected='';visible=12;renderList()});
$('api-sort').addEventListener('change',e=>{sort=e.target.value;renderList()});
$('api-more').addEventListener('click',()=>{visible+=12;renderList()});
$('api-reload').addEventListener('click',()=>load(true));
$('api-export').addEventListener('click',()=>{const rows=[['League','Home','Away','Date','Status','Home score','Away score','Data type'],...matches().map(g=>[N[g.league],g.home.name,g.away.name,g.date,g.status,safe(g.home.score,''),safe(g.away.score,''),g.demo?'FICTIONAL':'API'])];const csv=rows.map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));const a=node('a');a.href=url;a.download='bettao-match-explorer.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
function load(bust){const url='data/matches.json'+(bust?'?t='+Date.now():'');fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{window.__bettaoData=data;real=Array.isArray(data.games)?data.games.filter(g=>g&&['nfl','nba','mlb'].includes(g.league)&&g.id&&g.home&&g.away&&g.home.name&&g.away.name):[];refresh()}).catch(()=>{real=[];refresh()})}
refresh();load(false);
})();
