const defaultMembers = [
    {
        name: "LÂM",
        color: "#7c3aed",
        photo: "images/lam.jpg"
    },
    {
        name: "THÀNH",
        color: "#2563eb",
        photo: "images/thanh.jpg"
    },
    {
        name: "THÚY",
        color: "#ec4899",
        photo: "images/thuy.jpg"
    },
    {
        name: "HIỂN",
        color: "#f59e0b",
        photo: "images/hien.jpg"
    }
];
let members=JSON.parse(localStorage.getItem("pbl_members"))||defaultMembers;
let tasks=JSON.parse(localStorage.getItem("pbl_tasks"))||[
 {id:1,title:"Hoàn thiện sơ đồ tư duy",desc:"Sửa theo nhận xét của thầy",member:"thuy",due:"2026-09-24",priority:"Gấp",status:"doing"},
 {id:2,title:"Tìm hiểu phương pháp đồng bộ 2 động cơ",desc:"So sánh PID, SMC và các phương pháp khác",member:"lam",due:"2026-09-26",priority:"Quan trọng",status:"doing"},
 {id:3,title:"Chuẩn bị slide PBL",desc:"Tổng hợp nội dung tuần 3-4",member:"thanh",due:"2026-09-28",priority:"Bình thường",status:"done"}
];
let notes=JSON.parse(localStorage.getItem("pbl_notes"))||[
 {id:1,title:"Hỏi thầy về phạm vi hệ thống",text:"Cần xác định rõ chức năng giám sát và đồng bộ 2 động cơ.",type:"question",member:"lam"},
 {id:2,title:"Ý tưởng",text:"Có thể thêm biểu đồ trạng thái 2 động cơ vào dashboard.",type:"idea",member:"thuy"}
];
let history=JSON.parse(localStorage.getItem("pbl_history"))||[];
const quotes=["Để tối tao làm.","Ủa deadline hôm nay hả?","Ai giữ file vậy?","Tưởng mày làm.","Để tao hỏi ChatGPT.","Cái này để tuần sau làm.","Nhóm mình họp 5 phút thôi nha..."];
let currentFilter="all",noteFilter="all",rotation=0,isSpinning=false;

document.addEventListener("DOMContentLoaded",()=>{
 document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
 document.querySelectorAll(".filter[data-filter]").forEach(b=>b.onclick=()=>{currentFilter=b.dataset.filter;document.querySelectorAll(".filter[data-filter]").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderTasks()});
 document.querySelectorAll(".filter[data-note-filter]").forEach(b=>b.onclick=()=>{noteFilter=b.dataset.noteFilter;document.querySelectorAll(".filter[data-note-filter]").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderNotes()});
 document.getElementById("themeBtn").onclick=toggleTheme;
 document.getElementById("today").textContent=new Date().toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"});
 renderAll();drawWheel();newQuote();renderSelectedMembers();
});

