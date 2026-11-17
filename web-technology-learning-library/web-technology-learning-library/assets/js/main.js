/* Shared logic: theme, layout, search, progress, rendering. */
const U=window.UNITS,KEY='wtl-done',REC='wtl-recent',TH='wtl-theme';
const $=s=>document.querySelector(s);
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))||(k===REC?[]:{})}catch(e){return k===REC?[]:{}}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const tid=(u,i)=>`u${u}-t${i}`;
const page=document.body.dataset.page,cur=+document.body.dataset.unit||0;
try{document.documentElement.dataset.theme=localStorage.getItem(TH)||'dark'}catch(e){}

function paint(){ // update every progress widget
  const d=ld(KEY);let C=0,T=0;
  const set=(k,c,t)=>{const p=Math.round(100*c/t);
    document.querySelectorAll(`[data-pct="${k}"]`).forEach(e=>e.textContent=p+'%');
    document.querySelectorAll(`[data-bar="${k}"]`).forEach(e=>e.style.width=p+'%');
    document.querySelectorAll(`[data-done="${k}"]`).forEach(e=>e.textContent=c);};
  U.forEach(u=>{const c=u.topics.filter((_,i)=>d[tid(u.n,i)]).length;C+=c;T+=u.topics.length;set(u.n,c,u.topics.length)});
  set(0,C,T);
}
function topicHTML(u,t,i){
  const done=ld(KEY)[tid(u.n,i)];
  return `<article class="topic" id="${tid(u.n,i)}"><h3>${i+1}. ${esc(t[0])}</h3>
  <label class="chk"><input type="checkbox" data-id="${tid(u.n,i)}" ${done?'checked':''}> Mark as completed</label>
  <p class="def"><b>Definition:</b> ${esc(t[1])}</p>
  <ul>${t[2].split('|').map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
  <details><summary>Practice question</summary><p>Explain "${esc(t[0])}" with a suitable example.</p></details></article>`;
}
function unitMain(u){
  const p=U[u.n-2],n=U[u.n];
  return `<h1>Unit ${u.n}: ${esc(u.title)}</h1><p>${esc(u.desc)}</p>
  <p class="meta">Duration: ${u.dur} &nbsp; Topics: ${u.topics.length} &nbsp; Progress: <b data-pct="${u.n}"></b></p>
  <div class="bar"><i data-bar="${u.n}"></i></div>
  ${u.topics.map((t,i)=>topicHTML(u,t,i)).join('')}
  <section class="topic" id="revision"><h2>Quick Revision</h2><dl>${u.topics.map(t=>`<dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd>`).join('')}</dl></section>
  <div class="pn">${p?`<a class="btn" href="unit-${p.n}.html">Previous: Unit ${p.n}</a>`:'<span></span>'}<a class="btn" href="index.html">Back to Dashboard</a>${n?`<a class="btn" href="unit-${n.n}.html">Next: Unit ${n.n}</a>`:'<span></span>'}</div>`;
}
function homeMain(){
  const d=ld(KEY);let next=null,T=0;
  U.forEach(u=>u.topics.forEach((t,i)=>{T++;if(!next&&!d[tid(u.n,i)])next={u,t,i}}));
  const rec=ld(REC).map(id=>{const m=id.match(/u(\d)-t(\d+)/);return m&&U[m[1]-1]?{u:U[m[1]-1],i:+m[2]}:null}).filter(Boolean);
  return `<h1>Welcome to Web Technology Learning Library</h1><p>Your complete learning companion for understanding modern web technologies.</p>
  <div class="stats"><div><b>5</b>Total Units</div><div><b>${T}</b>Total Topics</div><div><b data-done="0"></b>Completed</div><div><b data-pct="0"></b>Overall Progress</div></div>
  <div class="bar"><i data-bar="0"></i></div>
  <div class="cards">${U.map(u=>`<div class="card"><h3>Unit ${u.n}</h3><p>${esc(u.title)}</p><p class="meta">${u.topics.length} topics &nbsp; Duration: ${u.dur}</p><div class="bar"><i data-bar="${u.n}"></i></div><p><b data-pct="${u.n}"></b> complete</p><a class="btn" href="unit-${u.n}.html">Open Unit</a></div>`).join('')}</div>
  <h2>Quick navigation</h2><ul>
  <li>${next?`<a href="unit-${next.u.n}.html#${tid(next.u.n,next.i)}">Continue Learning: ${esc(next.t[0])}</a>`:'All topics completed'}</li>
  <li>Recently studied: ${rec.length?rec.map(r=>`<a href="unit-${r.u.n}.html#${tid(r.u.n,r.i)}">${esc(r.u.topics[r.i][0])}</a>`).join(', '):'none yet'}</li>
  <li>Search topics: use the search bar above</li>
  <li>Quick Revision: ${U.map(u=>`<a href="unit-${u.n}.html#revision">Unit ${u.n}</a>`).join(', ')}</li></ul>`;
}
function build(){
  const u=U[cur-1];
  $('#app').innerHTML=`<header class="top"><button id="menu" aria-label="Toggle menu">&#9776;</button><a class="logo" href="index.html">Web Technology Library</a>
  <div class="sw"><input id="q" type="search" placeholder="Search topics" aria-label="Search topics" autocomplete="off"><div id="res"></div></div>
  <span class="pp">Progress <b data-pct="0"></b></span><button id="th" aria-label="Toggle light or dark theme">Theme</button></header>
  <div class="wrap"><nav id="side" aria-label="Units"><a href="index.html" ${page==='home'?'aria-current="page"':''}>Dashboard</a>
  ${U.map(x=>`<a href="unit-${x.n}.html" ${x.n===cur?'aria-current="page"':''}>Unit ${x.n} <small data-pct="${x.n}"></small></a>`).join('')}
  ${u?'<hr>'+u.topics.map((t,i)=>`<a class="sub" href="#${tid(u.n,i)}">${esc(t[0])}</a>`).join(''):''}</nav>
  <main id="main">${u?unitMain(u):homeMain()}</main></div>`;
  paint();
  $('#th').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem(TH,t)}catch(e){}};
  $('#menu').onclick=()=>$('#side').classList.toggle('open');
  $('#main').addEventListener('change',e=>{const id=e.target.dataset.id;if(!id)return;
    const d=ld(KEY);if(e.target.checked){d[id]=1;const r=ld(REC).filter(x=>x!==id);r.unshift(id);sv(REC,r.slice(0,5))}else delete d[id];sv(KEY,d);paint();});
  $('#q').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase(),box=$('#res');
    if(!q){box.innerHTML='';return}
    const hits=[];U.forEach(x=>x.topics.forEach((t,i)=>{if((t[0]+t[1]+t[2]).toLowerCase().includes(q))hits.push({x,t,i})}));
    box.innerHTML=hits.slice(0,8).map(h=>`<a href="unit-${h.x.n}.html#${tid(h.x.n,h.i)}"><b>${esc(h.t[0])}</b> (Unit ${h.x.n})<br><small>${esc(h.t[1].slice(0,80))}...</small></a>`).join('')||'<p>No topics found</p>';});
  if(location.hash){const el=document.getElementById(location.hash.slice(1));if(el)el.scrollIntoView()}
}
build();
