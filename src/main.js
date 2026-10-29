import './style.css';

var FEE=300,S={cfg:{name:"Cuchumbal",weeks:16,start:""},people:[],nid:1,wheel:[],order:[]},MAX=50,busy=false,rot=0;
var API="/.netlify/functions/api",CRED=null,REV=0,PEND=0,VER=0,Q=Promise.resolve(),curTab=0;
function norm(){S.wheel=S.wheel||[];S.order=S.order||[];S.people=S.people||[];S.people.forEach(function(p){p.m=FEE})}
async function api(body){var r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({user:CRED.u,pass:CRED.p},body))});var j={};try{j=await r.json()}catch(e){}j.status=r.status;return j}
function push(){if(!CRED)return;VER++;PEND++;Q=Q.then(doPush).then(function(){PEND--},function(){PEND--})}
async function doPush(){var j;try{j=await api({action:"save",rev:REV,state:S})}catch(e){alert("No se pudo guardar en el servidor. Revisa tu conexión.");return}
 if(j.ok){REV=j.rev}else if(j.status==409){S=j.state||S;norm();REV=j.rev;render();alert("Otra persona hizo cambios al mismo tiempo. Se cargaron los datos más recientes; repite tu último cambio.")}else{alert("No se pudo guardar en el servidor.")}}
async function pull(quiet){var v=VER,j;try{j=await api({action:"get"})}catch(e){if(!quiet)alert("No se pudo conectar con el servidor.");return}
 if(!j.ok||v!==VER||PEND>0||(REV>0&&j.rev===REV))return;if(j.state){S=j.state;norm()}REV=j.rev||0;render()}
