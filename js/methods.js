// ---------- métodos ----------
const need=(c,m)=>{if(!c)throw Error(m)};
function hold(p,v,t,m){const c=Math.cos(p.inc*R),s=Math.sin(p.inc*R);let d;
 if(m==="md")d=v.ext;else if(m==="tvd"){need(Math.abs(c)>1e-9,"Inc = 90°: use afastamento");d=(v.tvd-p.tvd)/c}
 else if(m==="disp"){need(Math.abs(s)>1e-9,"Inc = 0°: use TVD");d=(v.disp-p.disp)/s}
 else d=Math.abs(c)>1e-9?(t.tvd-p.tvd)/c:(Math.hypot(t.ns,t.ew)-p.disp)/s;
 need(d>0&&isFinite(d),"Extensão resultante inválida ("+d.toFixed(2)+")");return[seg(p,p.md+d,p.inc,p.azi,"Hold "+m)]}
function inline(p,t,fi,dls0){const i1=p.inc*R,a1=p.azi*R,i2=fi*R;
 const ev=(a,dls)=>{const e=sa(i1,a1,i2,a*R),dg=e*D;if(dg<1e-9)return null;const L=dg*30/dls,g=gf(L,e),
  en=p.ns+g*(Math.sin(i1)*Math.cos(a1)+Math.sin(i2)*Math.cos(a*R)),ee=p.ew+g*(Math.sin(i1)*Math.sin(a1)+Math.sin(i2)*Math.sin(a*R)),
  ta=n360(Math.atan2(t.ew-ee,t.ns-en)*D);return{err:((a-ta+180)%360+360)%360-180,L}};
 for(let dls=dls0;dls<=20;dls=Math.round((dls+.01)*1000)/1000){let pa=null,pe=null;
  for(let a=0;a<360;a++){const r=ev(a,dls);if(!r){pe=null;continue}
   if(pe!==null&&pe*r.err<0&&Math.abs(pe-r.err)<180){let lo=pa,hi=a,fl=pe;for(let k=0;k<50;k++){const m=(lo+hi)/2,fm=ev(m,dls).err;if(fl*fm<=0)hi=m;else{lo=m;fl=fm}}
    const m=(lo+hi)/2,r2=ev(m,dls);if(r2&&Math.abs(r2.err)<=.1)return{azi:m,L:r2.L}}
   pa=a;pe=r.err}}
 throw Error("Nudge Inline: sem solução com DLS até 20°/30m")}
function nudge(p,v,t,m){let md,inc=v.inc,azi=v.azi;
 if(m==="MdIncAzi")md=v.md;
 else if(m==="TVDIncAzi"){const dl=sa(p.inc*R,p.azi*R,inc*R,azi*R),rf=dl<1e-10?1:2/dl*Math.tan(dl/2);md=p.md+2*(v.tvd-p.tvd)/((Math.cos(p.inc*R)+Math.cos(inc*R))*rf)}
 else if(m==="DLSIncAzi"){need(v.dls>0,"DLS deve ser > 0");md=p.md+30*sa(p.inc*R,p.azi*R,inc*R,azi*R)*D/v.dls}
 else{const r=inline(p,t,inc,v.dls);md=p.md+r.L;azi=r.azi}
 need(md>p.md&&isFinite(md),"MD final deve ser maior que o atual");const q=seg(p,md,inc,azi,"Nudge "+m);return[q]}