function save(){localStorage.setItem("pbl_tasks",JSON.stringify(tasks));localStorage.setItem("pbl_notes",JSON.stringify(notes));localStorage.setItem("pbl_history",JSON.stringify(history));localStorage.setItem("pbl_members",JSON.stringify(members))}
function showPage(id){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===id));if(id==="wheel"){drawWheel();renderSelectedMembers()}window.scrollTo({top:0,behavior:"smooth"})}
function member(id){return members.find(m=>m.id===id)||members[0]}
function initials(name){return name.split(" ").map(x=>x[0]).join("").slice(0,2)}
function avatar(m,cls="avatar"){return `<div class="${cls}" style="background:${m.color}">${m.photo?`<img src="${m.photo}">`:initials(m.name)}</div>`}
function renderAll(){renderDashboard();renderTasks();renderNotes();renderMembers();renderHistory()}
function renderDashboard(){
 const total=tasks.length,done=tasks.filter(t=>t.status==="done").length,doing=tasks.filter(t=>t.status==="doing").length;
 document.getElementById("statTotal").textContent=total;document.getElementById("statDone").textContent=done;document.getElementById("statDoing").textContent=doing;
 const due=tasks.filter(t=>t.status!=="done"&&new Date(t.due)-new Date()<3*864e5).length;document.getElementById("statDue").textContent=due;
 const pct=total?Math.round(done/total*100):0;document.getElementById("progressPercent").textContent=pct+"%";document.getElementById("progressBar").style.width=pct+"%";document.getElementById("progressText").textContent=`${done} / ${total} công việc`;
 document.getElementById("dashboardMembers").innerHTML=members.map(m=>`<div class="mini-member">${avatar(m)}<span>${m.name}</span></div>`).join("");
 const recent=[...tasks].sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,4);
 document.getElementById("recentTasks").innerHTML=recent.length?recent.map(t=>`<div class="task-row"><button class="check ${t.status==="done"?"done":""}" onclick="toggleTask(${t.id})">${t.status==="done"?"✓":""}</button><div class="info"><b>${escapeHtml(t.title)}</b><small>${member(t.member).name} · ${formatDate(t.due)}</small></div></div>`).join(""):`<p class="panel-head p">Chưa có công việc.</p>`;
}
function renderTasks(){
 const list=tasks.filter(t=>currentFilter==="all"||t.status===currentFilter);
 document.getElementById("taskList").innerHTML=list.length?list.map(t=>{const m=member(t.member);return `<article class="task-card"><span class="priority">${t.priority}</span><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.desc||"Không có mô tả")}</p><div class="meta"><span>${avatar(m)} ${m.name}</span><span>📅 ${formatDate(t.due)}</span></div><div class="task-actions"><button class="small-btn" onclick="toggleTask(${t.id})">${t.status==="done"?"↩ Mở lại":"✓ Hoàn thành"}</button><button class="small-btn" onclick="deleteTask(${t.id})">🗑 Xóa</button></div></article>`}).join(""):`<div class="panel"><p>Không có việc ở bộ lọc này.</p></div>`;
}
function renderNotes(){
 const list=notes.filter(n=>noteFilter==="all"||n.type===noteFilter);
 const labels={idea:"💡 Ý tưởng",question:"❓ Câu hỏi",important:"📌 Quan trọng"};
 document.getElementById("noteList").innerHTML=list.length?list.map(n=>`<article class="note-card"><span class="note-type">${labels[n.type]||"📝 Note"}</span><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.text)}</p><div class="meta"><span>${member(n.member).name}</span><button class="small-btn" onclick="deleteNote(${n.id})">Xóa</button></div></article>`).join(""):`<div class="panel"><p>Chưa có note.</p></div>`;
}
function renderMembers(){
 document.getElementById("memberGrid").innerHTML=members.map(m=>{const mine=tasks.filter(t=>t.member===m.id),done=mine.filter(t=>t.status==="done").length;return `<article class="member-card">${avatar(m)}<h3>${m.name}</h3><p>${m.role}</p><div class="member-stats"><div><b>${mine.length}</b><span>VIỆC</span></div><div><b>${done}</b><span>XONG</span></div></div></article>`}).join("");
}
function renderHistory(){document.getElementById("spinHistory").innerHTML=history.length?history.slice(0,8).map(h=>`<div class="history-item">🎯 <b>${escapeHtml(h.name)}</b> nhận <b>${escapeHtml(h.task||"việc chưa đặt tên")}</b><span>${h.time}</span></div>`).join(""):`<p>Chưa có lượt quay nào.</p>`}
function renderSelectedMembers(){document.getElementById("selectedMembers").innerHTML=members.map(m=>`<div class="mini-member">${avatar(m)} ${m.name}</div>`).join("")}

function openTaskModal(){
 document.getElementById("modalContent").innerHTML=`<h2>📋 Thêm công việc</h2><div class="form"><label>Tên công việc<input id="fTitle" placeholder="Ví dụ: Làm slide tuần 4"></label><label>Mô tả<textarea id="fDesc" rows="3" placeholder="Mô tả ngắn..."></textarea></label><label>Người thực hiện<select id="fMember">${members.map(m=>`<option value="${m.id}">${m.name}</option>`).join("")}</select></label><label>Deadline<input id="fDue" type="date"></label><label>Mức độ<select id="fPriority"><option>Bình thường</option><option>Quan trọng</option><option>Gấp</option></select></label><button class="primary" onclick="addTask()">Tạo công việc</button></div>`;
 openModal();
}
function addTask(){const title=document.getElementById("fTitle").value.trim();if(!title)return toast("Nhập tên công việc đã 😭");tasks.push({id:Date.now(),title,desc:document.getElementById("fDesc").value.trim(),member:document.getElementById("fMember").value,due:document.getElementById("fDue").value||new Date().toISOString().slice(0,10),priority:document.getElementById("fPriority").value,status:"doing"});save();closeModal();renderAll();toast("Đã thêm công việc ✅")}
function toggleTask(id){const t=tasks.find(x=>x.id===id);t.status=t.status==="done"?"doing":"done";save();renderAll()}
function deleteTask(id){if(confirm("Xóa công việc này?")){tasks=tasks.filter(t=>t.id!==id);save();renderAll();toast("Đã xóa công việc")}}
function openNoteModal(){document.getElementById("modalContent").innerHTML=`<h2>📝 Thêm note</h2><div class="form"><label>Tiêu đề<input id="nTitle" placeholder="Ví dụ: Ý tưởng mới"></label><label>Nội dung<textarea id="nText" rows="5" placeholder="Viết gì đó..."></textarea></label><label>Loại<select id="nType"><option value="idea">💡 Ý tưởng</option><option value="question">❓ Câu hỏi</option><option value="important">📌 Quan trọng</option></select></label><label>Người viết<select id="nMember">${members.map(m=>`<option value="${m.id}">${m.name}</option>`).join("")}</select></label><button class="primary" onclick="addNote()">Lưu note</button></div>`;openModal()}
function addNote(){const title=document.getElementById("nTitle").value.trim(),text=document.getElementById("nText").value.trim();if(!title||!text)return toast("Nhập đủ tiêu đề và nội dung nhé");notes.unshift({id:Date.now(),title,text,type:document.getElementById("nType").value,member:document.getElementById("nMember").value});save();closeModal();renderNotes();toast("Đã lưu note 📝")}
function deleteNote(id){notes=notes.filter(n=>n.id!==id);save();renderNotes();toast("Đã xóa note")}
function openModal(){document.getElementById("modal").classList.remove("hidden")}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function toggleTheme(){document.body.classList.toggle("light");localStorage.setItem("pbl_theme",document.body.classList.contains("light")?"light":"dark")}
if(localStorage.getItem("pbl_theme")==="light")document.body.classList.add("light");

