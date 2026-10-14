import {$,$$,reduced,fine,S} from './state.js';
import {P,BADGE,CATS} from './projects.js';
/* ---- Projetos (dados em projects.js) ---- */
const G=['linear-gradient(135deg,#5b2bd9,#8b63ff)','linear-gradient(135deg,#ff6b4a,#ff9a6b)','linear-gradient(135deg,#2a0f7a,#5b2bd9)','linear-gradient(135deg,#ff6b4a,#5b2bd9)','linear-gradient(135deg,#7a4dff,#ff6b4a)','linear-gradient(135deg,#1b1233,#5b2bd9)'];
const tl=(p,i,c)=>{const im=p.img,st=`style="--g:${G[i%6]}"`,k=`tile ${p.soon?'soon ':''}${im?'has-img ':''}${c}`.trim(),n='0'+(i+1),
inner=(im?`<img src="${im.src}" srcset="${im.srcset}" sizes="(min-width:700px) 300px,78vw" width="${im.w}" height="${im.h}" alt="" loading="lazy" decoding="async"${p.pos?` style="object-position:${p.pos}"`:''}><i class="scrim"></i>`:'')+`<em>${p.cat}</em><b>${p.title}</b><small>${p.soon?'Em breve':BADGE}</small>`;
return p.href?`<a class="${k}" href="${p.href}" data-n="${n}" ${st}>${inner}</a>`:`<article class="${k}" data-n="${n}" ${st} aria-hidden="true">${inner}</article>`};
const draw=(f,c)=>{$('#pgrid').innerHTML=P.map((p,i)=>f==='Todos'||p.cat===f?tl(p,i,c):'').join('')};
$('#strip').innerHTML=P.slice(0,5).map((p,i)=>tl(p,i,'rv')).join('');draw('Todos','rv');
const fl=$('#fl');fl.innerHTML=['Todos',...CATS].map((c,i)=>`<button class="fb${i?'':' on'}" type="button">${c}</button>`).join('');
fl.addEventListener('click',e=>{const b=e.target.closest('.fb');if(!b)return;$$('.fb',fl).forEach(x=>x.classList.remove('on'));b.classList.add('on');draw(b.textContent,'');S.gsap&&S.gsap.from('#pgrid .tile',{y:36,opacity:0,scale:.94,duration:.6,stagger:.06,ease:'power3.out'})});

/* ---- Privacidade ---- */
const d=$('#pv'),op=()=>{d.showModal?(d.open||d.showModal()):d.setAttribute('open','');S.lenis&&S.lenis.stop()},cl=()=>d.close?d.close():d.removeAttribute('open');
d.addEventListener('close',()=>S.lenis&&S.lenis.start());
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-pv]')){e.preventDefault();op()}});
$('#pvx').addEventListener('click',cl);d.addEventListener('click',e=>{if(e.target===d)cl()});