function save(){push()}
function $(i){return document.getElementById(i)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function L(n){return "L "+Number(n).toLocaleString("es-HN",{maximumFractionDigits:2})}
function nm(p){return p.n+" "+p.a}
function nz(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim()}
function paidN(p){return p.paid.filter(Boolean).length}
function turnOf(p){var o=S.order.filter(function(x){return nz(x.name)==nz(nm(p))})[0];return o?o.turn:0}
function potW(){var t=0;S.people.forEach(function(p){t+=p.m});return t}
function tab(i){for(var k=0;k<3;k++){$("p"+k).classList.toggle("hide",k!=i);$("t"+k).classList.toggle("on",k==i)}curTab=i}
function saveCfg(){S.cfg.name=$("cn").value.trim()||"Cuchumbal";var m=parseInt($("cw").value)||4;S.cfg.weeks=Math.min(24,Math.max(1,m))*4;S.cfg.start=$("cd").value;
 S.people.forEach(function(p){while(p.paid.length<S.cfg.weeks)p.paid.push(false);p.paid.length=S.cfg.weeks});save();render()}
function findP(t){var k=nz(t);return S.people.filter(function(p){return nz(nm(p))==k})[0]}
function fillDL(){$("dl").innerHTML=S.people.map(function(p){return "<option value=\""+esc(nm(p))+"\">"}).join("")}
function qSel(){var p=findP($("qs").value);if(p){$("pn").value=p.n;$("pa").value=p.a}qPrev()}
function qPrev(){var el=$("qi"),p=findP($("pn").value+" "+$("pa").value);
 if(!p){el.textContent=($("pn").value||$("pa").value)?"Persona nueva: se registrará con su primera cuota de "+L(FEE)+".":"";return}
 var k=paidN(p);el.textContent=nm(p)+": lleva "+L(k*FEE)+" de "+L(S.cfg.weeks*FEE)+" ("+k+" de "+S.cfg.weeks+" cuotas)"+(k>=S.cfg.weeks?" · COMPLETÓ el ahorro, no admite más cuotas.":" · la próxima será la cuota "+(k+1)+".")}
function addQuota(p){var i=p.paid.indexOf(false);if(i<0){alert(nm(p)+" ya completó "+L(S.cfg.weeks*FEE)+". No se aceptan más cuotas.");return false}p.paid[i]=true;return true}
function addP(){var n=$("pn").value.trim(),a=$("pa").value.trim();
 if(!n||!a){alert("Escribe nombre y apellido.");return}
 var ex=findP(n+" "+a),p=ex;
 if(ex){if(!addQuota(ex))return}
 else{if(S.people.length>=MAX){alert("Se alcanzó el máximo de "+MAX+" personas.");return}
  var pd=[];for(var i=0;i<S.cfg.weeks;i++)pd.push(false);pd[0]=true;p={id:S.nid++,n:n,a:a,m:FEE,paid:pd};S.people.push(p)}
 $("pn").value="";$("pa").value="";$("qs").value="";save();render();
 $("qi").textContent="✔ Cuota "+paidN(p)+" de "+S.cfg.weeks+" para "+nm(p)+": lleva "+L(paidN(p)*FEE)+(ex?"":" (persona nueva registrada).");$("pn").focus()}
function delP(id){var p=S.people.filter(function(x){return x.id==id})[0];askAuth("Eliminar a "+nm(p),function(){S.people=S.people.filter(function(x){return x.id!=id});save();render()})}
function setM(id,v){var p=S.people.filter(function(x){return x.id==id})[0];var m=parseFloat(v);if(m>0){p.m=m;save();render()}}
function tog(id,w){var p=S.people.filter(function(x){return x.id==id})[0];p.paid[w]=!p.paid[w];save();render()}
function inW(name){var k=nz(name);return S.wheel.some(function(x){return nz(x)==k})||S.order.some(function(o){return nz(o.name)==k})}
function addW(){var v=$("wn").value.trim().replace(/\s+/g," ");if(!v)return;if(inW(v)){alert("Ese nombre ya está en la ruleta o ya tiene turno.");return}S.wheel.push(v);$("wn").value="";$("wn").focus();save();render()}
function loadW(){var c=0;S.people.forEach(function(p){if(!inW(nm(p))){S.wheel.push(nm(p));c++}});if(!c)alert("No hay participantes nuevos para cargar.");save();render()}
function delW(i){S.wheel.splice(i,1);save();render()}
function undoLast(){if(busy||!S.order.length){return}var o=S.order[S.order.length-1];askAuth("Anular el turno "+o.turn+" de "+o.name,function(){S.order.pop();S.wheel.push(o.name);$("win").textContent="¿Quién será?";save();render()})}
function resetAll(){askAuth("Borrar TODOS los datos",function(){S={cfg:{name:"Cuchumbal",weeks:16,start:""},people:[],nid:1,wheel:[],order:[]};rot=0;save();render()})}
function drawWheel(){var c=$("cv"),x=c.getContext("2d"),n=S.wheel.length,R=170,seg=2*Math.PI/Math.max(n,1);
 x.clearRect(0,0,340,340);
 if(!n){x.beginPath();x.arc(R,R,R-4,0,7);x.fillStyle="#9aa89f55";x.fill();x.fillStyle="#888";x.font="16px system-ui";x.textAlign="center";x.fillText(S.order.length?"Todos tienen turno":"Agrega nombres",R,R);return}
 for(var i=0;i<n;i++){var a0=rot+i*seg;x.beginPath();x.moveTo(R,R);x.arc(R,R,R-4,a0,a0+seg);x.closePath();x.fillStyle="hsl("+(i*137.5%360)+",55%,42%)";x.fill();x.strokeStyle="#fff";x.lineWidth=1.5;x.stroke();
  x.save();x.translate(R,R);x.rotate(a0+seg/2);x.textAlign="right";x.fillStyle="#fff";x.font="600 "+(n>20?10:n>12?12:14)+"px system-ui";var t=S.wheel[i];if(t.length>18)t=t.slice(0,17)+"…";x.fillText(t,R-16,5);x.restore()}
 x.beginPath();x.arc(R,R,16,0,7);x.fillStyle="#fff";x.fill()}
function spin(){
 if(busy)return;var n=S.wheel.length;if(!n){alert(S.order.length?"Todos ya tienen turno.":"Agrega nombres a la ruleta primero.");return}
 var ar=new Uint32Array(1);(window.crypto||{getRandomValues:function(a){a[0]=Math.random()*4294967296}}).getRandomValues(ar);
 var idx=ar[0]%n,seg=2*Math.PI/n,TP=Math.PI*2,tgt=1.5*Math.PI-(idx+.5)*seg,cur=((rot%TP)+TP)%TP,d=((tgt-cur)%TP+TP)%TP+TP*6,start=rot,t0=null,dur=5000;busy=true;$("sp").disabled=true;
 function f(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/dur,1),e=1-Math.pow(1-p,3.5);rot=start+d*e;drawWheel();
  if(p<1)requestAnimationFrame(f);else{var name=S.wheel[idx];S.wheel.splice(idx,1);S.order.push({name:name,turn:S.order.length+1});rot=0;busy=false;$("sp").disabled=false;$("win").textContent="🎉 Turno "+S.order.length+": "+name;save();render(true)}}
 requestAnimationFrame(f)}
