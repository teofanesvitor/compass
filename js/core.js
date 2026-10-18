const R=Math.PI/180,D=180/Math.PI,$=s=>document.querySelector(s),n360=a=>((a%360)+360)%360,cl=v=>Math.max(-1,Math.min(1,v)),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
let S=[],T=[{name:"T1",tvd:2500,ns:800,ew:600}],DISC=[],O={ns:0,ew:0},cur="start",charts=[];

// ---------- núcleo (porte de clsTrajectoryCalculation) ----------
const sa=(i1,a1,i2,a2)=>Math.acos(cl(Math.cos(i1)*Math.cos(i2)+Math.sin(i1)*Math.sin(i2)*Math.cos(a2-a1)));
const gf=(L,e)=>Math.abs(e)<1e-12?L/2:L/2*(2/e)*Math.tan(e/2);
function seg(p,md,inc,azi,section){
 const dmd=md-p.md,i1=p.inc*R,i2=inc*R,a1=p.azi*R,a2=azi*R,dl=sa(i1,a1,i2,a2),g=gf(dmd,dl);
 const q={md,inc,azi:n360(azi),section,target:"",tvd:p.tvd+g*(Math.cos(i1)+Math.cos(i2)),
  ns:p.ns+g*(Math.sin(i1)*Math.cos(a1)+Math.sin(i2)*Math.cos(a2)),ew:p.ew+g*(Math.sin(i1)*Math.sin(a1)+Math.sin(i2)*Math.sin(a2))};
 q.disp=Math.hypot(q.ns-O.ns,q.ew-O.ew);q.dls=dmd?dl*D/dmd*30:0;q.build=dmd?(inc-p.inc)/dmd*30:0;
 const sv=Math.abs(i1)<1e-10,ev=Math.abs(i2)<1e-10;
 q.turn=(sv||ev||!dmd)?0:((((azi-p.azi)+180)%360+360)%360-180)/dmd*30;
 let tf=0;if(sv)tf=n360(azi);else if(dl>=1e-3){const den=Math.sin(i1)*Math.sin(dl);if(Math.abs(den)>=1e-3){const a=Math.acos(cl((Math.cos(i1)*Math.cos(dl)-Math.cos(i2))/den))*D;tf=ev?n360(a):Math.sign(q.turn)*a}}
 q.tf=tf;return q}
function gauss(M,b){const n=b.length,A=M.map((r,i)=>[...r,b[i]]);for(let i=0;i<n;i++){let m=i;for(let k=i+1;k<n;k++)if(Math.abs(A[k][i])>Math.abs(A[m][i]))m=k;if(Math.abs(A[m][i])<1e-14)return null;[A[i],A[m]]=[A[m],A[i]];for(let k=i+1;k<n;k++){const f=A[k][i]/A[i][i];for(let j=i;j<=n;j++)A[k][j]-=f*A[i][j]}}
 const x=Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=A[i][n];for(let j=i+1;j<n;j++)s-=A[i][j]*x[j];x[i]=s/A[i][i]}return x}
function lm(f,x0,lo,hi){let x=x0.slice(),r=f(x),c=dot(r,r),lam=1e-3;
 for(let it=0;it<150&&c>1e-18;it++){const J=x.map((_,j)=>{const h=1e-7*Math.max(1,Math.abs(x[j])),y=x.slice();y[j]+=h;return f(y).map((v,i)=>(v-r[i])/h)});
  const A=J.map(a=>J.map(b=>dot(a,b))),g=J.map(a=>dot(a,r));let ok=false;
  for(let k=0;k<8&&!ok;k++){const d=gauss(A.map((row,i)=>row.map((v,j)=>v+(i===j?lam*(v||1):0))),g);if(!d){lam*=10;continue}
   const xn=x.map((v,i)=>Math.min(hi[i],Math.max(lo[i],v-d[i]))),rn=f(xn),cn=dot(rn,rn);if(cn<c){x=xn;r=rn;c=cn;lam=Math.max(lam/4,1e-12);ok=true}else lam*=10}
  if(!ok)break}return{x,c}}