function slant(p,v,t,m){const kn=m.split(","),Tg={tvd:t.tvd-p.tvd,dep:Math.hypot(t.ns-p.ns,t.ew-p.ew)};need(Tg.tvd>=0,"Alvo acima do ponto atual");
 const az=n360(Math.atan2(t.ew-p.ew,t.ns-p.ns)*D),fx={};
 if(kn.includes("kop")){fx.kop=v.kop-p.md;need(fx.kop>0,"KOP deve ser maior que o MD atual")}
 if(kn.includes("inc")){fx.inc=v.inc;need(v.inc>=0&&v.inc<=90,"Inc entre 0 e 90")}
 if(kn.includes("hold"))fx.hold=v.hold;if(kn.includes("dls")){need(v.dls>0&&v.dls<=30,"DLS entre 0 e 30");fx.r1=30/(v.dls*R)}
 const free=["kop","inc","hold","r1"].filter(k=>!(k in fx)),sol={...fx};
 if(!free.includes("inc")){const s=Math.sin(fx.inc*R),c=Math.cos(fx.inc*R),C={kop:[1,0],hold:[c,s],r1:[s,1-c]},r=[Tg.tvd,Tg.dep];
  for(const k in fx)if(k!=="inc"){r[0]-=C[k][0]*fx[k];r[1]-=C[k][1]*fx[k]}
  const[a,b]=free,det=C[a][0]*C[b][1]-C[b][0]*C[a][1];need(Math.abs(det)>1e-9,"Sistema singular para essa combinação");
  sol[a]=(r[0]*C[b][1]-C[b][0]*r[1])/det;sol[b]=(C[a][0]*r[1]-r[0]*C[a][1])/det}
 else{const pr=free.find(k=>k!=="inc"),F=i=>{const s=Math.sin(i*R),c=Math.cos(i*R),{kop,hold,r1}=fx;let val,res;
   if(pr==="kop"){val=Tg.tvd-r1*s-hold*c;res=r1*(1-c)+hold*s-Tg.dep}
   else if(pr==="hold"){if(Math.abs(c)<1e-9)return null;val=(Tg.tvd-kop-r1*s)/c;res=r1*(1-c)+val*s-Tg.dep}
   else{if(Math.abs(1-c)<1e-9)return null;val=(Tg.dep-hold*s)/(1-c);res=kop+val*s+hold*c-Tg.tvd}return[val,res]};
  let br=null,pv=null;for(let i=0;i<=360&&!br;i++){const a=1e-6+i*(90-2e-6)/360,r=F(a);if(r&&pv&&pv[1]*r[1]<=0)br=[a-(90-2e-6)/360,a];pv=r}
  need(br,"Slant: nenhuma inclinação fecha a geometria");let[lo,hi]=br,fl=F(lo)[1];
  for(let k=0;k<80;k++){const mm=(lo+hi)/2,fm=F(mm)[1];if(fl*fm<=0)hi=mm;else{lo=mm;fl=fm}}
  const ic=(lo+hi)/2;sol.inc=ic;sol[pr]=F(ic)[0]}
 need(sol.kop>=0&&sol.hold>=0&&sol.r1>=1/R-1e-6&&sol.inc>=0&&sol.inc<=90,"Solução fora dos limites (KOP/Hold ≥ 0, DLS ≤ 30°/30m, Inc 0–90°)");
 const dls=30/sol.r1*D,bl=sol.inc*30/dls,m1=p.md+sol.kop,m2=m1+bl,m3=m2+sol.hold,sec="Slant "+kn.join("+").toUpperCase(),out=[];let c=p;
 for(const[md,i,a]of[[m1,p.inc,p.azi],[m2,sol.inc,az],[m3,sol.inc,az]])if(md-c.md>1e-9){c=seg(c,md,i,a,sec);out.push(c)}return out}
const resid=(p,dn,de,dt,dls)=>{const t0=p.inc*R,p0=p.azi*R;return x=>{const[th,ph,L]=x,e=sa(t0,p0,th,ph);let g1,H=0;
 if(dls){g1=gf(30*e/(dls*R),e);H=L}else g1=gf(L,e);
 return[g1*(Math.cos(t0)+Math.cos(th))+H*Math.cos(th)-dt,g1*(Math.sin(t0)*Math.cos(p0)+Math.sin(th)*Math.cos(ph))+H*Math.sin(th)*Math.cos(ph)-dn,g1*(Math.sin(t0)*Math.sin(p0)+Math.sin(th)*Math.sin(ph))+H*Math.sin(th)*Math.sin(ph)-de]}};
function tryLM(f,dn,de,dt,n){const h=Math.hypot(dn,de),d=Math.hypot(h,dt),th=Math.atan2(h,dt),ph=(Math.atan2(de,dn)+2*Math.PI)%(2*Math.PI);let k=0;
 for(const a of[1,.5,1.5,.2])for(const b of[0,.3,-.3]){if(k++>=n)return null;const r=lm(f,[Math.min(th*a,2.09),(ph+b+2*Math.PI)%(2*Math.PI),d],[0,0,0],[2*Math.PI/3,2*Math.PI,1e7]);if(r.c<1e-6)return r.x}return null}
