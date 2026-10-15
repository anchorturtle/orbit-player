(function(){
const $=s=>document.querySelector(s);
const RM=matchMedia('(prefers-reduced-motion: reduce)');
let still=RM.matches;
const G=window.GLOSSARY;const gkeys=Object.keys(G);
const findKey=k=>gkeys.find(g=>g.toLowerCase()===k.toLowerCase());
function linkify(s){return s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,shown)=>{const key=findKey(k)||k;return `<button class="term" data-term="${key}" aria-describedby="tip">${shown||k}</button>`})}
// build eras
const host=$('#eras');const diagCanvases=[];
ERAS.forEach((e,idx)=>{
 if(e.special==='dive'){host.insertAdjacentHTML('beforeend',`
 <section class="dive" id="dive" data-hue="200" data-label="∞ · The dive">
  <div class="stage"><canvas aria-label="Animated zoom from a laptop down to a single atom"></canvas>
   <div class="head"><p class="years">Interlude · all the way down</p><h2>Zoom into a computer</h2></div>
   <div class="label" aria-live="polite"><div class="sc"></div><div class="nm"></div><div class="nt"></div></div>
   <div class="scalebar">${DIVE.map((d,i)=>`<span data-i="${i}">${d.scale}</span>`).join('')}</div>
  </div></section>
 <section class="physics" data-hue="180" data-label="∞ · Atomic limits"><div class="card reveal"><h2>Why you can't shrink forever</h2><p>${linkify(DIVE_PHYSICS)}</p></div></section>`);return}
 host.insertAdjacentHTML('beforeend',`<section class="era" id="${e.id}" data-hue="${e.hue}" data-label="${e.n} · ${e.title}">
 <div class="copy"><div class="num" aria-hidden="true">${e.n}</div><p class="years reveal">${e.years}</p><h2 class="reveal">${e.title}</h2>
 ${(()=>{const B=(window.BEATS||{})[e.id];if(!B)return `<div class="card">${e.text.map((p,i)=>`<p class="reveal" style="--i:${i}">${linkify(p)}</p>`).join('')}</div>`;
 return `<p class="hook reveal">${B.hook}</p>`+B.beats.map((b,i)=>`<div class="beat card reveal" style="--i:0"><span class="bn">${String(i+1).padStart(2,'0')}</span><h3 class="big">${b[0]}</h3><p>${linkify(b[1])}</p></div>`).join('')+
 `<blockquote class="pull reveal"><p>${B.quote[0]}</p>${B.quote[1]?`<cite>${B.quote[1]}</cite>`:''}</blockquote>`+
 `<details class="card deeper reveal"><summary>Dig deeper: the full story</summary>${e.text.map(p=>`<p>${linkify(p)}</p>`).join('')}</details>`+
 `<p class="nexthook reveal">${B.next} <span aria-hidden="true">↓</span></p>`})()}</div>
 <aside class="side reveal" aria-label="Knowledge: ${e.know.h}"><canvas data-d="${e.diagram}" role="img" aria-label="Animated diagram: ${e.know.h}"></canvas><h3>${e.know.h}</h3><p>${e.know.p}</p></aside></section>`);
});
(function(){const tr=document.getElementById('transistor');if(!tr)return;const mx=Math.log10(2.1e11);
tr.insertAdjacentHTML('afterend',`<section class="switches" data-hue="195" data-label="VI · How many switches?"><div class="card reveal"><h2>How many switches?</h2><p>Each bar is drawn on a <b>log scale</b>, where every step right is 10× more. A straight climb on this chart is Moore's law in action.</p>
<ol class="sw">${SWITCHES.map(([n,y,c])=>`<li style="--w:${(Math.log10(c)/mx*100).toFixed(1)}%"><span>${y} · ${n}</span><i></i><b>${c>=1e9?(c/1e9).toFixed(c>=1e10?0:1)+' billion':c>=1e6?(c/1e6).toFixed(1)+' million':c.toLocaleString()}</b></li>`).join('')}</ol>
<p class="fine">Counts are public manufacturer figures, rounded.</p></div></section>`)})();
const FACE={origins:'serif',engines:'serif',theory:'mono',codebreakers:'mono',electronic:'term',transistor:'mono',software:'term',personal:'grot',network:'grot',ai1:'disp',ai2:'disp',ai3:'disp',quantum:'quantum'};
Object.entries(FACE).forEach(([id,f])=>{const el=document.getElementById(id);if(el)el.dataset.face=f});
document.querySelectorAll('.switches').forEach(e=>e.dataset.face='mono');
Object.entries(window.DEEP||{}).forEach(([id,d])=>{const c=document.querySelector('#'+id+' .copy .deeper')||document.querySelector('#'+id+' .copy .card');if(c)c.insertAdjacentHTML('beforeend',`<div class="knowmore reveal"><b>↻ Recursion check</b>${linkify(d)}</div>`)});
const F=FINALE;$('#finale').dataset.hue=45;$('#finale').dataset.label='∞ · Toward superintelligence';
const FB=[
 ["Two words you'll hear a lot: AGI and ASI.","[[AGI|Artificial general intelligence]]: AI that can do most thinking work about as well as a skilled person. [[ASI|Artificial superintelligence]]: AI far beyond the best humans at nearly everything."],
 ["Neither exists today.","And there's no agreed test that would tell us when either has arrived."],
 ["Why many think it's coming.","Capabilities keep rising with scale, compute keeps growing, and AI is starting to help do AI research, a possible recursive loop."],
 ["Why others doubt the timeline.","Data may run short, the energy and cost are enormous, models still make confident mistakes, and benchmarks aren't the real world."],
 ["Where quantum fits, probably.","Not as the engine of AI. More likely for simulating molecules and materials, and for reshaping encryption."]];
