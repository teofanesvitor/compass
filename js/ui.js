// ---------- UI ----------
const TABS=[["start","Início / Alvos"],["hold","Hold"],["nudge","Nudge"],["slant","Slant"],["dt","Dogleg/TF"],["opt","Optimum Align"],["ds","Discretização"]];
$("#tabs").innerHTML=TABS.map(([k,l])=>`<button id="b_${k}" onclick="tab('${k}')">${l}</button>`).join("");
$("#tie").innerHTML=[["md","MD (m)"],["inc","Inc (°)"],["azi","Azi (°)"],["tvd","TVD (m)"],["ns","N/S (m)"],["ew","E/W (m)"]].map(([k,l])=>`<label>${l}<input id="t_${k}" type="number" value="0"></label>`).join("");
function tab(k){cur=k;TABS.forEach(([x])=>$("#b_"+x).classList.toggle("on",x===k));const m=SPEC[k];
 $("#p_start").classList.toggle("hid",k!=="start");$("#p_m").classList.toggle("hid",!m);$("#p_tab").classList.toggle("hid",k==="ch"||k==="ds");$("#p_ds").classList.toggle("hid",k!=="ds");
 if(m){$("#mt").textContent=m.n;$("#mode").innerHTML=Object.entries(m.modes).map(([a,b])=>`<option value="${a}">${b[0]}</option>`).join("");drawForm()}
 $("#msg").textContent="";const shp=k==="opt"&&LASTOPT;$("#pb").classList.toggle("hid",!shp);if(shp)drawPB();drawCharts()}
function drawForm(){const sp=SPEC[cur].modes[$("#mode").value];$("#flds").innerHTML=sp[1].map(([k,l,d])=>`<label>${l}<input id="f_${k}" type="number" step="any" value="${d}"></label>`).join("");
 $("#tgl").classList.toggle("hid",!sp[2]);$("#tgl").firstChild.textContent=sp[3]?"Alvo 1":"Alvo";$("#tgl2").classList.toggle("hid",!sp[3]);$("#modl").classList.toggle("hid",Object.keys(SPEC[cur].modes).length<2);fillT();autoAlign()}
function autoAlign(){const el=$("#alh");el.textContent="";if(cur!=="opt")return;const a=T[$("#f_tgt").value],b=T[$("#f_tgt2").value];if(!a||!b||a===b)return;
 const dz=b.tvd-a.tvd,dn=b.ns-a.ns,de=b.ew-a.ew,h=Math.hypot(dn,de);if(h<1e-6&&Math.abs(dz)<1e-6)return;
 const inc=Math.atan2(h,dz)*D,azi=h>1e-6?n360(Math.atan2(de,dn)*D):+$("#f_azi").value;$("#f_inc").value=inc.toFixed(4);$("#f_azi").value=azi.toFixed(4);
 el.textContent="Alinhamento "+a.name+" → "+b.name+": Inc "+inc.toFixed(2)+"° / Azi "+azi.toFixed(2)+"° (calculados; você pode editar os campos)."}
