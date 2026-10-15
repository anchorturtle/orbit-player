// Small looping explainer animations. Each: (ctx,w,h,t seconds)
(function(){
const B='#7ec8e8',I='#cfefff',G='#ffd27a',N='#2a4a8a';
function txt(c,s,x,y,col,sz){c.fillStyle=col||I;c.font=`600 ${sz||14}px system-ui`;c.textAlign='center';c.fillText(s,x,y)}
const D={
abacus(c,w,h,t){const rods=6;for(let r=0;r<rods;r++){const y=h*(.18+r*.13);c.strokeStyle=N;c.lineWidth=3;c.beginPath();c.moveTo(w*.1,y);c.lineTo(w*.9,y);c.stroke();
 const k=Math.floor((t*.8+r*1.7)%10);for(let b=0;b<9;b++){const on=b<k;const x=on?w*(.14+b*.05):w*(.48+b*.05);c.fillStyle=on?G:B;c.beginPath();c.ellipse(x,y,w*.022,h*.04,0,0,7);c.fill()}
 txt(c,k,w*.95,y+5,G)}txt(c,'state = bead positions',w/2,h*.97,I,13)},
gate(c,w,h,t){const a=Math.floor(t/1.2)%2,b=Math.floor(t/2.4)%2,o=a&b;const cx=w*.5,cy=h*.45;
 c.lineWidth=4;[[a,cy-h*.12],[b,cy+h*.12]].forEach(([v,y])=>{c.strokeStyle=v?G:N;c.beginPath();c.moveTo(w*.12,y);c.lineTo(cx-w*.08,y);c.stroke();txt(c,v,w*.08,y+5,v?G:I,18)});
 c.fillStyle='#0d2a5a';c.strokeStyle=B;c.beginPath();c.moveTo(cx-w*.08,cy-h*.2);c.lineTo(cx,cy-h*.2);c.arc(cx,cy,h*.2,-Math.PI/2,Math.PI/2);c.lineTo(cx-w*.08,cy+h*.2);c.closePath();c.fill();c.stroke();txt(c,'AND',cx,cy+5,B,16);
 c.strokeStyle=o?G:N;c.beginPath();c.moveTo(cx+h*.2,cy);c.lineTo(w*.88,cy);c.stroke();txt(c,o,w*.93,cy+6,o?G:I,22);
 txt(c,`${a} AND ${b} = ${o}`,w/2,h*.92,I,15)},
turing(c,w,h,t){const n=11,cw=w/n*.9,x0=(w-cw*n)/2,y=h*.4,step=Math.floor(t*1.5),s=(t*1.5)%1;
 for(let i=0;i<n;i++){const v=((i+step)*7919)%3===0?1:0;const x=x0+(i-Math.min(s*1.5,1)+.5)*cw;c.strokeStyle=B;c.lineWidth=1.5;c.strokeRect(x,y,cw-3,cw);txt(c,v,x+cw/2,y+cw*.65,v?G:I,16)}
 const hx=w/2;c.fillStyle=G;c.beginPath();c.moveTo(hx,y-6);c.lineTo(hx-12,y-26);c.lineTo(hx+12,y-26);c.fill();txt(c,'head: read → rule → write → move',w/2,h*.8,I,13);txt(c,'state q'+(step%3),hx,y-34,G,13)},
rotor(c,w,h,t){const cx=w/2,cy=h*.45;const L='ABCDEFGHIJKLMNOPQRSTUVWXYZ';for(let r=0;r<3;r++){const R=h*(.36-r*.1),off=Math.floor(t*(r===0?3:r===1?.6:.12));c.strokeStyle=r===0?G:B;c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,R,0,7);c.stroke();
 for(let k=0;k<26;k++){const a=(k-off)/26*6.283-1.5708;txt(c,L[k],cx+Math.cos(a)*(R-9),cy+Math.sin(a)*(R-9)+4,k===0?G:'#9fb7da',r===0?11:10)}}
 txt(c,'each keypress steps the rotors → new cipher',w/2,h*.95,I,12)},
compile(c,w,h,t){const ph=Math.floor(t/1.4)%5;txt(c,'total = a + b',w*.27,h*.22,G,16);c.strokeStyle=B;c.lineWidth=2;c.beginPath();c.moveTo(w*.48,h*.2);c.lineTo(w*.56,h*.2);c.stroke();txt(c,'compiler',w*.52,h*.14,'#9fb7da',11);
 ['LOAD  r1, a','LOAD  r2, b','ADD   r1, r2','STORE r1, total'].forEach((l,i)=>{c.fillStyle=i<ph?'#163a74':'#0b1a38';c.fillRect(w*.58,h*(.12+i*.13),w*.36,h*.1);c.fillStyle=i<ph?G:'#4a6090';c.font='600 12px monospace';c.textAlign='left';c.fillText(l,w*.6,h*(.185+i*.13))});
 const bits=Array.from({length:32},(_,k)=>((k*7+ph*13)%5<2)?1:0).join('');txt(c,bits,w/2,h*.78,ph>=4?G:'#4a6090',12);txt(c,'human words → instructions → bits',w/2,h*.94,I,12)},
bits(c,w,h,t){const n=8,cs=w/(n+2);const v=Math.floor(t*2)&255;let y=h*.35;
 for(let i=0;i<n;i++){const bit=(v>>(n-1-i))&1;const x=cs*(i+1);c.fillStyle=bit?G:'#0d2a5a';c.shadowColor=G;c.shadowBlur=bit?18:0;c.beginPath();c.arc(x+cs/2,y,cs*.32,0,7);c.fill();c.shadowBlur=0;txt(c,bit,x+cs/2,y+cs*.75,I,14);txt(c,2**(n-1-i),x+cs/2,y-cs*.5,'#6d89b5',10)}
 txt(c,'= '+v,w/2,h*.75,G,28);txt(c,'fetch · decode · execute · repeat',w/2,h*.92,I,12)},
transistor(c,w,h,t){const on=Math.sin(t*2)>0;c.fillStyle='#1a2f5c';c.fillRect(w*.1,h*.55,w*.8,h*.25);txt(c,'silicon',w*.5,h*.75,'#6d89b5',12);
 c.fillStyle='#3b5f9a';c.fillRect(w*.12,h*.42,w*.18,h*.13);c.fillRect(w*.7,h*.42,w*.18,h*.13);txt(c,'source',w*.21,h*.38,I,12);txt(c,'drain',w*.79,h*.38,I,12);
 c.fillStyle=on?G:'#556';c.fillRect(w*.38,h*.3,w*.24,h*.2);txt(c,on?'gate: ON':'gate: off',w*.5,h*.25,on?G:I,13);c.fillStyle='#999';c.fillRect(w*.38,h*.5,w*.24,h*.04);
 if(on){for(let i=0;i<8;i++){const x=w*(.25+((t*.5+i/8)%1)*.5);c.fillStyle=B;c.beginPath();c.arc(x,h*.59,4,0,7);c.fill()}}
 txt(c,on?'current flows → 1':'blocked → 0',w/2,h*.93,on?G:I,15)},
gui(c,w,h,t){c.fillStyle='#0d2a5a';c.fillRect(w*.08,h*.08,w*.84,h*.78);for(let i=0;i<3;i++){const x=w*(.15+i*.2)+Math.sin(t+i)*8,y=h*(.18+i*.15);c.fillStyle='#163a74';c.fillRect(x,y,w*.4,h*.35);c.fillStyle=B;c.fillRect(x,y,w*.4,h*.05);c.strokeStyle=B;c.strokeRect(x,y,w*.4,h*.35)}
 const mx=w*(.5+.3*Math.cos(t*.9)),my=h*(.5+.25*Math.sin(t*1.3));c.fillStyle='#fff';c.beginPath();c.moveTo(mx,my);c.lineTo(mx,my+18);c.lineTo(mx+5,my+13);c.lineTo(mx+12,my+13);c.fill();txt(c,'windows · icons · menus · pointer',w/2,h*.95,I,12)},
network(c,w,h,t){const P=[];for(let i=0;i<9;i++)P.push([w*(.15+.7*((i*37)%9)/8),h*(.15+.65*((i*53)%9)/8)]);const E=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,0],[1,5],[2,7],[3,8],[0,4]];
 c.strokeStyle=N;c.lineWidth=2;E.forEach(([a,b])=>{c.beginPath();c.moveTo(...P[a]);c.lineTo(...P[b]);c.stroke()});
 E.forEach(([a,b],k)=>{const s=(t*.6+k*.17)%1;c.fillStyle=k%3?B:G;c.beginPath();c.arc(P[a][0]+(P[b][0]-P[a][0])*s,P[a][1]+(P[b][1]-P[a][1])*s,4,0,7);c.fill()});
 P.forEach(p=>{c.fillStyle='#0d2a5a';c.strokeStyle=B;c.beginPath();c.arc(...p,9,0,7);c.fill();c.stroke()});txt(c,'packets find their own way',w/2,h*.95,I,13)},