function weekLabel(i){if(!S.cfg.start)return "S"+(i+1);var d=new Date(S.cfg.start+"T00:00:00");d.setDate(d.getDate()+7*i);return "S"+(i+1)+"<br><span class=sub>"+d.toLocaleDateString("es-HN",{day:"2-digit",month:"short"})+"</span>"}
function renderStats(){
 var tot=0,exp=0;S.people.forEach(function(p){tot+=paidN(p)*p.m;exp+=p.m*S.cfg.weeks});
 $("stats").innerHTML=[["Participantes",S.people.length+" / mín. 25"],["Aporte por semana",L(potW())],["Total recolectado",L(tot)],["Meta total ("+S.cfg.weeks+" sem.)",L(exp)],["Turnos asignados",S.order.length+" de "+S.people.length]].map(function(x){return "<div class=st>"+x[0]+"<b>"+x[1]+"</b></div>"}).join("")}
function renderTables(){
 var H="<tr><th>Nombre</th><th>Ahorro semanal</th><th>Semanas pagadas</th><th>Lleva aportado</th><th>Falta</th><th>Turno</th><th></th></tr>";
 S.people.forEach(function(p,i){var k=paidN(p),tot=S.cfg.weeks*p.m,tn=turnOf(p);
  H+="<tr><td>"+(i+1)+". "+esc(nm(p))+"</td><td>"+L(p.m)+"</td><td>"+k+" / "+S.cfg.weeks+"<div class=bar><i style=\"width:"+(k/S.cfg.weeks*100)+"%\"></i></div></td><td><b>"+L(k*p.m)+"</b></td><td>"+L(tot-k*p.m)+"</td><td>"+(tn?"<span class=tag>Turno "+tn+"</span>":"—")+"</td><td><button class=d onclick=\"delP("+p.id+")\">Eliminar</button></td></tr>"});
 if(!S.people.length)H+="<tr><td colspan=7 class=sub>Aún no hay participantes.</td></tr>";
 $("tp").innerHTML=H;
 var W="<tr><th>Persona</th>";for(var i=0;i<S.cfg.weeks;i++)W+="<th>"+weekLabel(i)+"</th>";W+="<th>Aportado</th><th>Falta</th></tr>";
 S.people.forEach(function(p){var tn=turnOf(p);W+="<tr><td>"+esc(nm(p))+(tn?" <span class=tag>T"+tn+"</span>":"")+"<div class=sub>"+L(p.m)+" / semana</div></td>";
  for(var i=0;i<S.cfg.weeks;i++)W+="<td><input type=checkbox "+(p.paid[i]?"checked":"")+" onchange=\"tog("+p.id+","+i+")\"></td>";
  W+="<td><b>"+L(paidN(p)*p.m)+"</b></td><td>"+L((S.cfg.weeks-paidN(p))*p.m)+"</td></tr>"});
 if(!S.people.length)W+="<tr><td colspan=3 class=sub>Registra participantes para ver el control.</td></tr>";
 $("tw").innerHTML=W;
 var n=S.people.length;$("cap").textContent=n+" registrados · espacio para "+MAX+" · mínimo: 25"+(n<25?" (faltan "+(25-n)+")":" ✔")}