$('#finale').innerHTML=`<p class="years reveal">Now → ?</p><h2 class="reveal">${F.title}</h2><p class="hook reveal">So… where does the loop go next?</p>
${FB.map((b,i)=>`<div class="beat card reveal fbeat"><span class="bn">${String(i+1).padStart(2,'0')}</span><h3 class="big">${b[0]}</h3><p>${linkify(b[1])}</p></div>`).join('')}
<div class="beat card reveal fbeat wide"><span class="bn">06</span><h3 class="big">Where are we on the dial?</h3><div class="agiscale"><span>narrow AI</span><span>today (roughly)</span><span>AGI</span><span>ASI</span></div><div class="agibar" role="img" aria-label="Rough, contested spectrum from narrow AI to ASI; today sits somewhere short of AGI"><i></i></div><p style="font-size:.85em;color:var(--dim);margin-top:.6rem">Illustrative only. Where 'today' sits is itself hotly debated.</p></div>
<blockquote class="pull reveal"><p>The question isn't only “can we build it?” It's also “what do we want it for?”</p></blockquote>
<p class="hook reveal">Five open questions, honestly:</p>
<div class="qgrid">${F.qs.map((q,i)=>{const [h,...r]=q.split(':');return `<div class="card reveal qcard"><span class="bn">Q${i+1}</span><h3>${linkify(h.replace('Alignment','[[alignment|Alignment]]'))}</h3><p>${r.join(':')}</p></div>`}).join('')}</div>
<p class="close reveal">${linkify(F.close.replace('recursion','[[recursion]]'))}</p>`;
document.querySelectorAll('.era h2, .finale h2').forEach(h=>{let c=0;h.innerHTML=h.textContent.split(' ').map(w=>`<span style="white-space:nowrap">${[...w].map(ch=>`<span class="ch" style="--c:${c++};--r:${(Math.sin(c*12.9)*.8).toFixed(2)};--r2:${(Math.cos(c*7.3)*.6).toFixed(2)}">${ch}</span>`).join('')}</span>`).join(' ');h.classList.add('kin');h.setAttribute('aria-label',h.textContent)});
document.querySelectorAll('.side canvas').forEach(c=>diagCanvases.push(c));
// reveal
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)x.target.classList.add('in')}),{threshold:.15});
const io3=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)x.target.classList.add('drawn')}),{threshold:.2});document.querySelectorAll('.era .copy .card').forEach(el=>io3.observe(el));
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const vis=new Set();const io2=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting?vis.add(x.target):vis.delete(x.target)));diagCanvases.forEach(c=>io2.observe(c));
// glossary
const list=$('#glossList');
list.innerHTML=gkeys.sort((a,b)=>a.localeCompare(b)).map(k=>`<dt id="g-${k.replace(/\W+/g,'-')}">${k}</dt><dd>${linkify(G[k])}</dd>`).join('');
const panel=$('#glossary'),btn=$('#glossBtn');
function openG(term){panel.hidden=false;btn.setAttribute('aria-expanded','true');if(term){$('#glossSearch').value='';filter('');const dt=document.getElementById('g-'+term.replace(/\W+/g,'-'));if(dt){dt.scrollIntoView({block:'center'});dt.classList.add('hit');setTimeout(()=>dt.classList.remove('hit'),1500)}}else $('#glossSearch').focus()}
function closeG(){panel.hidden=true;btn.setAttribute('aria-expanded','false');btn.focus()}
btn.onclick=()=>panel.hidden?openG():closeG();$('#glossClose').onclick=closeG;
addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)closeG()});
function filter(q){q=q.toLowerCase();list.querySelectorAll('dt').forEach(dt=>{const dd=dt.nextElementSibling;const m=!q||dt.textContent.toLowerCase().includes(q)||dd.textContent.toLowerCase().includes(q);dt.hidden=dd.hidden=!m})}
$('#glossSearch').oninput=e=>filter(e.target.value);
// tooltips
const tip=$('#tip');
function showTip(el){const k=el.dataset.term;if(!G[k])return;tip.innerHTML=`<b>${k}</b>${G[k].replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,a,b)=>b||a)}`;tip.hidden=false;const r=el.getBoundingClientRect();let x=Math.min(innerWidth-310,Math.max(8,r.left));let y=r.bottom+8;tip.style.left=x+'px';tip.style.top=y+'px';if(y+tip.offsetHeight>innerHeight)tip.style.top=(r.top-tip.offsetHeight-8)+'px'}
document.addEventListener('mouseover',e=>{const t=e.target.closest('.term');if(t)showTip(t)});
document.addEventListener('mouseout',e=>{if(e.target.closest('.term'))tip.hidden=true});
document.addEventListener('focusin',e=>{const t=e.target.closest('.term');if(t)showTip(t)});
document.addEventListener('focusout',()=>tip.hidden=true);
document.addEventListener('click',e=>{const t=e.target.closest('.term');if(!t)return;if(matchMedia('(hover:none)').matches&&tip.hidden){showTip(t);return}openG(t.dataset.term)});
// motion toggle
const mb=$('#motionBtn');function setStill(v){still=v;document.body.classList.toggle('still',v);mb.textContent='Motion: '+(v?'off':'on');mb.setAttribute('aria-pressed',v)}setStill(still);mb.onclick=()=>setStill(!still);
// WebGL fractal
const cv=$('#fractal');const gl=cv.getContext('webgl',{antialias:false,powerPreference:'high-performance'});
const TARGETS=[[-0.743643887,0.131825904],[-0.10109636,0.95628651],[-1.749721929,0.000000],[0.360240443,-0.641313061],[-0.7746806106,0.1374168856],[-1.25066,0.02012],[-0.235125,0.827215],[0.2549870,0.0005]];
let prog=null,U={};
// v4: deep Mandelbrot via perturbation theory. A reference orbit is computed in JS doubles at a fixed
// boundary point, and each pixel iterates only its tiny float32 offset (dz) from that orbit, rebasing when needed.
const MAXIT=3200,DEPTH=13.2; // log10 zoom range across the whole page
const CX=-0.743643887037158704752191506114774,CY=0.131825904205311970493132056385139; // Seahorse valley deep point
let orbitOK=false;
if(gl){const ext=gl.getExtension('OES_texture_float');
const vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
const fs=`precision highp float;uniform vec2 R;uniform float D,H,T,F,A,P,K,N,MI,B,SS;uniform sampler2D O;
// Ordered (Bayer 8x8) dithering + grain: technique adapted from Paper Shaders 'dithering' (Apache-2.0), see vendor/paper-shaders/
float bayer2(vec2 a){a=floor(a);return fract(dot(a,vec2(.5,a.y*.75)));}
float bayer8(vec2 a){return (bayer2(.25*a)*.25+bayer2(.5*a))*.25+bayer2(a);}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
vec2 orb(float i){return texture2D(O,vec2((mod(i,256.)+.5)/256.,(floor(i/256.)+.5)/8.)).xy;}
vec3 pal(float t){float h=H/360.;return .5+.5*cos(6.2831*(t+vec3(h,h+.1,h+.22)));}
vec3 mandel(vec2 uv){
 float scale=2.8*pow(10.,-D);vec2 dc=uv*scale;vec2 dz=vec2(0.);float m=0.;float it=0.;vec2 z=vec2(0.);vec2 dr=vec2(0.);bool esc=false;
 for(int i=0;i<${MAXIT};i++){if(float(i)>=MI)break;
  // derivative (scaled by view size to stay in float range): dr' = 2 z dr' + scale
  dr=2.*vec2(z.x*dr.x-z.y*dr.y,z.x*dr.y+z.y*dr.x)+vec2(scale,0.);
  vec2 Z=orb(m);dz=vec2(2.*(Z.x*dz.x-Z.y*dz.y)+dz.x*dz.x-dz.y*dz.y,2.*(Z.x*dz.y+Z.y*dz.x)+2.*dz.x*dz.y)+dc;m+=1.;
  z=orb(m)+dz;float z2=dot(z,z);if(z2>1e6){esc=true;break;}
  if(z2<dot(dz,dz)||m>=N-1.){dz=z;m=0.;} it+=1.;}
 if(!esc)return vec3(.03,.06,.16);
 float sm=it+1.-log2(log2(dot(z,z))*.5);float t=log(1.+max(sm-B,0.)*.08)*.55+D*.04;
 vec3 c=pal(t);float glow=.6+.4*cos(sm*.09);vec3 col=mix(vec3(.03,.07,.18),c,.9)*glow;
 // distance estimate in screen pixels -> clean anti-aliased filaments instead of speckle
 float lz=length(z);float de=lz*log(lz)*R.y/max(length(dr),1e-30)*.5;
 float edge=smoothstep(.0,1.,de);vec3 fil=mix(vec3(.85,.93,1.),pal(t+.3),.35);
 return mix(mix(col,fil,.55),col,edge);}
void main(){float a=A;mat2 rot=mat2(cos(a),-sin(a),sin(a),cos(a));vec3 col=vec3(0.);
 for(int sy=0;sy<2;sy++)for(int sx=0;sx<2;sx++){if(float(sy)>=SS||float(sx)>=SS)continue;
  vec2 off=SS>1.5?(vec2(float(sx),float(sy))-.5)*.5:vec2(0.);col+=mandel(rot*((gl_FragCoord.xy+off-.5*R)/R.y));}
 col/=SS*SS;
 vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;float d=length(uv);col*=1.-.22*d;
 float lum=dot(col,vec3(.299,.587,.114));col=mix(vec3(lum),col,.95);
 float ring=exp(-pow((d-(1.25-P))*7.,2.))*P*1.3;col+=vec3(1.,.82,.48)*ring*.25;
 float mk=K<.5?0.:(K<1.5?smoothstep(.2,-.35,uv.x):smoothstep(.55,.0,length(uv*vec2(.8,1.2))));col*=1.-.4*mk;
 col+=(hash(gl_FragCoord.xy)-.5)*.004; // imperceptible anti-banding noise only
 gl_FragColor=vec4(max(col,0.)*F,1.);}`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.warn(gl.getShaderInfoLog(o));return o}
prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);gl.useProgram(prog);
const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const l=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);
['R','D','H','T','F','A','P','K','N','MI','O','B','SS'].forEach(k=>U[k]=gl.getUniformLocation(prog,k));
// reference orbit (JS doubles), stored in a 256x8 float texture
const W=256,HH=8,buf=new Float32Array(W*HH*4);let x=0,y=0,n=0;
for(;n<W*HH;n++){buf[n*4]=x;buf[n*4+1]=y;const xx=x*x-y*y+CX;y=2*x*y+CY;x=xx;if(x*x+y*y>1e4){n++;break}}
const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
if(ext){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,HH,0,gl.RGBA,gl.FLOAT,buf);orbitOK=true}
gl.uniform1i(U.O,0);
// sample the view in JS doubles to pick iteration budget (MI) and color base (B) for this depth
window.iterStats=function(D){const sc=2.8*Math.pow(10,-D);const its=[];for(let i=-4;i<=4;i++)for(let j=-3;j<=3;j++){const cx=CX+i*.2*sc,cy=CY+j*.2*sc;let x=0,y=0,k=0;for(;k<6000;k++){const xx=x*x-y*y+cx;y=2*x*y+cy;x=xx;if(x*x+y*y>1e4)break}if(k<6000)its.push(k)}
 its.sort((a,b)=>a-b);if(!its.length)return[Math.min(MAXIT,400+220*D),0];return[Math.min(MAXIT,its[Math.floor(its.length*.95)]*1.35+150),its[0]*.97]};gl.uniform1f(U.N,n);window.__orbitLen=n;}
