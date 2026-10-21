'use strict';
let release=null;
const $=id=>document.getElementById(id),list=$('list'),toast=$('toast');
function say(text){toast.textContent=text;toast.classList.add('on');clearTimeout(say.timer);say.timer=setTimeout(()=>toast.classList.remove('on'),3000)}
function validRelease(d){return Number.isInteger(d.versionCode)&&d.versionCode>0&&Number.isInteger(d.releaseNumber)&&d.releaseNumber>0&&typeof d.versionName==='string'&&typeof d.apkUrl==='string'&&/^https:\/\/github\.com\/Malayalihere77\/app-updates\/releases\/download\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.apk$/.test(d.apkUrl)&&/^[a-f0-9]{64}$/.test(d.sha256)&&Number.isSafeInteger(d.sizeBytes)&&d.sizeBytes>0&&Array.isArray(d.changes)&&d.changes.every(s=>typeof s==='string')}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n}
function render(d){
 list.replaceChildren();const c=el('article','card');c.dataset.s=(d.versionName+' '+d.notes+' '+d.changes.join(' ')).toLowerCase();
 c.append(el('span','tag','Latest · V'+d.releaseNumber),el('h3','', 'MALAYALI time fixer'),el('p','meta',d.versionName+' · '+(d.sizeBytes/1048576).toFixed(2)+' MB · '+d.releasedAt),el('p','meta',d.notes));
 const changes=el('ul','chg');d.changes.forEach(t=>changes.append(el('li','',t)));c.append(changes,el('p','sha','SHA-256 '+d.sha256));
 const link=el('a','btn','Download APK · V'+d.releaseNumber);link.href=d.apkUrl;c.append(link);
 const row=el('div','row');row.style.marginTop='16px';const copy=el('button','mini','Copy download link');copy.onclick=()=>{if(navigator.clipboard)navigator.clipboard.writeText(d.apkUrl).then(()=>say('Download link copied'),()=>say('Could not copy. Use the Download APK button.'));else say('Use the Download APK button.')};
 const share=el('button','mini','Share');share.onclick=()=>{if(navigator.share)navigator.share({title:'MALAYALI time fixer',url:location.href}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(()=>say('Page link copied'),()=>say('Copy the page address from your browser.'));else say('Copy the page address from your browser.')};row.append(copy,share);c.append(row);list.append(c);
 $('latest').href=d.apkUrl;$('latest').textContent='Download APK · V'+d.releaseNumber;$('latest').removeAttribute('aria-disabled');
 $('feedStatus').textContent='Release details loaded';
}
async function load(){
 $('latest').setAttribute('aria-disabled','true');$('latest').textContent='Checking latest build…';
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const response=await fetch('update.json?t='+Date.now(),{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('Unavailable');const data=await response.json();if(!validRelease(data))throw Error('Invalid release');release=data;render(data)}
 catch(e){$('feedStatus').textContent='Release feed unavailable';$('latest').textContent='Release unavailable';list.replaceChildren(el('p','meta','Could not load release details. Check your connection and retry.'));const retry=el('button','mini','Retry');retry.onclick=load;list.append(retry)}finally{clearTimeout(timer)}
}
$('cb').onclick=()=>{const result=$('cres'),input=$('cv').value.trim();result.className='';if(!release){result.textContent='Release details are unavailable. Retry loading first.';return}const match=input.match(/^v?(\d+)$/i)||input.match(/^4\.0\.2-malayali\.(\d+)$/i);if(!match){result.textContent='Enter a build such as V14 or V15.';return}const n=Number(match[1]);if(n<1){result.textContent='Enter a build of V1 or later.';return}if(n<release.releaseNumber){result.className='up';result.textContent='Update available: V'+release.releaseNumber+'. Use Download APK above.'}else if(n===release.releaseNumber){result.className='ok';result.textContent='You are on the latest published build.'}else result.textContent='Your build is newer than the published release.'};
$('q').oninput=e=>{const query=e.target.value.trim().toLowerCase();list.querySelectorAll('.card').forEach(c=>c.hidden=!!query&&!c.dataset.s.includes(query))};
const RT=document.documentElement;try{const stored=localStorage.getItem('mh-theme');if(['light','dark'].includes(stored))RT.dataset.theme=stored}catch(e){}
$('tgl').onclick=()=>{const dark=RT.dataset.theme?RT.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;RT.dataset.theme=dark?'light':'dark';try{localStorage.setItem('mh-theme',RT.dataset.theme)}catch(e){}};
if(!/Android/i.test(navigator.userAgent))$('os').style.display='block';
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)'),sc=$('scene');let mx=0,my=0;
addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches)return;mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;sc.style.setProperty('--ry',(24+mx*50)+'deg');sc.style.setProperty('--rx',(-18-my*40)+'deg');const card=e.target.closest?.('.card');list.querySelectorAll('.card').forEach(c=>{if(c!==card)c.style.transform=''});if(card){const r=card.getBoundingClientRect();card.style.transform='rotateY('+((e.clientX-r.left)/r.width-.5)*10+'deg) rotateX('+(-((e.clientY-r.top)/r.height-.5)*10)+'deg)'}});
const canvas=$('fx'),ctx=canvas.getContext('2d');let W=0,H=0,ratio=1,frame=0,last=0;const particles=Array.from({length:80},()=>({x:(Math.random()-.5)*2200,y:(Math.random()-.5)*2200,z:1+Math.random()*999}));
function resize(){ratio=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*ratio;canvas.height=H*ratio;ctx.setTransform(ratio,0,0,ratio,0,0)}
function animate(now){frame=0;if(document.hidden||reduced.matches)return;const dt=Math.min(now-last||16,50);last=now;ctx.clearRect(0,0,W,H);for(const p of particles){p.z-=dt*.065;if(p.z<=1)p.z=1000;const k=500/p.z;ctx.fillStyle='rgba(255,165,40,'+(1-p.z/1000)*.55+')';ctx.beginPath();ctx.arc(W/2+(p.x-mx*200)*k,H/2+(p.y-my*200)*k,Math.max(.4,(1-p.z/1000)*2.4),0,Math.PI*2);ctx.fill()}const d=new Date();$('hs').style.transform='rotate('+(d.getSeconds()+d.getMilliseconds()/1000)*6+'deg)';$('hm').style.transform='rotate('+(d.getMinutes()+d.getSeconds()/60)*6+'deg)';frame=requestAnimationFrame(animate)}
function motion(){cancelAnimationFrame(frame);frame=0;last=0;if(reduced.matches)ctx.clearRect(0,0,W,H);else if(!document.hidden)frame=requestAnimationFrame(animate)}
addEventListener('resize',resize);document.addEventListener('visibilitychange',motion);reduced.addEventListener('change',motion);resize();motion();load();
