// ---------- seleção de linha ----------
let SEL=null;
function sel(src,i){SEL={src,i};mark();drawCharts()}
function mark(){document.querySelectorAll("tr[data-s]").forEach(r=>r.classList.toggle("sel",!!SEL&&r.dataset.s===SEL.src&&+r.dataset.i===SEL.i))}
function vsFn(){const l=S[S.length-1],u=parseFloat($("#vsaz").value),az=isNaN(u)?Math.atan2(l.ew-S[0].ew,l.ns-S[0].ns):u*R;return q=>(q.ns-S[0].ns)*Math.cos(az)+(q.ew-S[0].ew)*Math.sin(az)}
function sub(a,b){const dm=b.md-a.md;if(!(dm>0))return[a,b];const d=discretize([a,b],dm/24),o=O;O=S[0];const out=[a];for(let k=1;k<d.length;k++)out.push(seg(out[k-1],d[k].md,d[k].inc,d[k].azi,""));O=o;return out}
function hlData(vs){if(!SEL)return[[],null];const a=SEL.src==="S"?S:DISC,q=a[SEL.i];if(!q)return[[],null];q.vs=vs(q);let hl=[];
 if(SEL.src==="S"){if(SEL.i>0)hl=sub(a[SEL.i-1],q)}
 else if(SEL.i>0){const ix=a.map((x,j)=>x.section===q.section?j:-1).filter(j=>j>=0);hl=a.slice(Math.max(0,ix[0]-1),ix[ix.length-1]+1)}
 hl.forEach(x=>x.vs=vs(x));return[hl,q]}
function selInfo(){let s="Azul: estações · "+(DISC.length?"Laranja: discretizada · ":"")+"Vermelho: alvos · Amarelo: seleção";if(!SEL)return s+" — clique em uma linha da tabela.";
 const a=SEL.src==="S"?S:DISC,q=a[SEL.i];if(!q)return s;
 if(SEL.src==="S")s=SEL.i===0?"<b>Linha 1:</b> ponto inicial (tie-in).":`<b>Linha ${SEL.i+1} · ${q.section}:</b> trecho de MD ${a[SEL.i-1].md.toFixed(2)} a ${q.md.toFixed(2)} m (extensão ${(q.md-a[SEL.i-1].md).toFixed(2)} m, DLS ${q.dls.toFixed(2)}°/30m).`;
 else s=SEL.i===0?"<b>Discretizada, linha 1:</b> ponto inicial.":`<b>Discretizada, linha ${SEL.i+1} · ${q.section}:</b> destacado o trecho original ${q.section.replace("Trecho ","")} inteiro.`;
 return s}
// ---------- gráficos ----------
function drawCharts(){charts.forEach(c=>c.destroy());charts=[];const g=$("#cg");g.innerHTML="";if(S.length<2){$("#chinfo").textContent="Adicione trechos para ver os gráficos.";return}
 $("#chinfo").innerHTML=selInfo();
 vsOf(S);if(DISC.length)vsOf(DISC);const vsf=vsFn();const cs=getComputedStyle(document.documentElement),fg=cs.getPropertyValue("--mut"),bd=cs.getPropertyValue("--bd"),ac=cs.getPropertyValue("--ac");
 const tg=T.map(t=>({...t,vs:(()=>{const l=S[S.length-1],u=parseFloat($("#vsaz").value),az=isNaN(u)?Math.atan2(l.ew-S[0].ew,l.ns-S[0].ns):u*R;return(t.ns-S[0].ns)*Math.cos(az)+(t.ew-S[0].ew)*Math.sin(az)})()}));
 const[HL,SP]=hlData(vsf);const defs=[["Planta (E/W × N/S)","ew","ns",0,"ew","ns"],["Seção vertical (VS × TVD)","vs","tvd",1,"vs","tvd"],["Inclinação × MD","md","inc"],["Azimute × MD","md","azi"],["DLS × MD (°/30m)","md","dls"],["TVD × MD","md","tvd",1]];
 defs.forEach(([ti,x,y,rev,tx,ty])=>{const d=document.createElement("div");d.className="card";d.innerHTML=`<h2>${ti}</h2><div class="ch"><canvas></canvas></div>`;g.appendChild(d);
  const pts=a=>a.map(q=>({x:q[x],y:q[y]})),ds=[{label:"Estações",data:pts(S),borderColor:ac,backgroundColor:ac,showLine:true,pointRadius:3,tension:0}];
  if(DISC.length)ds.push({label:"Discretizada",data:pts(DISC),borderColor:"#e8890c",backgroundColor:"#e8890c",showLine:true,pointRadius:1.5,borderWidth:1,tension:0});
  if(tx)ds.push({label:"Alvos",data:tg.map(t=>({x:t[tx],y:t[ty]})),borderColor:"#d33",backgroundColor:"#d33",pointStyle:"triangle",pointRadius:7,showLine:false});
  if(HL.length>1)ds.push({label:"Trecho selecionado",data:HL.map(q=>({x:q[x],y:q[y]})),borderColor:"#f2c200",backgroundColor:"#f2c200",showLine:true,pointRadius:0,borderWidth:6,tension:0,order:-1});if(SP)ds.push({label:"Linha selecionada",data:[{x:SP[x],y:SP[y]}],borderColor:"#000",backgroundColor:"#f2c200",pointRadius:8,pointBorderWidth:2,showLine:false,order:-2});
  charts.push(new Chart(d.querySelector("canvas"),{type:"scatter",data:{datasets:ds},options:{maintainAspectRatio:false,animation:false,plugins:{legend:{labels:{color:fg,boxWidth:10}}},scales:{x:{type:"linear",title:{display:true,text:x,color:fg},ticks:{color:fg},grid:{color:bd}},y:{type:"linear",reverse:!!rev,title:{display:true,text:y,color:fg},ticks:{color:fg},grid:{color:bd}}}}}))})}