function renderWheelUI(){
 $("elig").textContent=S.wheel.length+" nombre(s) en la ruleta · "+S.order.length+" turno(s) ya sorteado(s).";
 $("wl").innerHTML=S.wheel.map(function(w,i){return "<span class=tag style='margin:2px;padding:3px 8px'>"+esc(w)+" <a href=# onclick='delW("+i+");return false' style='color:#fff;text-decoration:none'>✕</a></span>"}).join("");
 var R="<tr><th>Turno</th><th>Nombre</th><th>Recibe (semana "+"del turno)</th><th>En control</th><th></th></tr>";
 S.order.forEach(function(o,ix){var ok=S.people.some(function(p){return nz(nm(p))==nz(o.name)});R+="<tr><td><b>"+o.turn+"</b></td><td style='text-align:left'>"+esc(o.name)+"</td><td>"+L(potW())+"</td><td>"+(ok?"✔":"⚠ no coincide con un participante")+"</td><td><button class=d onclick=\"delTurn("+ix+")\">Quitar</button></td></tr>"});
 if(!S.order.length)R+="<tr><td colspan=5 class=sub>Todavía no se ha sorteado ningún turno.</td></tr>";
 $("tr").innerHTML=R}
function render(keep){fillDL();qPrev();$("cn").value=S.cfg.name;$("cw").value=S.cfg.weeks/4;$("cd").value=S.cfg.start||"";document.title=S.cfg.name;renderStats();renderTables();renderWheelUI();drawWheel()}
async function doLogin(){var e=$("le");e.textContent="";CRED={u:$("lu").value,p:$("lp").value};
 try{var j=await api({action:"login"});
  if(j.ok){showApp();await pull()}else{CRED=null;e.textContent=j.status==401?"Contraseña incorrecta.":"No se pudo conectar con el servidor.";$("lp").value=""}}
 catch(x){CRED=null;e.textContent="No se pudo conectar con el servidor."}}
var AUTHFN=null;
function askAuth(msg,fn){AUTHFN=fn;$("am").textContent=msg+". Solo el usuario autorizado puede confirmar.";$("au").value="";$("ap").value="";$("ae").textContent="";$("auth").classList.remove("hide");$("au").focus()}
function authCancel(){AUTHFN=null;$("auth").classList.add("hide")}
async function authOk(){var j;try{var r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"admin",user:$("au").value,pass:$("ap").value})});j=await r.json()}catch(x){$("ae").textContent="No se pudo validar.";return}
 if(j.ok){var f=AUTHFN;authCancel();if(f)f()}else{$("ae").textContent="Contraseña incorrecta.";$("ap").value=""}}
function delTurn(ix){var o=S.order[ix];if(!o)return;askAuth("Quitar el turno "+o.turn+" de "+o.name+" de la ruleta (no borra al participante)",function(){S.order.splice(ix,1);S.order.forEach(function(x,k){x.turn=k+1});save();render()})}
function clearWheel(){askAuth("Vaciar la ruleta (solo sus nombres y turnos; los participantes no se tocan)",function(){S.wheel=[];S.order=[];save();render()})}
function showApp(){$("login").classList.add("hide");$("app").classList.remove("hide")}
function logout(){CRED=null;REV=0;S={cfg:{name:"Cuchumbal",weeks:16,start:""},people:[],nid:1,wheel:[],order:[]};render();$("app").classList.add("hide");$("login").classList.remove("hide");$("lu").value="";$("lp").value=""}
render();tab(0);setInterval(function(){if(CRED&&!PEND&&!busy&&$("auth").classList.contains("hide"))pull(true)},15000);

// Funciones usadas por los eventos (onclick, oninput...) del HTML
Object.assign(window,{$,L,addP,addQuota,addW,api,askAuth,authCancel,authOk,clearWheel,delP,delTurn,delW,doLogin,doPush,drawWheel,esc,fillDL,findP,inW,loadW,logout,nm,norm,nz,paidN,potW,pull,push,qPrev,qSel,render,renderStats,renderTables,renderWheelUI,resetAll,save,saveCfg,setM,showApp,spin,tab,tog,turnOf,undoLast,weekLabel});