function fillT(){["f_tgt","f_tgt2"].forEach((id,n)=>{const s=$("#"+id),o=s.value;s.innerHTML=(n?'<option value="-1">— nenhum —</option>':"")+T.map((t,i)=>`<option value="${i}">${t.name}</option>`).join("");s.value=o||(n?"-1":"0")})}
function drawT(){$("#tg").innerHTML=T.map((t,i)=>`<div class="row" style="margin-bottom:6px"><label>Nome<input value="${t.name}" oninput="T[${i}].name=this.value;fillT()"></label>`+["tvd","ns","ew"].map(k=>`<label>${k==="tvd"?"TVD":k==="ns"?"N/S":"E/W"} (m)<input type="number" value="${t[k]}" oninput="T[${i}].${k}=+this.value"></label>`).join("")+`<button class="btn s" onclick="T.splice(${i},1);drawT();fillT()">×</button></div>`).join("")}
function addT(){T.push({name:"T"+(T.length+1),tvd:0,ns:0,ew:0});drawT();fillT()}
const tie=()=>{const g=i=>parseFloat($("#t_"+i).value)||0;return{md:g("md"),inc:g("inc"),azi:n360(g("azi")),tvd:g("tvd"),ns:g("ns"),ew:g("ew"),disp:0,dls:0,build:0,turn:0,tf:0,section:"Tie-in",target:""}};
function resetTie(){S=[tie()];LASTOPT=null;render();$("#vsaz").blur()}
function run(){const m=$("#msg");try{const sp=SPEC[cur].modes[$("#mode").value],v={};sp[1].forEach(([k])=>v[k]=parseFloat($("#f_"+k).value));
 need(!Object.values(v).some(isNaN),"Preencha todos os campos");const t=sp[2]?T[$("#f_tgt").value]:null;need(!sp[2]||t,"Defina um alvo");
 const base=S.slice(),p=S[S.length-1];O=S[0];NOTE="";if(cur==="opt"&&!RERUN)PB=[];const pts=SPEC[cur].fn(p,v,t,$("#mode").value);LASTOPT=cur==="opt"?{base,v:{...v},ti:$("#f_tgt").value,ti2:$("#f_tgt2").value,mode:$("#mode").value}:null;if(pts.start)S=[pts.start];
 pts.forEach(q=>{const tt=T.find(x=>Math.abs(q.tvd-x.tvd)<=.01&&Math.abs(q.ns-x.ns)<=.01&&Math.abs(q.ew-x.ew)<=.01);if(tt)q.target=tt.name;S.push(q)});
 m.className="msg ok";m.textContent=pts.length+" estação(ões) "+(RERUN?"recalculada(s) com project back.":"adicionada(s).")+(NOTE?" "+NOTE:"");render();const sh=cur==="opt"&&LASTOPT;$("#pb").classList.toggle("hid",!sh);if(sh)drawPB()}catch(e){m.className="msg err";m.textContent=e.message}}
const COLS=[["md","MD",2],["inc","Inc",2],["azi","Azi",2],["tvd","TVD",2],["ns","N/S",2],["ew","E/W",2],["disp","Afast.",2],["vs","VS",2],["dls","DLS",2],["build","Build",2],["turn","Turn",2],["tf","TF",1],["section","Seção"],["target","Alvo"]];
function vsOf(a){const u=parseFloat($("#vsaz").value),l=a[a.length-1],az=isNaN(u)?Math.atan2(l.ew-a[0].ew,l.ns-a[0].ns):u*R;a.forEach(q=>q.vs=(q.ns-a[0].ns)*Math.cos(az)+(q.ew-a[0].ew)*Math.sin(az))}
function tbl(a,src){vsOf(a);return"<table><thead><tr>"+COLS.map(c=>`<th>${c[1]}</th>`).join("")+"</tr></thead><tbody>"+a.map((q,i)=>`<tr data-s="${src}" data-i="${i}" onclick="sel('${src}',${i})">`+COLS.map(c=>`<td>${c[2]!==undefined?(+q[c[0]]).toFixed(c[2]):q[c[0]]}</td>`).join("")+"</tr>").join("")+"</tbody></table>"}
function render(){if(SEL&&SEL.src==="S"&&SEL.i>=S.length)SEL=null;$("#tbl").innerHTML=tbl(S,"S");const w=$("#tbl");w.scrollTop=w.scrollHeight;mark();drawCharts()}
function copyCsv(){vsOf(S);const s=[COLS.map(c=>c[1]).join(";"),...S.map(q=>COLS.map(c=>q[c[0]]).join(";"))].join("\n");navigator.clipboard.writeText(s).then(()=>{$("#msg").textContent="CSV copiado."},()=>{prompt("Copie o CSV:",s)})}