let Q=Math.min(devicePixelRatio||1,2),LOWQ=Q,IQ=1,DPR=1;function setRes(q){DPR=q;cv.width=innerWidth*q;cv.height=innerHeight*q;if(gl)gl.viewport(0,0,cv.width,cv.height)}function resize(){frame.dirty=true;frame.sharp=false;DPR=Q;cv.width=innerWidth*DPR;cv.height=innerHeight*DPR;if(gl)gl.viewport(0,0,cv.width,cv.height)}addEventListener('resize',resize);resize();
// dive canvas
const dive=$('#dive'),dc=dive.querySelector('canvas'),dctx=dc.getContext('2d');function rsD(){const r=Math.min(devicePixelRatio||1,2);dc.width=innerWidth*r;dc.height=innerHeight*r}rsD();addEventListener('resize',rsD);
const lab=dive.querySelector('.label'),bars=dive.querySelectorAll('.scalebar span');let lastLvl=-1;
const sections=[...document.querySelectorAll('[data-hue]')];
let hue=205,eraIdx=0,t0=performance.now(),sz=0;frame.n=0;
function frame(now){if(document.hidden){requestAnimationFrame(frame);return}const t=(now-t0)/1000;const st=scrollY,max=document.documentElement.scrollHeight-innerHeight;$('#progress i').style.width=(st/max*100)+'%';
 // current section
 let cur=sections[0],loc=0;for(const s of sections){const r=s.getBoundingClientRect();if(r.top<innerHeight*.5){cur=s;loc=Math.min(1,Math.max(0,(innerHeight*.5-r.top)/r.height))}}
 const i=sections.indexOf(cur);eraIdx=i;const lbl=st<innerHeight*.6?'0 · Start ▾':(cur.dataset.label||'')+' ▾';if(lbl!==frame.lbl){frame.lbl=lbl;$('#eraLabel').textContent=lbl}
 hue+=((+cur.dataset.hue)-hue)*.06;if(Math.abs((+cur.dataset.hue)-hue)<.6)hue=+cur.dataset.hue;
 const kk=1-Math.exp(-Math.min(200,now-(frame.pl||now))/110);frame.pl=now;sz+=(st/innerHeight-sz)*(still?1:kk);if(Math.abs(st/innerHeight-sz)<.002)sz=st/innerHeight;
 if(gl){const fade=cur.id==='dive'?.25:1;gl.uniform1f(U.K,st<innerHeight*.8?1:cur.classList.contains('era')?(innerWidth<800?2:1):2);const port=Math.max(0,1-Math.min(loc,1-loc)*7);const pz=still?0:Math.sin(Math.PI*Math.min(1,port))*.0;
  const mxs=Math.max(1,document.documentElement.scrollHeight-innerHeight);const D=Math.min(DEPTH,Math.max(0,sz*innerHeight/mxs*DEPTH));window.__depth=D;
  const Kv=st<innerHeight*.8?1:cur.classList.contains('era')?(innerWidth<800?2:1):2;const Pv=still?0:port;
  const key=[D.toFixed(4),Math.round(hue),Kv,Pv.toFixed(2),fade].join();const moving=key!==frame.key;
  if(moving){frame.key=key;frame.lastMove=now;frame.sharp=false;if(!frame.low){frame.low=true;if(LOWQ!==Q)setRes(LOWQ)}}
  const sharpNow=!moving&&!frame.sharp&&now-frame.lastMove>200;
  if(moving||sharpNow||frame.dirty){
   if(sharpNow){frame.low=false;frame.sharp=true;if(cv.width!==Math.round(innerWidth*Q))setRes(Q)}frame.dirty=false;gl.uniform1f(U.SS,sharpNow||frame.sharp?2:1);
   if(Math.abs(D-(frame.sD??-9))>.04){frame.sD=D;[frame.MI,frame.B]=iterStats(D)}
   gl.uniform2f(U.R,cv.width,cv.height);gl.uniform1f(U.D,D);gl.uniform1f(U.MI,frame.MI);gl.uniform1f(U.B,frame.B);gl.uniform1f(U.K,Kv);gl.uniform1f(U.H,hue);gl.uniform1f(U.T,0);gl.uniform1f(U.F,fade);gl.uniform1f(U.A,D*.35);window.__draws=(window.__draws||0)+1;window.__key=key;gl.uniform1f(U.P,Pv);gl.drawArrays(gl.TRIANGLES,0,3)}}
 // adaptive quality
 const dt=now-(frame.last||now);frame.last=now;frame.avg=(frame.avg||16)*.95+dt*.05;if(++frame.n>90){frame.n=0;if(frame.low){if(frame.avg>24&&LOWQ>.75)LOWQ=Math.max(.75,LOWQ-.1);else if(frame.avg<15&&LOWQ<Q)LOWQ=Math.min(Q,LOWQ+.05)}}
 // scroll-scrubbed headings
 if(!still&&cur.classList.contains('era')){cur.style.setProperty('--p',loc.toFixed(3));cur.style.setProperty('--q',(Math.sin(t*3)*Math.max(0,1-loc*2)).toFixed(2));cur.style.setProperty('--wv',(.5+.5*Math.sin(loc*6.28)).toFixed(2))}
 // dive
 const dr=dive.getBoundingClientRect();if(dr.top<innerHeight&&dr.bottom>0){const p=Math.min(8,Math.max(0,-dr.top/(dr.height-innerHeight)*8.4));drawDive(dctx,dc.width,dc.height,p,still?0:t);
  const L=Math.min(8,Math.round(p-.15));if(L!==lastLvl){lastLvl=L;const d=DIVE[L];lab.querySelector('.sc').textContent=d.scale;lab.querySelector('.nm').textContent=d.name;lab.querySelector('.nt').textContent=d.note;bars.forEach(b=>b.classList.toggle('on',+b.dataset.i===L))}}
 if(window.drawMotifs&&(cur.id!==frame.mid||!still||frame.mloc!==loc.toFixed(3))){frame.mid=cur.id;frame.mloc=loc.toFixed(3);drawMotifs(st<innerHeight*.6?'':cur.id,loc,t,still)}
 // diagrams
 vis.forEach(c=>{const r=c.getBoundingClientRect();const k=Math.min(2,devicePixelRatio||1);if(c.width!==Math.round(r.width*k)){c.width=r.width*k;c.height=r.height*k}const x=c.getContext('2d');x.setTransform(k,0,0,k,0,0);x.clearRect(0,0,r.width,r.height);DIAGRAMS[c.dataset.d](x,r.width,r.height,still?2.5:t)});
 // parallax numbers
 if(!still)document.querySelectorAll('.era .num').forEach(n=>{const r=n.parentElement.getBoundingClientRect();n.style.transform=`translate(-4%,${-70+r.top*.08}%) scale(${1+Math.max(0,-r.top)/3000})`});
 requestAnimationFrame(frame)}
