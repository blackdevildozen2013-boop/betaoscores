/* Bettao Cinematic Effects v5: decorative only; no analytics or data changes. */
(()=>{'use strict';
 const body=document.body;
 const motionKey='bettao_motion_enabled_v1';
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let enabled=!reduced;
 try{const saved=localStorage.getItem(motionKey);if(saved!==null)enabled=saved==='yes'&&!reduced}catch(_){}
 function applyMotion(){body.classList.toggle('fx-motion-off',!enabled);if(toggle){toggle.setAttribute('aria-pressed',String(enabled));toggle.lastChild.textContent=enabled?'Motion on':'Motion off'}}
 let toggle=null;
 const anchor=document.querySelector('.api-workspace-top')||document.querySelector('.api-intel-head');
 if(anchor){toggle=document.createElement('button');toggle.type='button';toggle.className='fx-motion-toggle';toggle.setAttribute('aria-label','Toggle decorative motion');toggle.appendChild(Object.assign(document.createElement('span'),{className:'fx-dot'}));toggle.appendChild(document.createTextNode('Motion on'));toggle.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem(motionKey,enabled?'yes':'no')}catch(_){}applyMotion()});anchor.appendChild(toggle)}
 applyMotion();
 if(('IntersectionObserver' in window)&&!reduced){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('fx-visible');observer.unobserve(entry.target)}}},{threshold:.07,rootMargin:'0px 0px -24px 0px'});
 const targets=document.querySelectorAll('.api-metric,.api-workspace-shell,.mc-hero-card,.mc-section-head');
 for(const el of targets){el.classList.add('fx-reveal');observer.observe(el)}
 const shell=document.querySelector('.api-workspace-shell');
 if(shell&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){shell.addEventListener('pointermove',e=>{if(!enabled)return;const r=shell.getBoundingClientRect();shell.style.setProperty('--fx-x',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');shell.style.setProperty('--fx-y',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')},{passive:true})}
}
 // Automatic premium flip: 180° around Y axis, reveal for four seconds, then return.
 // Manual tap/click works independently of automatic motion.
 const flipTimers=new WeakMap();
 function setFlip(card,on){
  if(!card||!card.isConnected)return;
  const old=flipTimers.get(card);if(old)clearTimeout(old);
  card.classList.toggle('is-flipped',on);
  card.setAttribute('aria-pressed',String(on));
  card.setAttribute('aria-label',card.getAttribute('aria-label').replace(/ · (reveal advanced team statistics|return to team form)$/,'')+(on?' · return to team form':' · reveal advanced team statistics'));
  const back=card.querySelector('.intel-flip-back'),front=card.querySelector('.intel-flip-front');
  if(back)back.setAttribute('aria-hidden',String(!on));
  if(front)front.setAttribute('aria-hidden',String(on));
  if(on)flipTimers.set(card,setTimeout(()=>setFlip(card,false),4000));
 }
 document.addEventListener('click',e=>{
  const card=e.target.closest&&e.target.closest('.intel-flip-card');
  if(card)setFlip(card,!card.classList.contains('is-flipped'));
 });
 let cycle=0;
 setInterval(()=>{
  if(!enabled||document.hidden||reduced)return;
  const cards=[...document.querySelectorAll('.intel-flip-card')];
  if(cards.length!==2)return;
  const rect=cards[0].getBoundingClientRect();
  if(rect.bottom<0||rect.top>window.innerHeight)return;
  // Flip one after the other for a refined, staggered reveal.
  if(cards.some(card=>card.classList.contains('is-flipped')))return;
  setFlip(cards[0],true);
  setTimeout(()=>{if(enabled&&!document.hidden&&cards[1].isConnected)setFlip(cards[1],true)},300);
  cycle++;
 },11000);
})();
