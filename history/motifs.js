// v5 motif layer (see GRAPHICAL-LANGUAGE.md): gears, circuit L-system traces, neural weight fields
(function(){
const cv=document.createElement('canvas');cv.id='motif';cv.setAttribute('aria-hidden','true');
document.body.insertBefore(cv,document.getElementById('vignette'));
const c=cv.getContext('2d');let W,H,R;
function rs(){R=Math.min(devicePixelRatio||1,1.5)*.6;W=cv.width=innerWidth*R;H=cv.height=innerHeight*R}rs();addEventListener('resize',rs);
const GROUP={origins:'gear',engines:'gear',theory:'gear',codebreakers:'gear',electronic:'circuit',transistor:'circuit',software:'circuit',personal:'circuit',network:'neural',ai1:'neural',ai2:'neural',ai3:'neural'};
function gear(x,y,r,n,a,col){c.save();c.translate(x,y);c.rotate(a);c.strokeStyle=col;c.beginPath();for(let i=0;i<n*2;i++){const ang=i/(n*2)*Math.PI*2,rr=i%2?r:r*1.12;const a2=(i+1)/(n*2)*Math.PI*2;c.lineTo(Math.cos(ang)*rr,Math.sin(ang)*rr);c.lineTo(Math.cos(a2)*rr,Math.sin(a2)*rr)}c.closePath();c.stroke();
 c.beginPath();c.arc(0,0,r*.35,0,7);c.stroke();for(let i=0;i<5;i++){const ang=i/5*6.283;c.beginPath();c.moveTo(Math.cos(ang)*r*.35,Math.sin(ang)*r*.35);c.lineTo(Math.cos(ang)*r*.85,Math.sin(ang)*r*.85);c.stroke()}c.restore()}
function drawGears(p,t){const s=Math.min(W,H);c.lineWidth=1.4*R;
 const train=[[.78,.3,.16,24],[.78+.16*1.08*2/ (W/s)*0+.0,0,0,0]];
 // a meshed train: each next gear touches previous; rotation ratio = -n1/n2
 let x=W*.72,y=H*.28,r=s*.15,n=24,a=p*9+t*.15,list=[];
 const spec=[[24,0],[12,.9],[30,2.1],[16,3.6],[20,5.0]];
 spec.forEach(([nn,dir],i)=>{if(i>0){const pr=list[i-1];const rr=s*.15*nn/24;const d=(pr.r+rr)*1.02;x=pr.x+Math.cos(dir)*d;y=pr.y+Math.sin(dir)*d;a=-pr.a*pr.n/nn+Math.PI/nn;r=rr}list.push({x,y,r,n:nn,a})});
 list.forEach((g,i)=>gear(g.x,g.y,g.r,g.n,g.a,i%2?'rgba(201,160,90,.55)':'rgba(126,200,232,.5)'));
 // card lattice at bottom-right
 c.fillStyle='rgba(201,160,90,.35)';for(let i=0;i<24;i++)for(let j=0;j<6;j++){if(((i*7+j*13+Math.floor(p*30))%5)<2)c.fillRect(W*.55+i*W*.018,H*.82+j*H*.025,W*.008,H*.012)}}
function rnd(k){return Math.abs(Math.sin(k*127.1+311.7)*43758.5453)%1}
function drawCircuit(p,t){c.lineWidth=1.6*R;const grow=Math.min(1,p*1.6+.15);const cx=W*.78,cy=H*.5;
 // L-system-ish recursive branching traces on 45/90 grid
 function br(x,y,ang,len,depth,k){if(depth>6||len<4)return;const L=len*Math.min(1,grow*7-depth);if(L<=0)return;const x2=x+Math.cos(ang)*L,y2=y+Math.sin(ang)*L;
  c.strokeStyle=`rgba(63,181,154,${.6-depth*.07})`;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
  if(depth>2&&rnd(k)<.35){c.fillStyle='rgba(255,217,154,.7)';c.beginPath();c.arc(x2,y2,2.4*R,0,7);c.fill()}
  const turn=Math.PI/4*(rnd(k+1)<.5?1:-1);br(x2,y2,ang+turn,len*.72,depth+1,k*2+1);if(rnd(k+2)<.7)br(x2,y2,ang-turn,len*.68,depth+1,k*2+2)}
 for(let i=0;i<8;i++)br(cx,cy,i*Math.PI/4,Math.min(W,H)*.11,0,i+3);
 c.strokeStyle='rgba(126,200,232,.6)';c.strokeRect(cx-W*.025,cy-W*.025,W*.05,W*.05);
 // signal pulses along a ring
 for(let i=0;i<12;i++){const a=i/12*6.283+t*.4;c.fillStyle='rgba(255,217,154,.8)';c.fillRect(cx+Math.cos(a)*W*.07-1.5*R,cy+Math.sin(a)*W*.07-1.5*R,3*R,3*R)}}
function drawNeural(p,t){const L=[5,8,8,6,4];const x0=W*.58,x1=W*.96;const nodes=L.map((n,li)=>Array.from({length:n},(_,j)=>[x0+(x1-x0)*li/(L.length-1),H*(.15+.7*(j+.5)/n)]));
 c.lineWidth=1*R;for(let li=0;li<L.length-1;li++)nodes[li].forEach((a,i)=>nodes[li+1].forEach((b,j)=>{const w=Math.sin(i*1.3+j*2.1+li+p*8+t*.6);c.strokeStyle=w>0?`rgba(167,125,255,${w*.45})`:`rgba(126,200,232,${-w*.35})`;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke()}));
 nodes.flat().forEach(([x,y],k)=>{c.fillStyle='rgba(207,239,255,.75)';c.beginPath();c.arc(x,y,3*R,0,7);c.fill()});
 // attention arcs over a token row
 const toks=9,ty=H*.93;for(let i=0;i<toks;i++){const xi=W*(.55+.42*i/(toks-1));c.fillStyle='rgba(255,217,154,.7)';c.fillRect(xi-6*R,ty,12*R,3*R)}
 const q=Math.floor(p*toks*2)%toks;for(let i=0;i<toks;i++){if(i===q)continue;const a=W*(.55+.42*q/(toks-1)),b=W*(.55+.42*i/(toks-1));const w=.15+.5*Math.abs(Math.sin(i*3.1+q));c.strokeStyle=`rgba(255,217,154,${w})`;c.lineWidth=w*4*R;c.beginPath();c.moveTo(a,ty);c.quadraticCurveTo((a+b)/2,ty-Math.abs(b-a)*.5,b,ty);c.stroke()}}

function drawRotors(p,t){const cx=W*.8,cy=H*.45,A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';c.textAlign='center';c.textBaseline='middle';
 for(let r=0;r<4;r++){const R0=Math.min(W,H)*(.12+r*.075);const st=Math.floor(p*[52,26,8,2][r]);c.strokeStyle=`rgba(255,217,154,${.45-r*.07})`;c.lineWidth=1.2*R;c.beginPath();c.arc(cx,cy,R0,0,7);c.stroke();
  c.font=`${Math.round(11*R+r*R)}px "Plex Mono",monospace`;for(let k=0;k<26;k++){const an=(k-st)/26*6.283-1.5708+(r%2?.12:0);c.fillStyle=k===0?'rgba(255,217,154,.9)':`rgba(126,200,232,${.5-r*.08})`;c.fillText(A[k],cx+Math.cos(an)*(R0-10*R),cy+Math.sin(an)*(R0-10*R))}}
 const k=Math.floor(p*40)%26;c.strokeStyle='rgba(255,154,74,.75)';c.lineWidth=2*R;c.beginPath();for(let r=0;r<4;r++){const R0=Math.min(W,H)*(.12+r*.075)-10*R;const an=(k*(r+3)%26)/26*6.283-1.5708;r?c.lineTo(cx+Math.cos(an)*R0,cy+Math.sin(an)*R0):c.moveTo(cx+Math.cos(an)*R0,cy+Math.sin(an)*R0)}c.stroke()}
function drawTubes(p,t){const cols=7,rows=4;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x=W*(.6+i*.055),y=H*(.2+j*.18);const fl=.55+.45*Math.sin(t*3+i*1.7+j*2.3)*Math.sin(t*1.3+i);
 const g=c.createRadialGradient(x,y,0,x,y,W*.035);g.addColorStop(0,`rgba(255,180,90,${.55*fl})`);g.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,W*.035,0,7);c.fill();
 c.strokeStyle='rgba(201,160,90,.45)';c.lineWidth=1.2*R;c.beginPath();c.ellipse(x,y,W*.012,H*.05,0,0,7);c.stroke()}
 c.strokeStyle='rgba(126,200,232,.35)';c.lineWidth=2*R;for(let k=0;k<5;k++){const y0=H*(.25+k*.14),x0=W*.58,x1=W*(.75+.2*((k*37)%10)/10);c.beginPath();c.moveTo(x0,y0);c.bezierCurveTo(x0+W*.1,y0+H*.25,x1-W*.1,y0+H*.25,x1,y0+H*.05*Math.sin(p*9+k));c.stroke()}}
