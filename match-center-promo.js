(()=>{'use strict';
const el=document.getElementById('mc-float'),close=document.getElementById('mc-float-close');if(!el||!close)return;
const dict={
ru:['БЕСПЛАТНО · АНАЛИТИКА МАТЧЕЙ','Больше, чем счёт.','Вероятности побед, форма команд и интерактивный анализ матчей.','◈ Аналитика модели','↻ Сравнение команд','ОТКРЫТЬ MATCH CENTER','Бесплатно · Без регистрации'],
en:['FREE · MATCH INTELLIGENCE','Go beyond the score.','Explore win probabilities, team form and interactive match insights.','◈ Model insights','↻ Team comparisons','EXPLORE MATCH CENTER','Free to explore · No signup'],
'pt-BR':['GRÁTIS · ANÁLISE DE PARTIDAS','Além do placar.','Explore probabilidades, desempenho dos times e análises interativas.','◈ Análise do modelo','↻ Comparar times','EXPLORAR MATCH CENTER','Grátis · Sem cadastro'],
es:['GRATIS · ANÁLISIS DE PARTIDOS','Más allá del marcador.','Explora probabilidades, forma de los equipos y análisis interactivos.','◈ Análisis del modelo','↻ Comparar equipos','EXPLORAR MATCH CENTER','Gratis · Sin registro'],
sv:['GRATIS · MATCHANALYS','Mer än bara resultatet.','Utforska vinstchanser, lagform och interaktiv matchanalys.','◈ Modellanalys','↻ Jämför lag','UTFORSKA MATCH CENTER','Gratis · Ingen registrering'],
nb:['GRATIS · KAMPANALYSE','Mer enn bare resultatet.','Utforsk vinnersjanser, lagform og interaktiv kampanalyse.','◈ Modellinnsikt','↻ Sammenlign lag','UTFORSK MATCH CENTER','Gratis · Ingen registrering'],
da:['GRATIS · KAMPANALYSE','Mere end bare resultatet.','Udforsk vinderchancer, holdform og interaktiv kampanalyse.','◈ Modelindsigt','↻ Sammenlign hold','UDFORSK MATCH CENTER','Gratis · Ingen tilmelding'],
de:['KOSTENLOS · SPIELANALYSE','Mehr als nur Ergebnisse.','Entdecke Siegchancen, Teamform und interaktive Spielanalysen.','◈ Modellanalysen','↻ Teams vergleichen','MATCH CENTER ENTDECKEN','Kostenlos · Ohne Anmeldung'],
pl:['BEZPŁATNIE · ANALIZA MECZÓW','Więcej niż wynik.','Sprawdź szanse na wygraną, formę drużyn i interaktywne analizy.','◈ Analiza modelu','↻ Porównanie drużyn','ODKRYJ MATCH CENTER','Za darmo · Bez rejestracji']};
let raw=(navigator.languages&&navigator.languages[0])||navigator.language||'en';try{const pref=localStorage.getItem('bettao_language_v1')||localStorage.getItem('bettao_lang')||localStorage.getItem('bettao_language');if(pref)raw=pref}catch(_){}
const l=raw.toLowerCase();const key=l.startsWith('pt')?'pt-BR':l.startsWith('no')||l.startsWith('nb')||l.startsWith('nn')?'nb':l.slice(0,2);const a=dict[key]||dict.en;
const keys=['eyebrow','headline','description','point1','point2','cta','footnote'];keys.forEach((k,i)=>{const n=el.querySelector('[data-promo-i18n="'+k+'"]');if(!n)return;if(k==='headline'){const parts=a[i].split(' ');const cut=Math.max(1,Math.floor(parts.length/2));n.textContent='';n.append(document.createTextNode(parts.slice(0,cut).join(' ')+' '));const em=document.createElement('em');em.textContent=parts.slice(cut).join(' ');n.append(em)}else n.textContent=a[i]});
const dismissKey='bettao_mc_promo_closed_at_v11',sessionKey='bettao_mc_promo_shown_v11';let blocked=false;try{const d=Number(localStorage.getItem(dismissKey));blocked=Boolean(d&&Date.now()-d<14*86400000)||sessionStorage.getItem(sessionKey)==='1'}catch(_){}
if(blocked)return;
let shown=false;function show(){if(shown||document.hidden)return;shown=true;el.hidden=false;try{sessionStorage.setItem(sessionKey,'1')}catch(_){}window.removeEventListener('scroll',onScroll)}
function onScroll(){if(window.scrollY>270)show()}
window.addEventListener('scroll',onScroll,{passive:true});const timer=setTimeout(show,9000);
close.addEventListener('click',()=>{el.hidden=true;clearTimeout(timer);try{localStorage.setItem(dismissKey,String(Date.now()))}catch(_){}});
})();
