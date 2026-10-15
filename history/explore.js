// v7: tech-tree map + branching side trails
(function(){
const $=s=>document.querySelector(s);
const LANES=['Hardware','Ideas & software','Networks','AI','Quantum'];
// id, label, year, lane, era, deps, note
const N=[
['abacus','Abacus',-2700,0,'origins',[],'Bead positions store numbers'],
['pascaline','Pascaline',1642,0,'origins',['abacus'],'Geared adder by Pascal'],
['binary','Binary arithmetic',1703,1,'origins',[],'Leibniz publishes 0/1 arithmetic'],
['loom','Jacquard loom',1804,0,'origins',[],'Punched cards program a loom'],
['diffeng','Difference Engine',1822,0,'engines',['pascaline'],'Babbage computes tables'],
['analytical','Analytical Engine',1837,0,'engines',['diffeng','loom'],'Mill + store + cards'],
['lovelace','Lovelace’s notes',1843,1,'engines',['analytical'],'First published machine algorithm'],
['boole','Boolean logic',1854,1,'engines',['binary'],'Logic as algebra'],
['turing','Turing machine',1936,1,'theory',['lovelace'],'What is computable'],
['shannon','Switching theory',1937,1,'theory',['boole'],'Boole → circuits'],
['colossus','Colossus',1944,0,'codebreakers',['shannon'],'Programmable electronic codebreaker'],
['storedprog','Stored program',1945,1,'electronic',['turing'],'Von Neumann’s EDVAC report'],
['eniac','ENIAC',1946,0,'electronic',['colossus'],'17,500 vacuum tubes'],
['transistor','Transistor',1947,0,'transistor',[],'Bell Labs solid-state switch'],
['baby','Manchester Baby',1948,0,'electronic',['storedprog','eniac'],'First stored program runs'],
['info','Information theory',1948,1,'theory',['shannon'],'The bit as a unit'],
['compiler','Compiler (A-0)',1952,1,'software',['storedprog'],'Grace Hopper'],
['dartmouth','“AI” named',1956,3,'ai1',['turing'],'Dartmouth workshop'],
['fortran','FORTRAN',1957,1,'software',['compiler'],'First popular high-level language'],
['ic','Integrated circuit',1958,0,'transistor',['transistor'],'Kilby & Noyce'],
['perceptron','Perceptron',1958,3,'ai1',['dartmouth'],'A learning neuron'],
['moore','Moore’s law',1965,0,'transistor',['ic'],'Doubling every ~2 years'],
['arpanet','ARPANET',1969,2,'network',['baby'],'First message: “LO”'],
['unix','UNIX',1969,1,'software',['fortran'],'Bell Labs OS'],
['i4004','Intel 4004',1971,0,'transistor',['moore'],'CPU on one chip'],
['c','C language',1972,1,'software',['unix'],'Ritchie'],
['alto','Xerox Alto (GUI)',1973,1,'personal',['i4004'],'Windows, icons, mouse'],
['feynman','Quantum simulation idea',1981,4,'quantum',['info'],'Feynman’s proposal'],
['tcpip','TCP/IP',1983,2,'network',['arpanet'],'The internet’s language'],
['mac','Macintosh',1984,1,'personal',['alto'],'GUI for the masses'],
['backprop','Backpropagation',1986,3,'ai1',['perceptron'],'Deep nets can learn'],
['web','World Wide Web',1991,2,'network',['tcpip'],'Berners-Lee at CERN'],
['linux','Linux',1991,1,'software',['c'],'Open source kernel'],
['shor','Shor’s algorithm',1994,4,'quantum',['feynman'],'Factoring threat to RSA'],
['deepblue','Deep Blue',1997,3,'ai1',['backprop'],'Beats Kasparov (search)'],
['gpu','GPU',1999,0,'ai2',['i4004'],'Parallel graphics chips'],
['cloud','Cloud (AWS)',2006,2,'network',['web','linux'],'Rentable data centers'],
['iphone','Smartphone era',2007,2,'network',['web'],'Internet in your pocket'],
['imagenet','ImageNet',2009,3,'ai2',['web'],'14M labeled images'],
['alexnet','AlexNet',2012,3,'ai2',['imagenet','gpu','backprop'],'Deep learning breakthrough'],
['alphago','AlphaGo',2016,3,'ai2',['alexnet'],'Beats Lee Sedol 4–1'],
['transformer','Transformer',2017,3,'ai3',['alexnet'],'Attention is all you need'],
['sycamore','Sycamore claim',2019,4,'quantum',['shor'],'Disputed supremacy'],
['scaling','Scaling laws',2020,3,'ai3',['transformer','cloud'],'Bigger → predictably better'],
['chatgpt','ChatGPT',2022,3,'ai3',['scaling','iphone'],'LLMs go public'],
['willow','Willow',2024,4,'quantum',['sycamore'],'Below-threshold error correction'],
['agi','AGI?',2032,3,'finale',['chatgpt','willow'],'Not achieved, contested future']];
const X=y=>y<1800?(y+2700)/4500*.12:y<1940?.12+(y-1800)/140*.2:.32+(y-1940)/92*.66;
const SORT=[...N].sort((a,b)=>a[2]-b[2]),STEP=46,Wd=SORT.length*STEP+140,Hd=640,L0=70,LH=(Hd-110)/LANES.length;
const pos={};SORT.forEach((n,i)=>{pos[n[0]]=[90+i*STEP,L0+n[3]*LH+LH/2+(i%2?14:-14)]});const XY=y=>{const i=SORT.findIndex(n=>n[2]>=y);return 90+(i<0?SORT.length-1:i)*STEP-STEP/2};
const svg=`<svg viewBox="0 0 ${Wd} ${Hd}" width="${Wd}" height="${Hd}" role="img" aria-label="Tech tree of computing">
${LANES.map((l,i)=>`<rect x="0" y="${L0+i*LH}" width="${Wd}" height="${LH}" class="lane l${i}"/><text x="12" y="${L0+i*LH+20}" class="lt">${l}</text>`).join('')}
${[1800,1900,1950,1970,1990,2010,2020].map(y=>`<line x1="${XY(y)}" x2="${XY(y)}" y1="${L0-10}" y2="${Hd-30}" class="yr"/><text x="${XY(y)}" y="${Hd-12}" class="yt">${y}</text>`).join('')}
<g class="edges">${N.flatMap(n=>n[5].map(d=>{const [x1,y1]=pos[d],[x2,y2]=pos[n[0]];const mx=(x1+x2)/2;return `<path d="M${x1} ${y1} C${mx} ${y1},${mx} ${y2},${x2} ${y2}" data-from="${d}" data-to="${n[0]}" class="${n[0]==='agi'?'dash':''}"/>`})).join('')}</g>
${N.map(n=>{const [x,y]=pos[n[0]];return `<g class="node l${n[3]}" tabindex="0" role="button" data-id="${n[0]}" data-era="${n[4]}" aria-label="${n[1]}, ${n[2]<0?(-n[2])+' BCE':n[2]}: ${n[6]}"><circle cx="${x}" cy="${y}" r="${n[0]==='agi'?11:7}"/><text x="${x}" y="${y+(SORT.indexOf(n)%2?24:-13)}">${n[1]}</text></g>`}).join('')}</svg>`;
document.body.insertAdjacentHTML('beforeend',`<div id="tree" role="dialog" aria-modal="true" aria-label="Tech tree" hidden><div class="treebox"><div class="ghead"><h2>How inventions connect</h2><button id="treeClose" aria-label="Close map">✕</button></div>
<p class="treehelp">Hover or focus a node to light up everything it was built on. Click to jump there. Scroll sideways →</p><div class="treescroll">${svg}</div><p id="treeInfo" aria-live="polite"></p></div></div>`);
$('#hud nav').insertAdjacentHTML('afterbegin','<button id="mapBtn" aria-haspopup="dialog">Map</button>');
const tree=$('#tree'),info=$('#treeInfo');
const anc=id=>{const s=new Set([id]);const go=i=>{(N.find(n=>n[0]===i)||[])[5]?.forEach(d=>{if(!s.has(d)){s.add(d);go(d)}})};go(id);return s};
function hl(id){const s=id?anc(id):null;tree.querySelectorAll('.node').forEach(g=>g.classList.toggle('dim',!!s&&!s.has(g.dataset.id)));tree.querySelectorAll('.edges path').forEach(p=>p.classList.toggle('lit',!!s&&s.has(p.dataset.to)&&s.has(p.dataset.from)));
 const n=id&&N.find(n=>n[0]===id);info.textContent=n?`${n[1]} (${n[2]<0?(-n[2])+' BCE':n[2]===2032?'future?':n[2]}): ${n[6]}. Built on ${s.size-1} earlier step${s.size===2?'':'s'}.`:''}
tree.querySelectorAll('.node').forEach(g=>{g.onmouseenter=g.onfocus=()=>hl(g.dataset.id);g.onmouseleave=()=>hl(null);
 const go=()=>{tree.hidden=true;const el=document.getElementById(g.dataset.era);if(el){const de=document.documentElement;de.style.scrollBehavior='auto';scrollTo(0,el.getBoundingClientRect().top+scrollY);de.style.scrollBehavior=''}};g.onclick=go;g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
$('#mapBtn').onclick=()=>{tree.hidden=false;const sc=tree.querySelector('.treescroll');const cur=[...document.querySelectorAll('.era')].filter(s=>s.getBoundingClientRect().top<innerHeight*.5).pop();
 const nn=cur&&N.find(n=>n[4]===cur.id);sc.scrollLeft=nn?pos[nn[0]][0]-sc.clientWidth/2:0;if(nn)hl(nn[0]);$('#treeClose').focus()};
window.__mapFocus=id=>{tree.hidden=false;const sc=tree.querySelector('.treescroll');if(pos[id]){sc.scrollLeft=pos[id][0]-sc.clientWidth/2;hl(id)}$('#treeClose').focus()};
$('#treeClose').onclick=()=>tree.hidden=true;tree.addEventListener('click',e=>{if(e.target===tree)tree.hidden=true});addEventListener('keydown',e=>{if(e.key==='Escape')tree.hidden=true});
/* ---------- side trails ---------- */
const TR={
hardware:{after:'transistor',title:'Trail: how a chip is made',color:'#3fb59a',beats:[
 ["It starts as sand.","Quartz sand is mostly silicon dioxide. It's refined into silicon around 99.9999999% pure, known as 'nine nines'."],
 ["Grown as one giant crystal.","A seed crystal is slowly pulled from molten silicon (the Czochralski process), forming an ingot with every atom lined up."],
 ["Sliced into mirror-flat wafers.","Leading fabs use 300 mm wafers. Each one becomes hundreds of chips."],
 ["Printed with light.","Photolithography projects circuit patterns. The newest machines use extreme ultraviolet light at 13.5 nm, made by firing lasers at droplets of molten tin."],
 ["Hundreds of steps, months of work.","Deposit, pattern, etch, implant, repeat, building dozens of layers of transistors and wiring. Then each chip is tested, cut and packaged."]]},
ai:{after:'ai3',title:'Trail: how a language model is trained',color:'#a77dff',beats:[
 ["Step 1: read a huge chunk of the internet.","Pretraining: predict the next token across trillions of tokens of text and code. Prediction forces the model to learn grammar, facts and patterns."],
 ["Step 2: teach it to be helpful.","Fine-tuning on example conversations, then reinforcement learning from human (or AI) feedback on which answers are better."],
 ["Step 3: talk to it.","At inference time, the model generates one token at a time, each chosen from a probability distribution."],
 ["Why it sometimes makes things up.","It's trained to produce plausible text, not checked facts. Tools, search and citations help ground it."]]},
quantum:{after:'quantum',title:'Trail: what a qubit is made of',color:'#5ff0e0',beats:[
 ["Superconducting circuits.","Tiny loops chilled to about 10–20 millikelvin, colder than outer space. Used by Google and IBM."],
 ["Trapped ions.","Single charged atoms held by electric fields and controlled with lasers. Used by Quantinuum and IonQ."],
 ["Neutral atoms.","Arrays of atoms held in 'optical tweezers' made of laser light. Used by QuEra and Atom Computing, among others."],
 ["Photons.","Qubits encoded in light, which works at room temperature for much of the hardware. PsiQuantum and Xanadu pursue this route."],
 ["Why it's all so fragile.","Any stray heat, vibration or radiation causes decoherence. That's why error correction matters so much."]]}};
document.body.insertAdjacentHTML('beforeend',`<aside id="trail" aria-label="Side trail" hidden><button id="trailClose" class="rejoin">↩ Rejoin the main dive</button><div id="trailBody"></div></aside>`);
Object.entries(TR).forEach(([k,T])=>{const sec=document.getElementById(T.after);const end=sec&&(sec.querySelector('.copy .nexthook')||sec.querySelector('.copy'));if(!end)return;
 end.insertAdjacentHTML('beforebegin',`<div class="card fork" style="--tc:${T.color}"><span class="bn">FORK IN THE ROAD</span><h3 class="big">Take a side trail?</h3><p>${T.title.replace('Trail: ','')}, in ${T.beats.length} quick stops. You can rejoin the main dive any time.</p><div class="row"><button data-trail="${k}">Take the trail →</button><button class="stay">Stay on the main dive ↓</button></div></div>`)});
const trail=$('#trail'),tb=$('#trailBody');
document.addEventListener('click',e=>{const b=e.target.closest('[data-trail]');if(b){const T=TR[b.dataset.trail];tb.innerHTML=`<h2 style="color:${T.color}">${T.title}</h2>`+T.beats.map((x,i)=>`<div class="tbeat" style="--d:${i}"><span class="bn">STOP ${i+1}</span><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')+`<button class="rejoin" onclick="document.getElementById('trailClose').click()">↩ Back to the main dive</button>`;
 trail.style.setProperty('--tc',T.color);trail.hidden=false;tb.scrollTop=0;$('#trailClose').focus();return}
 const s=e.target.closest('.fork .stay');if(s){const n=s.closest('.copy').querySelector('.nexthook');if(n)n.scrollIntoView({block:'center'})}});
$('#trailClose').onclick=()=>{trail.hidden=true};addEventListener('keydown',e=>{if(e.key==='Escape')trail.hidden=true});
})();