function drawTokens(p,t){c.font=`${Math.round(13*R)}px "Plex Mono",monospace`;c.textAlign='left';const words=['LOAD','ADD','STORE','JMP','if','for','return','int','main()','{ }','=>','0x7F','print','while','fn','let'];
 for(let col=0;col<12;col++){const x=W*(.56+col*.036);for(let r=0;r<22;r++){const y=((r*H/18+p*H*2*(1+col%3*.4)+t*20*(1+col%2))%(H*1.2))-H*.1;const ph=(r+col)%3;const w=ph===0?((r*col)%2?'1':'0'):ph===1?words[(r*7+col)%5]:words[5+(r*3+col)%11];
  c.fillStyle=ph===0?'rgba(126,200,232,.35)':ph===1?'rgba(63,181,154,.55)':'rgba(191,240,255,.6)';c.fillText(w,x,y)}}}
function drawWindows(p,t){let x=W*.58,y=H*.12,w=W*.38,h=H*.6;for(let k=0;k<7;k++){c.strokeStyle=`rgba(126,200,232,${.55-k*.06})`;c.lineWidth=1.4*R;c.strokeRect(x,y,w,h);c.fillStyle=`rgba(22,58,116,${.35-k*.04})`;c.fillRect(x,y,w,h*.06);
 c.fillStyle='rgba(255,217,154,.6)';c.beginPath();c.arc(x+w*.03,y+h*.03,2.5*R,0,7);c.fill();const s=.72;const ox=(w*(1-s))*(.5+.4*Math.sin(p*4+k)),oy=h*.08+(h*.92*(1-s))*(.5+.3*Math.cos(p*3+k));x+=ox*.6;y+=oy*.6;w*=s;h*=s}}