requestAnimationFrame(frame);
// v5: home + table of contents
const smooth=el=>{const y=el?el.getBoundingClientRect().top+scrollY:0;const de=document.documentElement;const y0=scrollY;const dist=y-y0;
 if(still||Math.abs(dist)<2){de.style.scrollBehavior='auto';scrollTo(0,y);de.style.scrollBehavior='';return}
 const dur=Math.min(1600,500+Math.abs(dist)*.012),t0=performance.now();de.style.scrollBehavior='auto';
 (function step(now){const k=Math.min(1,(now-t0)/dur);const e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;scrollTo(0,y0+dist*e);if(k<1)requestAnimationFrame(step);else de.style.scrollBehavior=''})(t0)};
$('#homeBtn').onclick=()=>smooth(null);
const toc=$('#toc'),tl=$('#tocList');
const entries=[{id:'top',n:'0',t:'How sand learned to think',y:'Start'}];
sections.forEach(s=>{if(!s.id&&!s.dataset.label)return;const e=ERAS.find(x=>x.id===s.id&&!x.special);if(!s.id)s.id='sec-'+entries.length;const [n,...rest]=(s.dataset.label||'').split(' · ');entries.push({id:s.id,n:e?e.n:n,t:e?e.title:rest.join(' · '),y:e?e.years:''})});
entries.push({id:'glossary',n:'A–Z',t:'Glossary',y:Object.keys(G).length+' terms'});
tl.innerHTML=entries.map(e=>`<li><a href="#${e.id}" data-id="${e.id}"><span class="tn">${e.n}</span><span class="tt">${e.t}</span><span class="ty">${e.y}</span></a></li>`).join('');
function openToc(){toc.hidden=false;const curId=(sections[eraIdx]&&scrollY>innerHeight*.6)?sections[eraIdx].id:'top';tl.querySelectorAll('a').forEach(a=>a.classList.toggle('cur',a.dataset.id===curId));const c=tl.querySelector('.cur')||tl.querySelector('a');c.scrollIntoView({block:'center'});c.focus({preventScroll:true});$('#eraLabel').setAttribute('aria-expanded','true')}
function closeToc(){toc.hidden=true;$('#eraLabel').setAttribute('aria-expanded','false')}
$('#eraLabel').onclick=()=>toc.hidden?openToc():closeToc();$('#tocClose').onclick=closeToc;
toc.addEventListener('click',e=>{if(e.target===toc)closeToc()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!toc.hidden){closeToc();$('#eraLabel').focus()}});
tl.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();closeToc();if(a.dataset.id==='glossary'){openG();return}smooth(a.dataset.id==='top'?null:document.getElementById(a.dataset.id))});
})();