function dt(p,v,t,m){const md0=p.md;
 if(m==="md"){const t0=p.inc*R,b=v.dls*R/30*v.ext,tf=v.tf*R,inc=Math.acos(cl(Math.cos(t0)*Math.cos(b)-Math.sin(t0)*Math.sin(b)*Math.cos(tf))),
  azi=p.azi*R+Math.atan2(Math.sin(b)*Math.sin(tf),Math.sin(t0)*Math.cos(b)+Math.cos(t0)*Math.sin(b)*Math.cos(tf));need(v.ext>0,"Extensão deve ser > 0");return[seg(p,md0+v.ext,inc*D,azi*D,"DT MD")]}
 const dn=t.ns-p.ns,de=t.ew-p.ew,dz=t.tvd-p.tvd;
 if(m==="curve"){const x=tryLM(resid(p,dn,de,dz,0),dn,de,dz,12);need(x,"Curve: o solver não convergiu");return[seg(p,md0+x[2],x[0]*D,x[1]*D,"DT Curve")]}
 let dl=v.dls;need(dl>0,"DLS deve ser > 0");const cands=[dl];for(let i=1;i<=300;i++){cands.push(dl+i*.1);if(dl-i*.1>0)cands.push(dl-i*.1)}
 for(const c of cands){const x=tryLM(resid(p,dn,de,dz,c),dn,de,dz,3);if(x){const cl_=30*sa(p.inc*R,p.azi*R,x[0],x[1])/(c*R),a=seg(p,md0+cl_,x[0]*D,x[1]*D,"DT Curve-Hold");return[a,seg(a,a.md+x[2],x[0]*D,x[1]*D,"DT Curve-Hold")]}}
 throw Error("Curve-Hold: sem solução ao iterar o DLS")}