function drawPackets(p,t){const N=16,P=[];for(let i=0;i<N;i++){const a=i*2.399,r=.12+.33*Math.sqrt(i/N);P.push([W*.78+Math.cos(a+p*.5)*r*H,H*.48+Math.sin(a+p*.5)*r*H*.95])}
 const E=[];for(let i=1;i<N;i++){E.push([i,Math.floor(i/2)]);if(i%3===0)E.push([i,(i*5)%N])}c.lineWidth=1.2*R;
 E.forEach(([a,b])=>{c.strokeStyle='rgba(126,200,232,.3)';c.beginPath();c.moveTo(...P[a]);c.lineTo(...P[b]);c.stroke()});
 E.forEach(([a,b],k)=>{const s=((t*.4+p*3+k*.13)%1);c.fillStyle=k%4?'rgba(126,200,232,.9)':'rgba(255,217,154,.95)';c.fillRect(P[a][0]+(P[b][0]-P[a][0])*s-2*R,P[a][1]+(P[b][1]-P[a][1])*s-2*R,4*R,4*R)});
 P.forEach(([x,y],i)=>{c.fillStyle=i?'rgba(207,239,255,.8)':'rgba(255,217,154,.9)';c.beginPath();c.arc(x,y,(i?3:6)*R,0,7);c.fill()})}
function drawBlochs(p,t){const n=5,m=4,s=Math.min(W*.4/n,H*.8/m);for(let i=0;i<n;i++)for(let j=0;j<m;j++){const cx=W*.58+s*(i+.5),cy=H*.12+s*(j+.5),r=s*.36;
 c.strokeStyle='rgba(95,240,224,.35)';c.lineWidth=1*R;c.beginPath();c.arc(cx,cy,r,0,7);c.stroke();c.beginPath();c.ellipse(cx,cy,r,r*.3,0,0,7);c.stroke();
 const th=1.57+1.4*Math.sin(p*5+i*.9+j*1.3),ph=t*.8+i+j;c.strokeStyle='rgba(255,217,154,.85)';c.lineWidth=2*R;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+r*Math.sin(th)*Math.cos(ph),cy-r*Math.cos(th)+r*.3*Math.sin(th)*Math.sin(ph));c.stroke()}
 // interference fringes across the field
 for(let k=0;k<30;k++){const x=W*.56+k*W*.015;const a=Math.pow(Math.cos(k*.45-p*6),2);c.fillStyle=`rgba(95,240,224,${a*.18})`;c.fillRect(x,H*.92,W*.01,H*.05)}}
const FN={origins:drawGears,engines:drawGears,theory:drawGears,codebreakers:drawRotors,electronic:drawTubes,transistor:drawCircuit,software:drawTokens,personal:drawWindows,network:drawPackets,ai1:drawNeural,ai2:drawNeural,ai3:drawNeural,quantum:drawBlochs};
const ORDER=['origins','engines','theory','codebreakers','electronic','transistor','software','personal','network','ai1','ai2','ai3','quantum'];
const PHI=1.618;
function layer(fn,loc,t,scale,alpha){if(alpha<=0.01)return;c.save();c.globalAlpha=alpha*(innerWidth<800?.22:.5);const ox=W*.78,oy=H*.48;c.translate(ox,oy);c.scale(scale,scale);c.translate(-ox,-oy);
 if(innerWidth<800){c.translate(W,0);c.scale(-1,1);c.translate(W*.35,0)}fn(loc,t);c.restore()}
window.drawMotifs=function(id,loc,t,still){c.clearRect(0,0,W,H);const fn=FN[id];if(!fn)return;c.globalCompositeOperation='lighter';t=still?0:t;
 // portal morph: the previous era's motif shrinks by 1/phi into the centre while this one grows in from phi
 const i=ORDER.indexOf(id),prev=i>0?FN[ORDER[i-1]]:null;const m=Math.min(1,loc/.14);
 if(prev&&m<1&&prev!==fn)layer(prev,1,t,1-(1-1/PHI)*m,1-m);
 const k=prev&&prev!==fn?m:1;layer(fn,loc,t,prev&&prev!==fn?PHI-(PHI-1)*m:1,Math.min(1,(1-loc)*7)*k);
 c.globalCompositeOperation='source-over';c.globalAlpha=1};
})();