neuron(c,w,h,t){const xs=[.6,-.4,.9],ws=[.8+.3*Math.sin(t),-.5,.6*Math.cos(t*.7)];let s=0;
 xs.forEach((x,i)=>{const y=h*(.25+i*.25);s+=x*ws[i];c.strokeStyle=ws[i]>0?B:'#e07a9a';c.lineWidth=1+Math.abs(ws[i])*6;c.beginPath();c.moveTo(w*.15,y);c.lineTo(w*.55,h*.5);c.stroke();c.fillStyle='#0d2a5a';c.beginPath();c.arc(w*.15,y,14,0,7);c.fill();txt(c,x,w*.15,y+5,I,12);txt(c,'w='+ws[i].toFixed(2),w*.33,y+(h*.5-y)*.45-6,'#9fb7da',11)});
 const f=s>0.3;c.fillStyle=f?G:'#163a74';c.shadowColor=G;c.shadowBlur=f?30:0;c.beginPath();c.arc(w*.58,h*.5,h*.12,0,7);c.fill();c.shadowBlur=0;txt(c,'Σ',w*.58,h*.53,f?'#000':I,20);
 c.strokeStyle=f?G:N;c.lineWidth=4;c.beginPath();c.moveTo(w*.7,h*.5);c.lineTo(w*.9,h*.5);c.stroke();txt(c,f?'fire!':'quiet',w*.85,h*.43,f?G:I,14);txt(c,'sum = '+s.toFixed(2)+'  (threshold 0.3)',w/2,h*.93,I,13)},