const F=(k,l,d)=>[k,l,d],A=[F("inc","Inc final (°)",30),F("azi","Azi final (°)",45)];
const SPEC={
hold:{n:"Hold",fn:hold,modes:{md:["Por extensão (MD)",[F("ext","Extensão (m)",500)]],tvd:["Até TVD",[F("tvd","TVD final (m)",2000)]],disp:["Até afastamento",[F("disp","Afastamento (m)",800)]],align:["Alinhar ao alvo (TVD)",[],1]}},
nudge:{n:"Nudge / Build-Turn",fn:(p,v,t,m)=>nudge(p,v,t,m),modes:{MdIncAzi:["MD + Inc + Azi",[F("md","MD final (m)",800),...A]],TVDIncAzi:["TVD + Inc + Azi",[F("tvd","TVD final (m)",780),...A]],DLSIncAzi:["DLS + Inc + Azi",[F("dls","DLS (°/30m)",3),...A]],Inline:["Alinhar ao alvo (Inline)",[F("inc","Inc final (°)",60),F("dls","DLS inicial (°/30m)",1)],1]}},
slant:{n:"Slant",fn:slant,t:1,modes:Object.fromEntries([["kop","dls"],["kop","inc"],["kop","hold"],["dls","inc"],["dls","hold"],["inc","hold"]].map(c=>{const L={kop:F("kop","KOP (MD abs, m)",500),dls:F("dls","DLS (°/30m)",3),inc:F("inc","Inc (°)",30),hold:F("hold","Hold (m)",1000)};return[c.join(","),["Conhecidos: "+c.map(x=>x.toUpperCase()).join(" + "),c.map(x=>L[x]),1]]}))},
dt:{n:"Dogleg / Toolface",fn:dt,modes:{md:["Toolface + DLS + extensão",[F("tf","Toolface (°)",0),F("dls","DLS (°/30m)",3),F("ext","Extensão (m)",100)]],curve:["Curva até o alvo",[],1],"curve-hold":["Curva + Hold até o alvo",[F("dls","DLS (°/30m)",3)],1]}}};
SPEC.opt={n:"Optimum Align (curva-hold-curva até o alvo, com project back opcional)",fn:optAlign,modes:{opt:["Optimum Align",[F("inc","Inc final no alvo (°)",30),F("azi","Azi final no alvo (°)",45),F("dls1","DLS 1 (°/30m)",3),F("dls2","DLS 2 (°/30m)",3),F("hold2","Hold até alvo 2 (1 = sim, 0 = não)",1)],1,1]}};
let PB=[],LASTOPT=null,RERUN=false,NOTE="";
function applyPB(){if(!LASTOPT)return;const L=LASTOPT,old=S;S=L.base.slice();$("#mode").value=L.mode;drawForm();Object.entries(L.v).forEach(([k,x])=>$("#f_"+k).value=x);$("#f_tgt").value=L.ti;$("#f_tgt2").value=L.ti2;RERUN=true;run();RERUN=false;if($("#msg").className.includes("err")){S=old;LASTOPT=L;render()}}
const PBF={extension:[["extension","Extensão (m)",100],["dls","DLS (°/30m)",3]],tvd:[["vertical_depth","TVD anterior (m)",1500],["dls","DLS (°/30m)",3]],inc:[["inclination","Inc anterior (°)",0],["dls","DLS (°/30m)",3]],incazi:[["inclination","Inc anterior (°)",0],["azimuth","Azi anterior (°)",0],["dls","DLS (°/30m)",3]],surface:[]};
function drawPB(){$("#pb").innerHTML=`<h2>Project back do Optimum Align acima (recua o alvo e refaz o cálculo; surface só como último)</h2>`+PB.map((r,i)=>`<div class="row" style="margin-bottom:6px"><label>Método<select onchange="PB[${i}]={m:this.value,v:{}};drawPB()">${Object.keys(PBF).map(k=>`<option ${k===r.m?"selected":""}>${k}</option>`).join("")}</select></label>${PBF[r.m].map(([k,l,d])=>`<label>${l}<input type="number" step="any" value="${r.v[k]??d}" oninput="PB[${i}].v.${k}=+this.value"></label>`).join("")}<button class="btn s" onclick="PB.splice(${i},1);drawPB()">×</button></div>`).join("")+`<button class="btn s" onclick="PB.push({m:'extension',v:{}});drawPB()">+ Project back</button> <button class="btn" onclick="applyPB()">Aplicar project back</button>`}
function sd(i1,a1,i2,a2,L){i1*=R;a1*=R;i2*=R;a2*=R;const g=gf(L,sa(i1,a1,i2,a2));return[g*(Math.cos(i1)+Math.cos(i2)),g*(Math.sin(i1)*Math.cos(a1)+Math.sin(i2)*Math.cos(a2)),g*(Math.sin(i1)*Math.sin(a1)+Math.sin(i2)*Math.sin(a2))]}
function back(r,cur,th,ph){let pt,pp=ph,ext,sec;
 if(r.m==="extension"){ext=r.extension;pt=th-ext*r.dls/30;sec="Back to Extension"}
 else if(r.m==="tvd"){const dz=cur.tvd-r.vertical_depth;pt=r.dls===0?th:Math.asin(cl(Math.sin(th*R)-dz/(30/(r.dls*R))))*D;const u=sd(pt,ph,th,ph,1)[0];need(Math.abs(u)>1e-12,"Back TVD: extensão incalculável");ext=dz/u;sec="Back to TVD"}
 else if(r.m==="inc"){need(r.dls!==0,"DLS do project back não pode ser 0");pt=r.inclination;ext=30*(th-pt)/r.dls;sec="Back to INC"}
 else{need(r.dls!==0,"DLS do project back não pode ser 0");pt=r.inclination;pp=r.azimuth;ext=30*sa(pt*R,pp*R,th*R,ph*R)/(r.dls*R);sec="Back to INC AZI"}
 need(ext>0&&isFinite(ext),"Project back "+r.m+": extensão inválida ("+ext.toFixed(2)+")");const d=sd(pt,pp,th,ph,ext);
 return[{tvd:cur.tvd-d[0],ns:cur.ns-d[1],ew:cur.ew-d[2]},pt,pp,{ext,inc:th,azi:ph,sec}]}
