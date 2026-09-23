const $=id=>document.getElementById(id);
const birthday=new Date(2026,3,17);
const defaults=[
 {date:"2026-07-11",weight:1.35},
 {date:"2026-08-01",weight:1.85},
 {date:"2026-08-22",weight:2.37},
 {date:"2026-09-23",weight:3.00}
];
function load(key,fallback){try{let v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:fallback}catch(e){return fallback}}
function save(key,v){localStorage.setItem(key,JSON.stringify(v))}
let weights=load("yoyoWeightsV2",[...defaults]);
let litter=load("yoyoLitterV2",[]);
let temps=load("yoyoTempsV2",[]);
let deworms=load("yoyoDewormsV2",[]);
const cn=d=>{let[y,m,day]=d.split("-").map(Number);return `${y}年${m}月${day}日`};
const short=d=>{let[,m,day]=d.split("-").map(Number);return `${m}/${day}`};
const todayValue=()=>{let n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`};

function renderAge(){let t=new Date(),y=t.getFullYear()-birthday.getFullYear(),m=t.getMonth()-birthday.getMonth(),d=t.getDate()-birthday.getDate();if(d<0){d+=new Date(t.getFullYear(),t.getMonth(),0).getDate();m--}if(m<0){m+=12;y--}$("age").textContent=(y?y+"岁":"")+(m?m+"个月":"")+d+"天"}

function renderWeights(){
 let a=[...weights].sort((a,b)=>new Date(a.date)-new Date(b.date)),last=a.at(-1);
 $("currentWeight").textContent=last?last.weight.toFixed(2)+" kg":"-- kg";
 $("latestWeightDate").textContent=last?"最后更新："+cn(last.date):"最后更新：--";
 $("weightCount").textContent=`共 ${a.length} 条记录`;
 if($("recentWeightList")){
   $("recentWeightList").innerHTML=[...a].reverse().slice(0,3).map(r=>`<div class="preview-row"><span>${cn(r.date)}</span><b>${r.weight.toFixed(2)} kg</b></div>`).join("");
 }
 $("weightList").innerHTML=[...a].reverse().map(r=>`<div class="weight-row"><span>${cn(r.date)}</span><strong>${r.weight.toFixed(2)} kg</strong><button class="delete" data-weight="${r.date}">删除</button></div>`).join("");
 drawChart(a);
}

function drawChart(a){
 let c=$("weightChart"),box=c.parentElement,w=Math.max(300,box.clientWidth),h=Math.max(210,box.clientHeight),dpr=devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;let x=c.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);if(!a.length)return;
 let L=44,R=16,T=35,B=38,W=w-L-R,H=h-T-B,vs=a.map(r=>r.weight),min=Math.max(0,Math.floor((Math.min(...vs)-.35)*2)/2),max=Math.ceil((Math.max(...vs)+.45)*2)/2,range=Math.max(1,max-min),px=i=>a.length===1?L+W/2:L+i*W/(a.length-1),py=v=>T+H-(v-min)/range*H;
 for(let i=0;i<=4;i++){let yy=T+H*i/4,v=max-range*i/4;x.beginPath();x.strokeStyle="#e7edf5";x.moveTo(L,yy);x.lineTo(w-R,yy);x.stroke();x.fillStyle="#8795a8";x.font="12px Arial";x.textAlign="right";x.fillText(v.toFixed(1),L-8,yy+4)}
 x.beginPath();a.forEach((r,i)=>i?x.lineTo(px(i),py(r.weight)):x.moveTo(px(i),py(r.weight)));x.lineTo(px(a.length-1),T+H);x.lineTo(px(0),T+H);x.closePath();let g=x.createLinearGradient(0,T,0,T+H);g.addColorStop(0,"rgba(37,136,245,.2)");g.addColorStop(1,"rgba(37,136,245,.02)");x.fillStyle=g;x.fill();
 x.beginPath();a.forEach((r,i)=>i?x.lineTo(px(i),py(r.weight)):x.moveTo(px(i),py(r.weight)));x.strokeStyle="#2588f5";x.lineWidth=3;x.stroke();
 a.forEach((r,i)=>{let xx=px(i),yy=py(r.weight);x.beginPath();x.arc(xx,yy,5,0,Math.PI*2);x.fillStyle="#2588f5";x.fill();x.fillStyle="#10284d";x.font="bold 12px Arial";x.textAlign="center";x.fillText(r.weight.toFixed(2)+"kg",xx,yy-10);x.fillStyle="#8290a3";x.font="12px Arial";x.fillText(short(r.date),xx,T+H+21)})
}

function renderLitter(){
 let a=[...litter].sort((a,b)=>new Date(b.date)-new Date(a.date)),last=a[0];
 $("lastLitterDate").textContent=last?cn(last.date):"暂无";
 if(last){let d1=new Date(last.date+"T00:00:00"),d2=new Date();let days=Math.max(0,Math.floor((d2-d1)/86400000));$("litterDays").textContent=days+"天"}else $("litterDays").textContent="--";
 $("litterList").innerHTML=a.length?a.map(r=>`<div class="simple-row"><div><strong>${cn(r.date)}</strong><small>完整更换猫砂</small></div><span></span><button class="delete" data-litter="${r.date}">删除</button></div>`).join(""):`<p class="empty">还没有猫砂更换记录。</p>`;
}

function renderTemps(){
 let a=[...temps].sort((a,b)=>new Date(b.date)-new Date(a.date)),last=a[0];
 $("latestTemp").textContent=last?`最近：${last.temp.toFixed(1)}℃ · ${cn(last.date)}`:"最近：暂无记录";
 $("tempList").innerHTML=a.length?a.map(r=>`<div class="simple-row"><div><strong>${cn(r.date)}</strong><small>体温测量</small></div><b>${r.temp.toFixed(1)} ℃</b><button class="delete" data-temp="${r.date}">删除</button></div>`).join(""):`<p>还没有体温记录。</p>`;
}

function renderDeworms(){
 let a=[...deworms].sort((a,b)=>new Date(b.date)-new Date(a.date));
 $("dewormList").innerHTML=a.length?a.map((r,i)=>`<div class="simple-row"><div><strong>${cn(r.date)}</strong><small>${r.type}</small></div><b>${r.drug}</b><button class="delete" data-deworm="${i}">删除</button></div>`).join(""):`<p>还没有驱虫药使用记录。</p>`;
}

function render(){renderAge();renderWeights();renderLitter();renderTemps();renderDeworms()}

document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));b.classList.add("active");let target=$(b.dataset.page);target.classList.add("active");target.classList.remove("page-enter");void target.offsetWidth;target.classList.add("page-enter");scrollTo({top:0,behavior:"smooth"});if(b.dataset.page==="homePage")setTimeout(renderWeights,50)});

function openModal(id){$(id).classList.add("show")}
function closeModal(el){el.closest(".modal").classList.remove("show")}
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b));
document.querySelectorAll(".modal").forEach(m=>m.onclick=e=>{if(e.target===m)m.classList.remove("show")});

$("addWeightBtn").onclick=()=>{$("weightDate").value=todayValue();$("weightInput").value="";openModal("weightModal")};
$("saveWeightBtn").onclick=()=>{let date=$("weightDate").value,w=parseFloat($("weightInput").value);if(!date)return alert("请选择日期");if(!Number.isFinite(w)||w<=0)return alert("请输入正确体重");let old=weights.find(r=>r.date===date);if(old){if(!confirm(`${cn(date)} 已有 ${old.weight.toFixed(2)} kg，是否修改？`))return;old.weight=w}else weights.push({date,weight:w});save("yoyoWeightsV2",weights);$("weightModal").classList.remove("show");renderWeights()};

$("addLitterBtn").onclick=()=>{$("litterDate").value=todayValue();openModal("litterModal")};
$("saveLitterBtn").onclick=()=>{let date=$("litterDate").value;if(!date)return alert("请选择日期");if(litter.some(r=>r.date===date))return alert("这一天已经记录过猫砂更换");litter.push({date});save("yoyoLitterV2",litter);$("litterModal").classList.remove("show");renderLitter()};

$("addTempBtn").onclick=()=>{$("tempDate").value=todayValue();$("tempInput").value="";openModal("tempModal")};
$("saveTempBtn").onclick=()=>{let date=$("tempDate").value,t=parseFloat($("tempInput").value);if(!date)return alert("请选择日期");if(!Number.isFinite(t))return alert("请输入体温");let old=temps.find(r=>r.date===date);if(old){if(!confirm("当天已有体温记录，是否修改？"))return;old.temp=t}else temps.push({date,temp:t});save("yoyoTempsV2",temps);$("tempModal").classList.remove("show");renderTemps()};

$("addDewormBtn").onclick=()=>{$("dewormDate").value=todayValue();$("dewormDrug").value="";openModal("dewormModal")};
$("saveDewormBtn").onclick=()=>{let date=$("dewormDate").value,drug=$("dewormDrug").value.trim(),type=$("dewormType").value;if(!date)return alert("请选择日期");if(!drug)return alert("请输入药品名称");deworms.push({date,drug,type});save("yoyoDewormsV2",deworms);$("dewormModal").classList.remove("show");renderDeworms()};

$("weightList").onclick=e=>{let b=e.target.closest("[data-weight]");if(b&&confirm("确定删除这条体重记录吗？")){weights=weights.filter(r=>r.date!==b.dataset.weight);save("yoyoWeightsV2",weights);renderWeights()}};
$("litterList").onclick=e=>{let b=e.target.closest("[data-litter]");if(b&&confirm("确定删除这条猫砂更换记录吗？")){litter=litter.filter(r=>r.date!==b.dataset.litter);save("yoyoLitterV2",litter);renderLitter()}};
$("tempList").onclick=e=>{let b=e.target.closest("[data-temp]");if(b&&confirm("确定删除这条体温记录吗？")){temps=temps.filter(r=>r.date!==b.dataset.temp);save("yoyoTempsV2",temps);renderTemps()}};
$("dewormList").onclick=e=>{let b=e.target.closest("[data-deworm]");if(b&&confirm("确定删除这条驱虫记录吗？")){let sorted=[...deworms].sort((a,b)=>new Date(b.date)-new Date(a.date));let target=sorted[Number(b.dataset.deworm)];deworms=deworms.filter(r=>r!==target);save("yoyoDewormsV2",deworms);renderDeworms()}};
let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{if($("homePage").classList.contains("active"))renderWeights()},120)});
render();
let deferredInstallPrompt=null;
const installBtn=document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  if(installBtn) installBtn.hidden=false;
});
if(installBtn){
  installBtn.addEventListener("click",async()=>{
    if(!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt=null;
    installBtn.hidden=true;
  });
}
window.addEventListener("appinstalled",()=>{if(installBtn) installBtn.hidden=true;});

document.querySelectorAll("[data-jump]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const el=document.getElementById(btn.dataset.jump);
    if(el) el.scrollIntoView({behavior:"smooth",block:"start"});
  });
});
document.querySelectorAll("[data-page-jump]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const id=btn.dataset.pageJump;
    document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===id));
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    const page=document.getElementById(id);
    if(page){page.classList.add("active","page-enter");window.scrollTo({top:0,behavior:"smooth"});}
  });
});

function renderHomeLitterSummary(){
  const dateEl=document.getElementById("homeLitterDate"),daysEl=document.getElementById("homeLitterDays");
  if(!dateEl||!daysEl)return;
  const a=[...litter].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!a.length){dateEl.textContent="暂无记录";daysEl.textContent="点击进入记录";return;}
  dateEl.textContent=cn(a[0].date);
  const days=Math.max(0,Math.floor((new Date()-new Date(a[0].date+"T00:00:00"))/86400000));
  daysEl.textContent=`距离上次 ${days} 天`;
}
const oldRenderLitter=renderLitter;
renderLitter=function(){oldRenderLitter();renderHomeLitterSummary();}
document.querySelectorAll("[data-open-modal]").forEach(btn=>{
 btn.addEventListener("click",e=>{e.stopPropagation();openModal(btn.dataset.openModal);});
});
renderHomeLitterSummary();


/* ===== V6 Supabase 云同步层 ===== */
const SUPABASE_URL="https://btdjcbfiduzksworixnb.supabase.co";
const SUPABASE_KEY="sb_publishable_KdIKiyROgTb2QV5hfz8Odw_yaHmGynp";
const cloud=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
let cloudReady=false,cloudBusy=false;
const $c=id=>document.getElementById(id);
function cloudStatus(ok,text){
 const pill=document.querySelector(".cloud-pill");
 if(pill)pill.classList.toggle("online",!!ok);
 if($c("cloudState"))$c("cloudState").textContent=text;
}
function showAuth(show){if($c("cloudAuth"))$c("cloudAuth").classList.toggle("hidden",!show)}
async function cloudLogin(){
 const email=$c("cloudEmail").value.trim(),password=$c("cloudPassword").value;
 const msg=$c("cloudLoginMsg");
 if(!email||!password){msg.textContent="请输入邮箱和密码";return}
 $c("cloudLoginBtn").disabled=true; msg.textContent="正在登录…";
 try{
   const {data,error}=await cloud.auth.signInWithPassword({email,password});
   if(error)throw error;
   if(!data.session)throw new Error("登录成功但未获得会话");
   msg.textContent="登录成功，正在同步…";
   showAuth(false);
   setTimeout(()=>cloudBoot(),0);
 }catch(e){
   msg.textContent="登录失败："+(e?.message||String(e));
 }finally{
   $c("cloudLoginBtn").disabled=false;
 }
}
async function cloudBoot(){
 if(cloudBusy)return;
 cloudBusy=true; cloudStatus(false,"同步中…");
 try{
   const {data:{user},error:userErr}=await cloud.auth.getUser();
   if(userErr || !user){
     showAuth(true); cloudReady=false; cloudStatus(false,"未登录");
     return;
   }
   showAuth(false);

   let {data:w,error:we}=await cloud.from("weights").select("*").order("record_date");
   if(we)throw we;

   if(!w.length){
     const seed=[
       {record_date:"2026-07-11",weight:1.35},
       {record_date:"2026-08-01",weight:1.85},
       {record_date:"2026-08-22",weight:2.37},
       {record_date:"2026-09-23",weight:3.00}
     ];
     const {error:seedErr}=await cloud.from("weights").insert(seed);
     if(seedErr)throw seedErr;
     const seeded=await cloud.from("weights").select("*").order("record_date");
     if(seeded.error)throw seeded.error;
     w=seeded.data||[];
   }

   const [lr,tr,dr]=await Promise.all([
     cloud.from("litter_records").select("*").order("record_date"),
     cloud.from("temperature_records").select("*").order("record_date"),
     cloud.from("deworming_records").select("*").order("record_date")
   ]);
   if(lr.error)throw lr.error;
   if(tr.error)throw tr.error;
   if(dr.error)throw dr.error;

   weights=(w||[]).map(x=>({date:x.record_date,weight:Number(x.weight)}));
   litter=(lr.data||[]).map(x=>({date:x.record_date}));
   temps=(tr.data||[]).map(x=>({date:x.record_date,temp:Number(x.temperature)}));
   deworms=(dr.data||[]).map(x=>({date:x.record_date,drug:x.medicine,type:x.deworm_type}));

   localStorage.setItem("yoyoWeightsV2",JSON.stringify(weights));
   localStorage.setItem("yoyoLitterV2",JSON.stringify(litter));
   localStorage.setItem("yoyoTempsV2",JSON.stringify(temps));
   localStorage.setItem("yoyoDewormsV2",JSON.stringify(deworms));

   renderWeights(); renderLitter(); renderTemps(); renderDeworms();
   cloudReady=true; cloudStatus(true,"云端已同步");
 }catch(e){
   console.error("YOYO cloudBoot:",e);
   cloudReady=false;
   cloudStatus(false,"同步失败");
   const msg=$c("cloudLoginMsg");
   if(msg)msg.textContent="同步失败："+(e?.message||String(e));
 }finally{
   cloudBusy=false;
 }
}
async function cloudRefresh(){if(cloudReady)await cloudBoot()}

/* 捕获本地记录变化，同步到云端。用事件后的 localStorage 快照进行 upsert/delete 对齐。 */
let lastSnapshots={};
function snapshot(){
 return {
  weights:JSON.parse(localStorage.getItem("yoyoWeightsV2")||"[]"),
  litter:JSON.parse(localStorage.getItem("yoyoLitterV2")||"[]"),
  temps:JSON.parse(localStorage.getItem("yoyoTempsV2")||"[]"),
  deworms:JSON.parse(localStorage.getItem("yoyoDewormsV2")||"[]")
 };
}
async function reconcileCloud(){
 if(!cloudReady)return;
 const s=snapshot();
 try{
   // weights
   let cw=(await cloud.from("weights").select("id,record_date")).data||[];
   let dates=new Set(s.weights.map(x=>x.date));
   for(const r of cw)if(!dates.has(r.record_date))await cloud.from("weights").delete().eq("id",r.id);
   if(s.weights.length)await cloud.from("weights").upsert(s.weights.map(x=>({record_date:x.date,weight:x.weight})),{onConflict:"record_date"});
   // litter
   let cl=(await cloud.from("litter_records").select("id,record_date")).data||[];
   dates=new Set(s.litter.map(x=>x.date));
   for(const r of cl)if(!dates.has(r.record_date))await cloud.from("litter_records").delete().eq("id",r.id);
   if(s.litter.length)await cloud.from("litter_records").upsert(s.litter.map(x=>({record_date:x.date})),{onConflict:"record_date"});
   // temps
   let ct=(await cloud.from("temperature_records").select("id,record_date")).data||[];
   dates=new Set(s.temps.map(x=>x.date));
   for(const r of ct)if(!dates.has(r.record_date))await cloud.from("temperature_records").delete().eq("id",r.id);
   if(s.temps.length)await cloud.from("temperature_records").upsert(s.temps.map(x=>({record_date:x.date,temperature:x.temp})),{onConflict:"record_date"});
   // deworm: table lacks unique date, replace whole small set for deterministic sync
   await cloud.from("deworming_records").delete().gte("id",0);
   if(s.deworms.length)await cloud.from("deworming_records").insert(s.deworms.map(x=>({record_date:x.date,medicine:x.drug,deworm_type:x.type})));
   cloudStatus(true,"云端已同步");
 }catch(e){console.error(e);cloudStatus(false,"待同步")}
}
document.addEventListener("click",()=>setTimeout(reconcileCloud,450));
document.addEventListener("submit",()=>setTimeout(reconcileCloud,450));

$c("cloudLoginBtn")?.addEventListener("click",cloudLogin);
$c("cloudPassword")?.addEventListener("keydown",e=>{if(e.key==="Enter")cloudLogin()});
$c("cloudLogoutBtn")?.addEventListener("click",async()=>{await cloud.auth.signOut();cloudReady=false;showAuth(true);cloudStatus(false,"未登录")});
cloud.auth.onAuthStateChange((event,session)=>{
  if(event==="SIGNED_OUT"){cloudReady=false;showAuth(true);cloudStatus(false,"未登录");}
  if(event==="TOKEN_REFRESHED"){cloudStatus(true,"云端已同步");}
});
setTimeout(()=>cloudBoot(),0);