conv(c,w,h,t){const n=8,cs=Math.min(w*.45,h*.75)/n,x0=w*.06,y0=h*.12;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=(Math.sin(i*.9)+Math.cos(j*.7+i*.3))*.5+.5;c.fillStyle=`rgba(126,200,232,${v*.8+.1})`;c.fillRect(x0+j*cs,y0+i*cs,cs-1,cs-1)}
 const k=Math.floor(t*3)%36,ki=Math.floor(k/6),kj=k%6;c.strokeStyle=G;c.lineWidth=3;c.strokeRect(x0+kj*cs,y0+ki*cs,cs*3,cs*3);
 const x1=w*.62;for(let i=0;i<6;i++)for(let j=0;j<6;j++){const idx=i*6+j;c.fillStyle=idx<=k?`rgba(255,210,122,${.3+.6*Math.abs(Math.sin(i+j))})`:'#0d2a5a';c.fillRect(x1+j*cs*.8,y0+i*cs*.8,cs*.8-1,cs*.8-1)}
 txt(c,'filter slides → feature map',w/2,h*.94,I,13)},
attention(c,w,h,t){const words=['the','cat','sat','because','it','was','tired'];const q=4,yT=h*.25,yB=h*.75;const pos=words.map((_,i)=>w*(.08+i*.14));
 const sc=words.map((_,i)=>i===1?.9:i===q?.25:.08+.05*Math.sin(t+i));const pulse=.6+.4*Math.sin(t*2);
 words.forEach((wd,i)=>{const a=sc[i]*pulse;c.strokeStyle=`rgba(255,210,122,${a})`;c.lineWidth=1+a*10;c.beginPath();c.moveTo(pos[q],yB-14);c.bezierCurveTo(pos[q],h*.5,pos[i],h*.5,pos[i],yT+8);c.stroke()});
 words.forEach((wd,i)=>{txt(c,wd,pos[i],yT,i===1?G:I,14);txt(c,wd,pos[i],yB+4,i===q?G:'#6d89b5',14)});txt(c,'"it" attends most to "cat"',w/2,h*.94,I,13)},