function drawWheel(){
 const c=document.getElementById("wheelCanvas"),ctx=c.getContext("2d"),size=c.width,cx=size/2,cy=size/2,r=220;
 ctx.clearRect(0,0,size,size);const n=members.length,step=Math.PI*2/n;
 members.forEach((m,i)=>{const a=rotation+i*step-Math.PI/2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,a,a+step);ctx.closePath();ctx.fillStyle=m.color;ctx.fill();ctx.strokeStyle="#10172b";ctx.lineWidth=4;ctx.stroke();const mid=a+step/2;ctx.save();ctx.translate(cx+Math.cos(mid)*140,cy+Math.sin(mid)*140);ctx.rotate(mid+Math.PI/2);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="bold 17px Arial";ctx.fillText(m.name,0,0);ctx.restore()});
 ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle="#ffffff44";ctx.lineWidth=6;ctx.stroke();
}
function spinWheel(){
 if(isSpinning)return;
 isSpinning=true;const task=document.getElementById("wheelTask").value.trim()||"Một nhiệm vụ bí ẩn";
 const winner=Math.floor(Math.random()*members.length),step=Math.PI*2/members.length;
 const target=-winner*step-step/2;let start=rotation%(Math.PI*2);let delta=(target-start+Math.PI*2)%(Math.PI*2)+Math.PI*2*(5+Math.floor(Math.random()*3));const duration=4300,startTime=performance.now(),initial=start;
 function animate(now){const p=Math.min((now-startTime)/duration,1),ease=1-Math.pow(1-p,4);rotation=initial+delta*ease;drawWheel();if(p<1)requestAnimationFrame(animate);else{isSpinning=false;const m=members[winner];history.unshift({name:m.name,task,time:new Date().toLocaleString("vi-VN")});save();renderHistory();showWinner(m,task);}}
 requestAnimationFrame(animate);
}
function showWinner(m,task){document.getElementById("modalContent").innerHTML=`<div style="text-align:center"><div style="font-size:60px">🎉</div>${avatar(m,"avatar") }<h2 style="margin:15px 0 5px">${m.name} nhận nhiệm vụ!</h2><p style="color:#8f9ab8;margin-bottom:20px">"${escapeHtml(task)}"</p><button class="primary" onclick="assignWheelTask('${m.id}','${escapeAttr(task)}')">Xác nhận & tạo task</button></div>`;openModal()}
function assignWheelTask(memberId,task){tasks.push({id:Date.now(),title:task,desc:"Được phân công bằng vòng quay 🎡",member:memberId,due:new Date().toISOString().slice(0,10),priority:"Bình thường",status:"doing"});save();closeModal();renderAll();toast(`🎯 ${member(memberId).name} đã nhận việc!`)}
function newQuote(){document.getElementById("quote").textContent=`"${quotes[Math.floor(Math.random()*quotes.length)]}"`}
function formatDate(d){if(!d)return"--";return new Date(d+"T00:00:00").toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit"})}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.style.display="block";setTimeout(()=>el.style.display="none",2200)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function escapeAttr(s){return String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'")}
// =========================
// MOBILE MENU
// =========================

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileOverlay = document.getElementById("mobileOverlay");

function closeMobileMenu() {
    document.body.classList.remove("mobile-menu-open");
    
    if (mobileMenuBtn) {
        mobileMenuBtn.classList.remove("active");
    }
}

function toggleMobileMenu() {
    document.body.classList.toggle("mobile-menu-open");
    
    if (mobileMenuBtn) {
        mobileMenuBtn.classList.toggle("active");
    }
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
}

if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMobileMenu);
}

/* Chon menu xong thi tu dong dong sidebar tren dien thoai */
document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    });
});

/* Neu xoay/man hinh thay doi kich thuoc */
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});