/* ---- Formulário por passos (Web3Forms) ---- */
const FORM_ENDPOINT='https://api.web3forms.com/submit',ACCESS_KEY='ba809ac5-8972-4de7-bdd2-1be667332b0f',EMAIL='geral@mopidigital.pt',WA='351925844777';
const f=$('#f'),st=$$('.fs',f);let si=0;
const show=i=>{si=Math.max(0,Math.min(st.length-1,i));st.forEach((s,k)=>s.classList.toggle('on',k===si));$('.stp i',f).style.transform=`scaleX(${(si+1)/st.length})`;const inp=$('input,textarea',st[si]);inp&&inp.focus({preventScroll:true});S.gsap&&S.gsap.from(st[si],{x:28,opacity:0,duration:.45,ease:'power3.out'})};
f.addEventListener('click',e=>{if(e.target.closest('.nx')){const i=$('input,textarea',st[si]);if(!i.checkValidity()){i.reportValidity();return}show(si+1)}else if(e.target.closest('.bk'))show(si-1)});
f.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&si<st.length-1){e.preventDefault();$('.nx',st[si]).click()}});
f.addEventListener('submit',ev=>{ev.preventDefault();
const n=$('#n').value,e=$('#e').value,m=$('#m').value;
if(!$('#m').checkValidity()){$('#m').reportValidity();return}if(!$('#c').checked){$('#c').reportValidity();return}
const txt=`Pedido de proposta\nNome: ${n}\nEmail: ${e}\n\n${m}`,q=encodeURIComponent,ok=$('#ok');
const done=(t,links)=>{f.classList.add('sent');$('#okt').textContent=t;$('#okb').hidden=!links;ok.hidden=false;S.gsap&&S.gsap.from(ok,{scale:.8,opacity:0,duration:.7,ease:'back.out(1.8)'})};
const pick=why=>{console.error('Formulário — falha no envio:',why);$('#lw').href=`https://wa.me/${WA}?text=${q(txt)}`;$('#lm').href=`mailto:${EMAIL}?subject=${q('Pedido de proposta — '+n)}&body=${q(txt)}`;done('Não foi possível enviar automaticamente'+(why&&why.message?' ('+why.message+')':'')+'. A sua mensagem ainda NÃO foi enviada. Escolha como quer enviar:',true)};
const sb=$('button[type=submit]',f);sb.disabled=true;sb.textContent='A enviar…';
const body={access_key:ACCESS_KEY,subject:'Novo pedido de proposta — Mopi Digital',from_name:'Site Mopi Digital',name:n,email:e,replyto:e,message:m};
if($('#bc').checked)body.botcheck=true;
const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),15000);
fetch(FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body),signal:ctl.signal})
.then(r=>r.json().catch(()=>({success:false,message:'resposta inválida do servidor, código '+r.status})))
.then(j=>{if(!j.success)throw new Error(j.message||'falha no envio');done('Mensagem enviada! Responderemos em breve.',false);f.reset()})
.catch(pick).finally(()=>{clearTimeout(tm);sb.disabled=false;sb.textContent='Enviar mensagem'})});

/* ---- Navegação (página de projetos) ---- */
const home=$('#topo'),pg=$('#pg');
const go=(t,imm)=>S.lenis?S.lenis.scrollTo(t,{offset:-72,immediate:imm}):t.scrollIntoView({behavior:reduced||imm?'auto':'smooth'});
const route=()=>{const x=location.hash,p=x==='#projetos';home.hidden=p;pg.hidden=!p;
if(p){S.lenis?S.lenis.scrollTo(0,{immediate:true}):scrollTo(0,0)}else if(x&&x!=='#privacidade'){const t=document.getElementById(x.slice(1));t&&setTimeout(()=>go(t,true),30)}
S.ST&&requestAnimationFrame(()=>S.ST.refresh())};
addEventListener('hashchange',route);
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||a.hasAttribute('data-pv'))return;const h=a.getAttribute('href');if(h==='#projetos'||home.hidden)return;const t=h.length>1&&document.getElementById(h.slice(1));if(!t)return;e.preventDefault();go(t,false)});

/* ---- Spotlight (luz que segue o cursor) ---- */
if(fine)document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('.card,.tile,.stat');if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)/r.width*100+'%');t.style.setProperty('--my',(e.clientY-r.top)/r.height*100+'%')});


route();if(location.hash==='#privacidade')op();

/* ---- Carregamento diferido: animações (GSAP + Lenis) e fundo 3D (Three.js) ---- */
const root=document.documentElement;let moved=false;
['wheel','touchstart','keydown','pointerdown'].forEach(t=>addEventListener(t,()=>{moved=true},{once:true,passive:true}));
if(!reduced)import('./motion.js').then(m=>{m.default();window.__m=1;if(location.hash&&!moved)route();requestAnimationFrame(()=>S.ST&&S.ST.refresh())}).catch(()=>{root.classList.remove('js');root.classList.add('go')});
const cv=$('#gl'),sd=navigator.connection&&navigator.connection.saveData;
if(cv&&!sd){const run=()=>import('./gl.js').then(m=>m.default(cv)).catch(()=>{});'requestIdleCallback' in window?requestIdleCallback(run,{timeout:2500}):setTimeout(run,1200)}
