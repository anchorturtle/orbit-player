// v8: layered "go deeper" accordions
(function(){
const D=window.DEEP2||{},G=window.GLOSSARY||{},KEY='hoc-acc-v8';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('still');
let open=new Set();try{open=new Set(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify([...open]))}catch(e){}};
const gk=k=>Object.keys(G).find(x=>x.toLowerCase()===k.toLowerCase());
const lk=s=>s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,sh)=>{const key=gk(k);return key?`<button class="term" data-term="${key}" aria-describedby="tip">${sh||k}</button>`:(sh||k)});
const paras=s=>s.split(/\n\s*\n/).map(p=>`<p>${lk(p.trim())}</p>`).join('');
const FIG={
theory:`<svg viewBox="0 0 320 90" role="img" aria-label="A Turing machine: tape of cells, read/write head, state"><g fill="none" stroke="currentColor" stroke-width="1.2">${[...Array(9)].map((_,i)=>`<rect x="${16+i*32}" y="40" width="32" height="30"/>`).join('')}</g><g font-size="14" text-anchor="middle" fill="currentColor">${'0110100▢▢'.split('').map((c,i)=>`<text x="${32+i*32}" y="60">${c}</text>`).join('')}</g><path d="M144 12h32v14l-16 12-16-12z" fill="none" stroke="#e8c26a"/><text x="160" y="23" font-size="10" text-anchor="middle" fill="#e8c26a">B</text><text x="196" y="24" font-size="10" fill="currentColor">head · state B</text><text x="16" y="86" font-size="9" fill="currentColor" opacity=".7">endless tape →</text></svg>`,
network:`<svg viewBox="0 0 320 90" role="img" aria-label="Packets taking different routes through a network"><g stroke="currentColor" opacity=".5"><path d="M20 45L100 15L220 15L300 45L220 75L100 75Z M100 15L220 75 M100 75L220 15"/></g><g fill="currentColor">${[[20,45],[100,15],[220,15],[300,45],[220,75],[100,75]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4"/>`).join('')}</g><g fill="#e8c26a" font-size="9">${[[60,30,'1'],[160,15,'2'],[160,45,'3'],[260,60,'4']].map(p=>`<rect x="${p[0]-7}" y="${p[1]-6}" width="14" height="12" rx="2" opacity=".85"/><text x="${p[0]}" y="${p[1]+3}" text-anchor="middle" fill="#071021">${p[2]}</text>`).join('')}</g></svg>`};
const L=[['gist','The gist',1],['how','How it actually works',2],['people','The people & the context',3],['deep','Deep dive',4]];
function item(sec,key,title,lv,body,inner=''){const id=`acc-${sec}-${key}`;return `<div class="acc" data-lv="${lv}"><h4 class="acc-h"><button class="acc-btn" id="${id}" aria-expanded="false" aria-controls="${id}-p">${lv?`<span class="acc-lv">${lv}</span>`:''}<span class="acc-t">${title}</span><span class="acc-ch" aria-hidden="true"></span></button></h4><div class="acc-p" id="${id}-p" role="region" aria-labelledby="${id}"><div class="acc-in">${body}${inner}</div></div></div>`}
function build(sec){const d=D[sec];if(!d)return'';let inner='';
for(let i=L.length-1;i>=0;i--){const[k,t,lv]=L[i];if(!d[k])continue;const body=(k==='how'&&FIG[sec]?`<figure class="acc-fig">${FIG[sec]}</figure>`:'')+paras(d[k]);inner=item(sec,k,t,lv,body,inner)}
let s=inner;
if(d.myths)s+=item(sec,'myths','Myths & misconceptions','',paras(d.myths));
if(d.led)s+=item(sec,'led','What it led to','',paras(d.led)+(d.links?`<div class="acc-links">${d.links.map(([t,era,node])=>`${era?`<button class="acc-go" data-go="${era}">${t} ↓</button>`:''}${node&&!era?`<button class="acc-go" data-node="${node}">${t} ⌘ map</button>`:''}${node&&era?`<button class="acc-go acc-map" data-node="${node}" aria-label="Show ${node} on the tech-tree map">on map</button>`:''}`).join('')}</div>`:''));
(d.extra||[]).forEach((x,i)=>{s+=item(sec,'x'+i,x.title,'',paras((x.paras||[]).join('\n\n'))+((x.sources||[]).length?`<ul class="acc-src">${x.sources.map(z=>`<li>${typeof z==='string'?z:(z.url?`<a href="${z.url}" rel="noopener" target="_blank">${z.title||z.url}</a>`:z.title)}</li>`).join('')}</ul>`:''))});
if(d.sources)s+=item(sec,'src','Sources & further reading','',`<ul class="acc-src">${d.sources.map(x=>`<li>${x}</li>`).join('')}</ul>`);
return `<div class="acc-wrap" data-sec="${sec}"><div class="acc-tools"><span class="acc-kick">Go deeper</span><button class="acc-all" data-a="1">Expand all</button><button class="acc-all" data-a="0">Collapse all</button></div>${s}</div>`}
const nudge=(()=>{let t;return()=>{clearTimeout(t);t=setTimeout(()=>dispatchEvent(new Event('resize')),30)}})();
function set(btn,on,anim=true){const p=document.getElementById(btn.getAttribute('aria-controls'));if(!p||(btn.getAttribute('aria-expanded')==='true')===on)return;btn.setAttribute('aria-expanded',on);on?open.add(btn.id):open.delete(btn.id);
if(!anim||RM){p.style.transition='none';p.style.height=on?'auto':'0px';p.style.visibility=on?'visible':'hidden';p.offsetHeight;p.style.transition='';nudge();return}
p.style.visibility='visible';const h=p.scrollHeight;
if(on){p.style.height='0px';p.offsetHeight;p.style.height=h+'px'}else{p.style.height=p.offsetHeight+'px';p.offsetHeight;p.style.height='0px'}
p.dataset.to=on?'1':'0';clearTimeout(p._t);p._t=setTimeout(()=>fin(p),460)}
function fin(p){clearTimeout(p._t);if(p.dataset.to==='1'){p.style.transition='none';p.style.height='auto';p.offsetHeight;p.style.transition=''}else if(p.dataset.to==='0')p.style.visibility='hidden';delete p.dataset.to;nudge()}
document.addEventListener('transitionend',e=>{const p=e.target;if(!p.classList||!p.classList.contains('acc-p')||e.propertyName!=='height')return;fin(p)});
function wire(root){root.querySelectorAll('.acc-btn').forEach(b=>{if(open.has(b.id))set(b,true,false)})}
function insert(sec,el,where='beforeend'){if(!el||!D[sec])return;el.insertAdjacentHTML(where,build(sec));wire(document.querySelector(`.acc-wrap[data-sec="${sec}"]`))}
document.querySelectorAll('section.era').forEach(s=>{const d=s.querySelector('.copy .deeper');d?insert(s.id,d,'afterend'):insert(s.id,s.querySelector('.copy'))});
insert('dive',document.querySelector('.physics .card'));
insert('switches',document.querySelector('.switches .card'));
const cl=document.querySelector('#finale .close');insert('finale',cl||document.getElementById('finale'),cl?'beforebegin':'beforeend');
document.addEventListener('click',e=>{
const b=e.target.closest('.acc-btn');if(b){const on=b.getAttribute('aria-expanded')!=='true';set(b,on);save();if(on)history.replaceState(null,'','#'+b.id);return}
const a=e.target.closest('.acc-all');if(a){const w=a.closest('.acc-wrap'),on=a.dataset.a==='1',bs=[...w.querySelectorAll('.acc-btn')],top=b=>!b.closest('.acc-p');
if(on)bs.reverse().forEach(x=>set(x,true,top(x)));else{bs.filter(top).forEach(x=>set(x,false));setTimeout(()=>bs.filter(x=>!top(x)).forEach(x=>set(x,false,false)),420)}
save();setTimeout(save,450);return}
const g=e.target.closest('.acc-go');if(g){if(g.dataset.node&&window.__mapFocus){window.__mapFocus(g.dataset.node);return}const t=document.getElementById(g.dataset.go);if(t)scrollTo({top:t.getBoundingClientRect().top+scrollY,behavior:'smooth'});return}
const tr=e.target.closest('[data-trail]');if(tr)setTimeout(()=>{const tb=document.getElementById('trailBody'),sec='trail-'+tr.dataset.trail;if(tb&&!tb.querySelector('.acc-wrap')){const r=tb.querySelector('.rejoin');insert(sec,r||tb,r?'beforebegin':'beforeend')}},0)});
function deep(){const h=decodeURIComponent(location.hash.slice(1));if(!h.startsWith('acc-'))return;const b=document.getElementById(h);if(!b)return;let p=b.closest('.acc-p');const chain=[b];while(p){chain.unshift(document.getElementById(p.getAttribute('aria-labelledby')));p=p.parentElement.closest('.acc-p')}chain.forEach(x=>set(x,true,false));save();setTimeout(()=>{scrollTo({top:b.getBoundingClientRect().top+scrollY-110});b.focus({preventScroll:true})},120)}
addEventListener('hashchange',deep);if(document.readyState==='complete')deep();else addEventListener('load',()=>setTimeout(deep,200));
})();
