// ---------- discretização (porte de survey_creation) ----------
function discretize(a,step){const c=[a[0]],nr=(x,y)=>Math.abs(x-y)<1e-8;
 for(let i=1;i<a.length;i++){const b=c[c.length-1],q=a[i];if(!(nr(q.md,b.md)&&nr(q.inc,b.inc)&&nr(q.azi,b.azi)))c.push(q)}
 const out=[{md:c[0].md,inc:c[0].inc,azi:c[0].azi,id:0}],vec=(I,A)=>[Math.sin(I)*Math.cos(A),Math.sin(I)*Math.sin(A),Math.cos(I)];
 for(let i=0;i<c.length-1;i++){const m0=c[i].md,m1=c[i+1].md,dm=m1-m0;if(Math.abs(dm)<1e-12)continue;
  const t0=vec(c[i].inc*R,c[i].azi*R),t1=vec(c[i+1].inc*R,c[i+1].azi*R),th=Math.acos(cl(dot(t0,t1))),n=Math.floor(dm/step);
  for(let k=1;k<=n;k++){const s=k*step;if(s>=dm)break;const ts=th*s/dm;let t=th>1e-8?t0.map((v,j)=>Math.sin(th-ts)/Math.sin(th)*v+Math.sin(ts)/Math.sin(th)*t1[j]):t0.slice();const nm=Math.hypot(...t);t=t.map(v=>v/nm);
   out.push({md:m0+s,inc:Math.acos(cl(t[2]))*D,azi:n360(Math.atan2(t[1],t[0])*D),id:i})}
  out.push({md:m1,inc:c[i+1].inc,azi:c[i+1].azi,id:i})}return out}
function doDisc(){const m=$("#dmsg");try{need(S.length>1,"Adicione ao menos um trecho à tabela.");const st=parseFloat($("#step").value);need(st>0,"Passo inválido");O=S[0];
 const d=discretize(S,st);DISC=[{...S[0]}];for(let i=1;i<d.length;i++)DISC.push(seg(DISC[i-1],d[i].md,d[i].inc,d[i].azi,"Trecho "+(d[i].id+1)));
 m.className="msg ok";m.textContent=DISC.length+" estações geradas (passo "+st+" m). Já aparecem sobrepostas nos gráficos. Clique em uma linha para ver o trecho.";if(SEL&&SEL.src==="D")SEL=null;$("#dtbl").innerHTML=tbl(DISC,"D");mark();drawCharts()}catch(e){m.className="msg err";m.textContent=e.message}}
