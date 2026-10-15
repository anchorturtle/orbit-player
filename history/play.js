// v6: toys + trivia
(function(){
const $=s=>document.querySelector(s);
const after=(id,html)=>{const q=document.querySelector('#'+id+' .copy .pull');if(q)q.insertAdjacentHTML('afterend',html)};
/* ---------- Toy 1: half-adder ---------- */
after('engines',`<div class="card toy" id="toy-adder"><span class="bn">PLAY</span><h3 class="big">Build a half-adder</h3>
<p>Flip the inputs. Two gates, XOR and AND, are enough to add two bits. Chain these and you can add any numbers.</p>
<div class="adder"><button class="bit" data-b="a" aria-pressed="false">A = 0</button><button class="bit" data-b="b" aria-pressed="false">B = 0</button>
<svg viewBox="0 0 320 130" role="img" aria-label="Half adder circuit"><g fill="none" stroke-width="3">
<path id="wa1" d="M0 30 H120"/><path id="wb1" d="M0 100 H60 V50 H120"/><path id="wa2" d="M40 30 V80 H120"/><path id="wb2" d="M0 100 H120"/>
<path d="M120 15 h30 a25 25 0 0 1 0 50 h-30z" class="g" /><text x="132" y="45" class="gt">XOR</text>
<path d="M120 70 h30 a25 25 0 0 1 0 50 h-30z" class="g"/><text x="130" y="100" class="gt">AND</text>
<path id="ws" d="M175 40 H260"/><path id="wc" d="M175 95 H260"/></g>
<text x="266" y="45" class="out" id="os">S=0</text><text x="266" y="100" class="out" id="oc">C=0</text></svg>
<p class="sum" aria-live="polite">0 + 0 = <b>00</b> (binary) = 0</p></div></div>`);
(function(){const st={a:0,b:0};const el=$('#toy-adder');if(!el)return;
 function up(){const s=st.a^st.b,c=st.a&st.b;el.querySelectorAll('.bit').forEach(b=>{const v=st[b.dataset.b];b.textContent=b.dataset.b.toUpperCase()+' = '+v;b.setAttribute('aria-pressed',!!v)});
  const on=(id,v)=>el.querySelector('#'+id).style.stroke=v?'#ffd99a':'#2a4a8a';on('wa1',st.a);on('wa2',st.a);on('wb1',st.b);on('wb2',st.b);on('ws',s);on('wc',c);
  el.querySelector('#os').textContent='S='+s;el.querySelector('#oc').textContent='C='+c;el.querySelector('.sum').innerHTML=`${st.a} + ${st.b} = <b>${c}${s}</b> (binary) = ${st.a+st.b}`}
 el.querySelectorAll('.bit').forEach(b=>b.onclick=()=>{st[b.dataset.b]^=1;up()});up()})();
/* ---------- Toy 2: mini Enigma (real Enigma I wirings, rotors I-II-III, reflector B, rings at A) ---------- */
after('codebreakers',`<div class="card toy" id="toy-enigma"><span class="bn">PLAY</span><h3 class="big">Crack a mini Enigma</h3>
<p>Type a message. The rotors step with each key, so the same letter encrypts differently every time. Reset the rotors, type the ciphertext back, and the plaintext reappears: Enigma is its own inverse.</p>
<div class="rotors" aria-live="polite"><span>A</span><span>A</span><span>A</span></div>
<label class="sr" for="enin">Message</label><input id="enin" autocomplete="off" spellcheck="false" placeholder="type here…" maxlength="60">
<div class="enout"><span class="lbl">CIPHER</span><b id="enout"></b></div><button id="enreset">Reset rotors to AAA</button>
<p class="fine">A real three-rotor Enigma has about 10²³ possible daily settings when you count the plugboard. This one has no plugboard.</p></div>`);
(function(){const el=$('#toy-enigma');if(!el)return;const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 const R=[['EKMFLGDQVZNTOWYHXUSPAIBRCJ','Q'],['AJDKSIRUXBLHWTMCQGZNPYFVOE','E'],['BDFHJLCPRTXVZNYEIWGAKMUSQO','V']],UKW='YRUHQSLDPXNGOKMIEBFZCWVJAT';
 let pos=[0,0,0]; // left, middle, right
 const f=(w,c,p)=>(A.indexOf(w[(c+p)%26])-p+26)%26,b=(w,c,p)=>(w.indexOf(A[(c+p)%26])-p+26)%26;
 function step(){const atN=(i)=>A[pos[i]]===R[i][1];if(atN(1)){pos[0]=(pos[0]+1)%26;pos[1]=(pos[1]+1)%26}else if(atN(2))pos[1]=(pos[1]+1)%26;pos[2]=(pos[2]+1)%26}
 function enc(ch){step();let c=A.indexOf(ch);for(let i=2;i>=0;i--)c=f(R[i][0],c,pos[i]);c=A.indexOf(UKW[c]);for(let i=0;i<3;i++)c=b(R[i][0],c,pos[i]);return A[c]}
 const inp=el.querySelector('#enin'),out=el.querySelector('#enout'),rs=el.querySelectorAll('.rotors span');
 function show(){rs.forEach((s,i)=>{s.textContent=A[pos[i]]})}
 inp.oninput=()=>{pos=[0,0,0];out.textContent=[...inp.value.toUpperCase()].map(c=>A.includes(c)?enc(c):c===' '?' ':'').join('');show();rs.forEach(s=>{s.classList.remove('kick');void s.offsetWidth;s.classList.add('kick')})};
 el.querySelector('#enreset').onclick=()=>{inp.value='';out.textContent='';pos=[0,0,0];show();inp.focus()};show()})();
/* ---------- Toy 3: train a neuron ---------- */
after('ai1',`<div class="card toy" id="toy-neuron"><span class="bn">PLAY</span><h3 class="big">Train a neuron</h3>
<p>Click to drop <b class="ga">gold</b> points and shift-click (or switch the colour) to drop <b class="bl">blue</b> points. Press Train and watch one perceptron learn a line that separates them.</p>
<canvas width="560" height="320" aria-label="Perceptron training area"></canvas>
<div class="row"><button id="nnClass">Placing: gold</button><button id="nnTrain">Train ▶</button><button id="nnClear">Clear</button><span id="nnStat" aria-live="polite"></span></div></div>`);
(function(){const el=$('#toy-neuron');if(!el)return;const c=el.querySelector('canvas'),x=c.getContext('2d');let pts=[[.2,.3,1],[.3,.2,1],[.25,.55,1],[.7,.7,0],[.8,.5,0],[.65,.85,0]],w=[Math.random()-.5,Math.random()-.5,0],cls=1,run=null,ep=0;
 function draw(){const W=c.width,H=c.height;x.clearRect(0,0,W,H);x.fillStyle='#061230';x.fillRect(0,0,W,H);
  for(let i=0;i<W;i+=8)for(let j=0;j<H;j+=8){const s=w[0]*(i/W)+w[1]*(j/H)+w[2];x.fillStyle=s>0?'rgba(255,217,154,.08)':'rgba(126,200,232,.08)';x.fillRect(i,j,8,8)}
  if(Math.abs(w[1])>1e-6){x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(0,-w[2]/w[1]*H);x.lineTo(W,-(w[0]+w[2])/w[1]*H);x.stroke()}
  pts.forEach(([px,py,l])=>{x.fillStyle=l?'#ffd99a':'#7ec8e8';x.beginPath();x.arc(px*W,py*H,7,0,7);x.fill();x.strokeStyle='#000';x.stroke()})}
 function train(){let err=0;pts.forEach(([px,py,l])=>{const y=(w[0]*px+w[1]*py+w[2])>0?1:0;const e=l-y;if(e){err++;w[0]+=.2*e*px;w[1]+=.2*e*py;w[2]+=.2*e}});ep++;
  el.querySelector('#nnStat').textContent=`epoch ${ep} · mistakes ${err}`;draw();if(err===0||ep>200){clearInterval(run);run=null;el.querySelector('#nnStat').textContent+=err?' · not separable by one line, which is exactly the limit Minsky and Papert pointed out':' · learned it! ✓'}}
 c.onclick=e=>{const r=c.getBoundingClientRect();pts.push([(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height,e.shiftKey?1-cls:cls]);draw()};
 el.querySelector('#nnClass').onclick=e=>{cls=1-cls;e.target.textContent='Placing: '+(cls?'gold':'blue')};
 el.querySelector('#nnTrain').onclick=()=>{if(run)return;ep=0;run=setInterval(train,120)};
 el.querySelector('#nnClear').onclick=()=>{pts=[];w=[Math.random()-.5,Math.random()-.5,0];ep=0;draw()};draw()})();
/* ---------- Toy 4: collapse a qubit ---------- */
after('quantum',`<div class="card toy" id="toy-qubit"><span class="bn">PLAY</span><h3 class="big">Collapse a qubit</h3>
<p>Tilt the arrow, then measure. Each measurement gives a plain 0 or 1. Only over many runs do you see the probabilities set by the angle.</p>
<div class="qrow"><canvas width="240" height="240" aria-label="Bloch sphere"></canvas><div class="qside">
<label for="qth">Tilt θ: <b id="qthv">60°</b></label><input id="qth" type="range" min="0" max="180" value="60">
<p>P(0) = cos²(θ/2) = <b id="qp0"></b></p><div class="row"><button id="q1">Measure once</button><button id="q100">Measure ×100</button></div>
<div class="hist"><div><i id="h0"></i><span>0: <b id="n0">0</b></span></div><div><i id="h1"></i><span>1: <b id="n1">0</b></span></div></div><p id="qlast" aria-live="polite"></p></div></div></div>`);
(function(){const el=$('#toy-qubit');if(!el)return;const c=el.querySelector('canvas'),x=c.getContext('2d');let th=60,n=[0,0],snap=null;
 function draw(){const W=240,cx=120,cy=120,R=90;x.clearRect(0,0,W,W);x.strokeStyle='rgba(95,240,224,.5)';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,R,0,7);x.stroke();x.beginPath();x.ellipse(cx,cy,R,R*.28,0,0,7);x.stroke();
  x.fillStyle='#cfefff';x.font='14px Plex Mono, monospace';x.textAlign='center';x.fillText('|0⟩',cx,cy-R-8);x.fillText('|1⟩',cx,cy+R+18);
  const a=(snap===null?th:snap*180)*Math.PI/180;const ex=cx+R*Math.sin(a),ey=cy-R*Math.cos(a);x.strokeStyle=snap===null?'#ffd99a':'#5ff0e0';x.lineWidth=4;x.beginPath();x.moveTo(cx,cy);x.lineTo(ex,ey);x.stroke();x.fillStyle=x.strokeStyle;x.beginPath();x.arc(ex,ey,6,0,7);x.fill()}
 function up(){const p0=Math.cos(th*Math.PI/360)**2;el.querySelector('#qthv').textContent=th+'°';el.querySelector('#qp0').textContent=(p0*100).toFixed(0)+'%';const t=n[0]+n[1]||1;
  el.querySelector('#h0').style.width=(n[0]/t*100)+'%';el.querySelector('#h1').style.width=(n[1]/t*100)+'%';el.querySelector('#n0').textContent=n[0];el.querySelector('#n1').textContent=n[1];draw()}
 function meas(k){const p0=Math.cos(th*Math.PI/360)**2;let last;for(let i=0;i<k;i++){last=Math.random()<p0?0:1;n[last]++}snap=last;el.querySelector('#qlast').textContent=`Last result: ${last}. The arrow snapped to |${last}⟩.`;up();setTimeout(()=>{snap=null;draw()},700)}
 el.querySelector('#qth').oninput=e=>{th=+e.target.value;n=[0,0];el.querySelector('#qlast').textContent='';up()};el.querySelector('#q1').onclick=()=>meas(1);el.querySelector('#q100').onclick=()=>meas(100);up()})();
/* ---------- Trivia ---------- */
const KEY='hsltt-trivia-v1';const S=Object.assign({score:0,done:[],right:0,wrong:0,paused:false},JSON.parse(localStorage.getItem(KEY)||'{}'));const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const lvl=()=>{let L=LEVELS[0];LEVELS.forEach(l=>{if(S.score>=l[0])L=l});return L};const nextL=()=>LEVELS.find(l=>l[0]>S.score);
document.getElementById('hud').querySelector('nav').insertAdjacentHTML('afterbegin',`<button id="qBtn" aria-haspopup="dialog" title="Trivia score">★ <span id="qLvl"></span></button>`);
document.body.insertAdjacentHTML('beforeend',`<div id="quiz" role="dialog" aria-label="Trivia question" hidden></div><div id="qpanel" role="dialog" aria-label="Trivia progress" hidden></div>`);
const qb=$('#qBtn'),quiz=$('#quiz'),qp=$('#qpanel');
function hud(){const L=lvl();$('#qLvl').textContent=`${L[1]} · ${S.score}`}hud();
function panel(){const L=lvl(),N=nextL();qp.innerHTML=`<button class="x" aria-label="Close">✕</button><h3>${L[1]}</h3><p>${L[2]}</p>
 <div class="lv">${LEVELS.map(l=>`<span class="${S.score>=l[0]?'on':''}">${l[1]}<small>${l[0]}+</small></span>`).join('')}</div>
 <p>${S.score} points · ${S.right} right · ${S.wrong} missed · ${S.done.length}/${TRIVIA.length} seen${N?` · ${N[0]-S.score} to ${N[1]}`:''}</p>
 <div class="row"><button id="qNow">Ask me one now</button><button id="qPause">${S.paused?'Resume pop-ups':'Pause pop-ups'}</button><button id="qReset">Reset</button></div>`;
 qp.hidden=false;qp.querySelector('.x').onclick=()=>qp.hidden=true;qp.querySelector('#qPause').onclick=()=>{S.paused=!S.paused;save();panel()};
 qp.querySelector('#qReset').onclick=()=>{Object.assign(S,{score:0,done:[],right:0,wrong:0});save();hud();panel()};qp.querySelector('#qNow').onclick=()=>{qp.hidden=true;ask(curEra(),true)}}
qb.onclick=()=>qp.hidden?panel():qp.hidden=true;
addEventListener('keydown',e=>{if(e.key==='Escape'){qp.hidden=true;if(!quiz.hidden)close()}});
const order=['origins','engines','theory','codebreakers','electronic','transistor','dive','software','personal','network','ai1','ai2','ai3','quantum','finale'];
function curEra(){let best='origins';document.querySelectorAll('.era,#dive,#finale').forEach(s=>{if(s.getBoundingClientRect().top<innerHeight*.5)best=s.id});return best}
function pick(era,force){const seen=new Set(S.done);const tier=S.score<25?1:S.score<70?2:3;const idx=order.indexOf(era);
 const pool=TRIVIA.map((q,i)=>[q,i]).filter(([q,i])=>!seen.has(i)&&order.indexOf(q[0])<=idx).sort((a,b)=>(Math.abs(a[0][1]-tier)-Math.abs(b[0][1]-tier))||((a[0][0]===era?0:1)-(b[0][0]===era?0:1)));
 return pool.length?pool[0]:(force?[TRIVIA[Math.floor(Math.random()*TRIVIA.length)],-1]:null)}
let timer=null;
function close(){quiz.classList.remove('show');setTimeout(()=>quiz.hidden=true,300)}
function ask(era,force){quiz.classList.remove('pill');const p=pick(era,force);if(!p)return;const [q,i]=p;const opts=q[3].map((t,k)=>[t,k]).sort(()=>Math.random()-.5);const pts=q[1]*5;
 quiz.innerHTML=`<button class="x" aria-label="Dismiss question">✕</button><span class="qmeta">${'★'.repeat(q[1])}${'☆'.repeat(3-q[1])} · ${pts} pts</span><p class="qq">${q[2]}</p><div class="qo">${opts.map(([t,k])=>`<button data-k="${k}">${t}</button>`).join('')}</div><p class="qf" aria-live="polite"></p>`;
 quiz.insertAdjacentHTML('afterbegin',`<button class="pilltxt" aria-label="Open trivia question">★ Quick question? +${pts}</button>`);if(!force){quiz.classList.add('pill');quiz.querySelector('.pilltxt').onclick=()=>quiz.classList.remove('pill');clearTimeout(timer);timer=setTimeout(()=>{if(quiz.classList.contains('pill'))close()},25000)}
 quiz.hidden=false;requestAnimationFrame(()=>quiz.classList.add('show'));quiz.querySelector('.x').onclick=()=>{if(i>=0){S.done.push(i);save()}close()};
 quiz.querySelectorAll('.qo button').forEach(b=>b.onclick=()=>{const ok=+b.dataset.k===q[4];quiz.querySelectorAll('.qo button').forEach(x=>{x.disabled=true;if(+x.dataset.k===q[4])x.classList.add('right')});if(!ok)b.classList.add('wrong');
  const before=lvl()[1];if(i>=0&&!S.done.includes(i)){S.done.push(i);if(ok){S.score+=pts;S.right++}else S.wrong++;save()}hud();const after=lvl()[1];
  quiz.querySelector('.qf').innerHTML=(ok?'<b>Nice!</b> ':'<b>Not quite.</b> ')+q[5]+(after!==before?` <br><b class="lvup">Level up: ${after}!</b>`:'');clearTimeout(timer);timer=setTimeout(close,7000)})}
// pop-up rhythm: after 8 s settled in an era you haven't been quizzed on, at most every 90 s
let lastAsk=performance.now()-60000,eraSince=performance.now(),lastEra='',quizzed=new Set();
setInterval(()=>{if(S.paused||!quiz.hidden||!qp.hidden||!$('#glossary').hidden||!$('#toc').hidden)return;const e=curEra();if(e!==lastEra){lastEra=e;eraSince=performance.now()}
 if(scrollY<innerHeight||e==='dive'||quizzed.has(e))return;if(performance.now()-eraSince>8000&&performance.now()-lastAsk>90000){lastAsk=performance.now();quizzed.add(e);ask(e)}},1000);
window.__ask=ask;
})();