function chc(p,tf,pf,d1,d2,dz,dn,de){const t0=p.inc*R,p0=p.azi*R,tF=tf*R,pF=pf*R,TP=2*Math.PI;
 const res=(a,b)=>x=>{const[th,ph,H]=x,e1=sa(t0,p0,th,ph),e2=sa(th,ph,tF,pF),g1=gf(30*e1/(a*R),e1),g2=gf(30*e2/(b*R),e2),ct=Math.cos(th),sc=Math.sin(th)*Math.cos(ph),ss=Math.sin(th)*Math.sin(ph);
  return[g1*(Math.cos(t0)+ct)+H*ct+g2*(ct+Math.cos(tF))-dz,g1*(Math.sin(t0)*Math.cos(p0)+sc)+H*sc+g2*(sc+Math.sin(tF)*Math.cos(pF))-dn,g1*(Math.sin(t0)*Math.sin(p0)+ss)+H*ss+g2*(ss+Math.sin(tF)*Math.sin(pF))-de]};
 const h=Math.hypot(dn,de);let x0=[(.5*(Math.atan2(h,dz)+tF))%Math.PI,((Math.atan2(de,dn)%TP)+TP)%TP,Math.max(h*.3,25)],best=null;
 for(let i=0;i<200;i++){const a=d1+i*.1,b=d2+i*.1,f=res(a,b),r=lm(f,x0,[0,0,25],[Math.PI,TP,1e6]),err=Math.max(...f(r.x).map(Math.abs));x0=r.x;if(!best||err<best.err)best={err,x:r.x,a,b};if(err<=1e-3)break}
 need(best.err<1,"Optimum Align não fechou o alvo (erro "+best.err.toFixed(1)+" m)");return best}
function optAlign(p,v,t){let al=null;
 if(T[$("#f_tgt2").value]&&T[$("#f_tgt2").value]!==t){const t2=T[$("#f_tgt2").value];const dz=t2.tvd-t.tvd,dn=t2.ns-t.ns,de=t2.ew-t.ew,h=Math.hypot(dn,de);need(h>1e-6||Math.abs(dz)>1e-6,"Alvos coincidentes");
  const ci=Math.atan2(h,dz)*D,ca=h>1e-6?n360(Math.atan2(de,dn)*D):v.azi,ok=Math.abs(v.inc-ci)<.01&&Math.abs(((v.azi-ca+180)%360+360)%360-180)<.01;al={L:Math.hypot(h,dz),t2,ok};
  NOTE=(ok?"Alinhado: ":"Inc/Azi editados, não passa em "+t2.name+": ")+"Inc "+v.inc.toFixed(2)+"° / Azi "+v.azi.toFixed(2)+"° em "+t.name+" (direção "+t.name+" → "+t2.name+")."}
 const reqs=PB.map(r=>({m:r.m,...Object.fromEntries(PBF[r.m].map(([k,,d])=>[k,r.v[k]??d]))})),surf=reqs.length&&reqs[reqs.length-1].m==="surface";
 need(!reqs.slice(0,-1).some(r=>r.m==="surface"),"Surface só pode ser o último project back");
 let cur={tvd:t.tvd,ns:t.ns,ew:t.ew},th=v.inc,ph=v.azi;const segs=[];
 for(const r of surf?reqs.slice(0,-1):reqs){const a=back(r,cur,th,ph);cur=a[0];th=a[1];ph=a[2];segs.push(a[3])}
 if(surf){segs.push({ext:cur.tvd,inc:0,azi:0,sec:"Back to Surface"});const st={md:0,inc:0,azi:0,tvd:0,ns:cur.ns,ew:cur.ew,disp:0,dls:0,build:0,turn:0,tf:0,section:"Surface",target:""};
  O=st;let c=st;const out=[];for(const s of segs.reverse()){c=seg(c,c.md+s.ext,s.inc,s.azi,s.sec);out.push(c)}out.start=st;return out}
 need(v.dls1>0&&v.dls2>0,"DLS 1 e DLS 2 devem ser > 0");
 const b=chc(p,th,ph,v.dls1,v.dls2,cur.tvd-p.tvd,cur.ns-p.ns,cur.ew-p.ew),[x1,x2,H]=b.x,
  l1=30*sa(p.inc*R,p.azi*R,x1,x2)/(b.a*R),l2=30*sa(x1,x2,th*R,ph*R)/(b.b*R),out=[];
 let c=seg(p,p.md+l1,x1*D,x2*D,"OPT ALN");out.push(c);c=seg(c,c.md+H,x1*D,x2*D,"OPT ALN");out.push(c);c=seg(c,c.md+l2,th,ph,"OPT ALN");out.push(c);
 for(const s of segs.reverse()){c=seg(c,c.md+s.ext,s.inc,s.azi,s.sec);out.push(c)}if(al&&al.ok&&v.hold2===1&&!segs.length){c=seg(c,c.md+al.L,th,ph,"Hold → "+al.t2.name);out.push(c)}return out}
SPEC.nudge.fn=nudge;
