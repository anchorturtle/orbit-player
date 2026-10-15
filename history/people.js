// v9: People layer. Tap a name chip on a beat card to open a mini-bio (photo, story, facts, sources).
(function(){
const P=window.PEOPLE||[],X=window.EXTRA_ACC||[],D=window.DEEP2=window.DEEP2||{},G=window.GLOSSARY||{};
// extra accordion layers -> deep data (rendered by accordions.js before Sources)
X.forEach(a=>{(D[a.section]=D[a.section]||{}).extra=(D[a.section].extra||[]).concat([a])});
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const surname=n=>n.replace(/\(.*?\)/g,'').trim().split(/\s+/).pop();
function bio(p){const src=(p.sources||[]).map(s=>`<li>${s.url&&/^https?:\/\//.test(s.url)?`<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title||s.url)}</a>`:esc(s.title||'')}</li>`).join('');
return `<div class="pbio-in">${p.photo?`<figure class="pph"><img src="${esc(p.photo)}" alt="${esc(p.name)}" width="${p.w||300}" height="${p.h||360}" loading="lazy" decoding="async">${p.credit?`<figcaption>${esc(p.credit)}</figcaption>`:''}</figure>`:''}
<div class="ptxt"><h4>${esc(p.name)}</h4><p class="pmeta">${esc(p.years)}${p.years&&p.role?' · ':''}${esc(p.role)}</p>${p.story.map(t=>`<p>${esc(t)}</p>`).join('')}
${p.facts&&p.facts.length?`<ul class="pfacts">${p.facts.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`:''}
${p.uncertain&&p.uncertain.length?`<aside class="punc"><b>Where historians disagree</b>${p.uncertain.map(u=>`<p>${esc(u)}</p>`).join('')}</aside>`:''}
${src?`<details class="psrc"><summary>Sources</summary><ul>${src}</ul></details>`:''}</div></div>`}
function chip(p){return `<button class="pchip" aria-expanded="false" aria-controls="pb-${p.id}" id="person-${p.id}">${p.photo?`<img src="${esc(p.photo)}" alt="" width="28" height="28" loading="lazy">`:`<span class="pini" aria-hidden="true">${esc(p.name[0])}</span>`}<span>${esc(p.name)}</span></button>`}
function row(list,label){return `<div class="prow"><span class="pkick">${label}</span><div class="pchips">${list.map(chip).join('')}</div>${list.map(p=>`<div class="pbio" id="pb-${p.id}" role="region" aria-labelledby="person-${p.id}">${bio(p)}</div>`).join('')}</div>`}
const by={};P.forEach(p=>(by[p.section]=by[p.section]||[]).push(p));
Object.entries(by).forEach(([sec,list])=>{const S=document.getElementById(sec);if(!S)return;const used=new Set();
 S.querySelectorAll('.beat').forEach(b=>{const t=b.textContent;const hit=list.filter(p=>!used.has(p.id)&&(t.includes(p.name)||new RegExp('\\b'+surname(p.name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b').test(t)));
  if(hit.length){hit.forEach(p=>used.add(p.id));b.insertAdjacentHTML('beforeend',row(hit,'People in this story'))}});
 const rest=list.filter(p=>!used.has(p.id));if(!rest.length)return;
 const anchor=S.querySelector('.copy .pull')||S.querySelector('.copy .deeper')||S.querySelector('.copy')||S.querySelector('.card');
 const html=`<div class="card prow-card">${row(rest,'More people behind this chapter')}</div>`;
 anchor.classList&&anchor.classList.contains('copy')?anchor.insertAdjacentHTML('beforeend',html):anchor.insertAdjacentHTML('beforebegin',html)});
const nudge=()=>setTimeout(()=>dispatchEvent(new Event('resize')),40);
function set(btn,on){const p=document.getElementById(btn.getAttribute('aria-controls'));if(!p)return;btn.setAttribute('aria-expanded',on);
 if(RM){p.style.height=on?'auto':'0px';p.style.visibility=on?'visible':'hidden';nudge();return}
 p.style.visibility='visible';const h=p.scrollHeight;if(on){p.style.height='0px';p.offsetHeight;p.style.height=h+'px'}else{p.style.height=p.offsetHeight+'px';p.offsetHeight;p.style.height='0px'}
 clearTimeout(p._t);p._t=setTimeout(()=>{if(on)p.style.height='auto';else p.style.visibility='hidden';nudge()},420)}
document.addEventListener('click',e=>{const b=e.target.closest('.pchip');if(!b)return;const on=b.getAttribute('aria-expanded')!=='true';
 b.closest('.prow').querySelectorAll('.pchip[aria-expanded=true]').forEach(x=>x!==b&&set(x,false));set(b,on);if(on)history.replaceState(null,'','#'+b.id)});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const b=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.prow');if(!b)return;const o=b.querySelector('.pchip[aria-expanded=true]');if(o){set(o,false);o.focus()}});
function deep(){const h=location.hash.slice(1);if(!h.startsWith('person-'))return;const b=document.getElementById(h);if(!b)return;set(b,true);setTimeout(()=>{scrollTo({top:b.getBoundingClientRect().top+scrollY-110});b.focus({preventScroll:true})},120)}
addEventListener('hashchange',deep);addEventListener('load',()=>setTimeout(deep,250));
})();