bloch(c,w,h,t){const cx=w/2,cy=h*.47,R=Math.min(w,h)*.32;c.strokeStyle=N;c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,R,0,7);c.stroke();c.beginPath();c.ellipse(cx,cy,R,R*.3,0,0,7);c.stroke();
 txt(c,'|0⟩',cx,cy-R-8,I,14);txt(c,'|1⟩',cx,cy+R+20,I,14);const th=Math.PI*(.5+.4*Math.sin(t*.6)),ph=t*1.2;
 const x=R*Math.sin(th)*Math.cos(ph),y=-R*Math.cos(th),z=R*Math.sin(th)*Math.sin(ph)*.3;c.strokeStyle=G;c.lineWidth=4;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+x,cy+y+z);c.stroke();c.fillStyle=G;c.beginPath();c.arc(cx+x,cy+y+z,7,0,7);c.fill();
 const p0=Math.cos(th/2)**2;txt(c,`P(0) = ${(p0*100).toFixed(0)}%   P(1) = ${(100-p0*100).toFixed(0)}%`,cx,h*.95,I,13)}
};
window.DIAGRAMS=D;
// The dive: 8 nested levels drawn in unit coords [-1,1]; child sits at center with size 1/K.
const K=9;
function lvl(c,i,px,t){c.lineWidth=px*1.5;
switch(i){
case 0:c.fillStyle='#0b1f45';c.strokeStyle=B;c.beginPath();c.roundRect(-.9,-.75,1.8,1.05,.04);c.fill();c.stroke();c.fillStyle='#04102a';c.fillRect(-.82,-.68,1.64,.9);
 c.fillStyle='#132e60';c.beginPath();c.moveTo(-1,.32);c.lineTo(1,.32);c.lineTo(.9,.6);c.lineTo(-.9,.6);c.fill();c.stroke();
 for(let r=0;r<4;r++)for(let k=0;k<14;k++){c.fillStyle='#1d3d78';c.fillRect(-.82+k*.118+r*.02,.36+r*.055,.1,.04)}
 c.fillStyle='rgba(126,200,232,.25)';c.fillRect(-.11,-.11,.22,.22);break;
case 1:c.fillStyle='#0a3a2e';c.fillRect(-1,-1,2,2);c.strokeStyle='#d4a24a';for(let k=0;k<40;k++){const a=k*2.4,y=-1+k*.05;c.beginPath();c.moveTo(-1,y);c.lineTo(-.3+.1*Math.sin(a),y);c.lineTo(-.15,y*.2);c.stroke();c.beginPath();c.moveTo(1,-y);c.lineTo(.3,-y);c.lineTo(.15,-y*.2);c.stroke()}
 [[-.7,-.6,.3,.15],[.5,.5,.35,.2],[-.6,.5,.2,.3],[.55,-.7,.25,.25]].forEach(r=>{c.fillStyle='#111';c.fillRect(...r)});c.fillStyle='#222';c.fillRect(-.15,-.15,.3,.3);c.strokeStyle=B;c.strokeRect(-.15,-.15,.3,.3);break;
case 2:c.fillStyle='#14612f';c.fillRect(-1,-1,2,2);c.fillStyle='#8a8f99';c.fillRect(-.85,-.85,1.7,1.7);c.fillStyle='#b8bcc6';c.fillRect(-.6,-.6,1.2,1.2);
 c.fillStyle='#d4a24a';for(let k=0;k<24;k++){const p=-.82+k*.071;c.fillRect(p,-.98,.03,.1);c.fillRect(p,.88,.03,.1);c.fillRect(-.98,p,.1,.03);c.fillRect(.88,p,.1,.03)}
 c.fillStyle='#3a3060';c.fillRect(-.12,-.12,.24,.24);break;
case 3:{const cols=['#2b3f8f','#4b2f7f','#1f6f7f','#6f5a2f'];for(let a=0;a<10;a++)for(let b=0;b<10;b++){c.fillStyle=cols[(a*3+b*7)%4];c.globalAlpha=.75;c.fillRect(-1+a*.2,-1+b*.2,.19,.19)}c.globalAlpha=1;
 c.strokeStyle='rgba(207,239,255,.4)';for(let k=0;k<20;k++){c.beginPath();c.moveTo(-1,-1+k*.1);c.lineTo(1,-1+k*.1);c.stroke()}c.fillStyle='#0a1430';c.fillRect(-.11,-.11,.22,.22);break}
case 4:c.fillStyle='#24304f';c.fillRect(-1,-1,2,2);c.fillStyle='#5a6f9f';for(let k=-3;k<=3;k++)c.fillRect(k*.25-.04,-1,.08,2);
 c.fillStyle='rgba(255,210,122,.75)';c.fillRect(-1,-.13,2,.26);c.fillStyle='#7f97c8';c.fillRect(-1,-.6,2,.12);c.fillRect(-1,.48,2,.12);txt2(c,'gate',-.8,-.2,px);c.fillStyle='#ffe9b8';c.fillRect(-.06,-.06,.12,.12);break;
case 5:c.fillStyle='#ffd27a';c.fillRect(-1,-1,2,.85);c.fillStyle='#7ec8e8';c.fillRect(-1,-.15,2,.3);c.fillStyle='#3a4a7a';c.fillRect(-1,.15,2,.85);
 for(let k=0;k<26;k++)for(let r=0;r<3;r++){c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(-1+k*.08,-.1+r*.1,.025,0,7);c.fill()}
 txt2(c,'metal gate',-.9,-.8,px);txt2(c,'oxide ~ 5 atoms',-.9,-.2,px);txt2(c,'silicon channel',-.9,.3,px);
 for(let k=0;k<6;k++){const s=((t*.4+k/6)%1);c.fillStyle='#fff';c.globalAlpha=1-s;c.beginPath();c.arc(-.6+k*.25,.5-s*1.2,.025,0,7);c.fill()}c.globalAlpha=1;break;
case 6:c.fillStyle='#050d22';c.fillRect(-1,-1,2,2);{const a=.25;c.strokeStyle='rgba(126,200,232,.5)';c.lineWidth=px*2;
 for(let i=-5;i<=5;i++)for(let j=-5;j<=5;j++){const x=i*a+(j%2?a/2:0),y=j*a*.866;[[a,0],[a/2,a*.866],[-a/2,a*.866]].forEach(([dx,dy])=>{c.beginPath();c.moveTo(x,y);c.lineTo(x+dx,y+dy);c.stroke()})}
 for(let i=-5;i<=5;i++)for(let j=-5;j<=5;j++){const x=i*a+(j%2?a/2:0),y=j*a*.866;const g=c.createRadialGradient(x,y,0,x,y,.07);g.addColorStop(0,'#cfefff');g.addColorStop(1,'rgba(126,200,232,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,.07,0,7);c.fill()}}break;
case 7:{c.fillStyle='#020713';c.fillRect(-1,-1,2,2);for(let k=0;k<600;k++){const r=Math.abs(Math.sin(k*12.9898)*43758.5)%1;const rr=.75*Math.sqrt(-Math.log(1-r*.98))/2;const an=k*2.399+t*.3*(k%3-1);c.fillStyle=`rgba(126,200,232,${.5-rr*.5})`;c.fillRect(Math.cos(an)*rr,Math.sin(an)*rr,.012,.012)}
 const g=c.createRadialGradient(0,0,0,0,0,.9);g.addColorStop(0,'rgba(126,200,232,.35)');g.addColorStop(1,'rgba(126,200,232,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,.9,0,7);c.fill();
 c.fillStyle='#ffd27a';c.shadowColor='#ffd27a';c.shadowBlur=20;c.beginPath();c.arc(0,0,.025,0,7);c.fill();c.shadowBlur=0;txt2(c,'nucleus ~100,000× smaller than the atom',-.55,.92,px);break}
case 8:{c.fillStyle='#020713';c.fillRect(-1,-1,2,2);c.strokeStyle='rgba(126,200,232,.6)';c.lineWidth=px*2;c.beginPath();c.arc(0,0,.6,0,7);c.stroke();c.beginPath();c.ellipse(0,0,.6,.18,0,0,7);c.stroke();
 const th=1.2+.6*Math.sin(t*.7),ph=t;c.strokeStyle='#ffd27a';c.lineWidth=px*5;c.beginPath();c.moveTo(0,0);c.lineTo(.6*Math.sin(th)*Math.cos(ph),-.6*Math.cos(th)+.18*Math.sin(th)*Math.sin(ph));c.stroke();
 txt2(c,'|0⟩',-.05,-.68,px);txt2(c,'|1⟩',-.05,.78,px);break}
}}
function txt2(c,s,x,y,px){c.save();c.translate(x,y);c.scale(px,px);c.fillStyle='#fff';c.font='600 14px system-ui';c.textAlign='left';c.fillText(s,0,0);c.restore()}
window.drawDive=function(c,W,H,p,t){ // p in [0, 8]
 const S=Math.min(W,H)*.48;const i=Math.min(8,Math.floor(p)),f=Math.min(1,p-i);const z=i===8?1+f*.5:Math.pow(K,f);
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#020713';c.fillRect(0,0,W,H);
 c.save();c.translate(W/2,H/2);c.scale(S*z,S*z);c.globalAlpha=i<8?1-Math.max(0,f-.7)/.3:1;lvl(c,i,1/(S*z),t);c.restore();
 if(i<8){c.save();c.translate(W/2,H/2);const s2=S*z/K;c.scale(s2,s2);c.globalAlpha=Math.min(1,Math.max(0,(f-.35)/.5));c.beginPath();c.rect(-1,-1,2,2);c.clip();lvl(c,i+1,1/s2,t);c.restore()}
 c.globalAlpha=1;};
})();
