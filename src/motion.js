import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import {$,$$,fine,S} from './state.js';
/* ---- Movimento: GSAP, ScrollTrigger, Lenis ---- */
const split=el=>{const walk=n=>[...n.childNodes].forEach(c=>{if(c.nodeType===3){const fr=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(!w.trim()){fr.append(w);return}const o=document.createElement('span'),i=document.createElement('span');o.className='w';i.className='wi';i.textContent=w;o.append(i);fr.append(o)});c.replaceWith(fr)}else if(c.nodeType===1)walk(c)});walk(el);return $$('.wi',el)};
export default function motion(){gsap.registerPlugin(ScrollTrigger);S.gsap=gsap;S.ST=ScrollTrigger;ScrollTrigger.config({ignoreMobileResize:true});const pinOk=matchMedia('(min-width:901px)').matches&&fine;document.documentElement.classList.add('js');
{S.lenis=new Lenis({lerp:.1});S.lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>S.lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);document.documentElement.classList.add('lenis')}
/* entrada do hero */
const hw=split($('h1'));
document.fonts.ready.then(()=>{gsap.timeline({defaults:{ease:'power4.out'},delay:.1}).from('header',{yPercent:-100,duration:.9}).from(hw,{yPercent:115,rotate:4,transformOrigin:'0 100%',duration:1.1,stagger:.07},.15).from('[data-fade]',{y:30,opacity:0,duration:.9,stagger:.12},'-=.6');document.documentElement.classList.add('go')});
/* revelação ao scroll */
ScrollTrigger.batch('.rv',{start:'top 90%',once:true,onEnter:b=>gsap.to(b,{opacity:1,y:0,duration:.9,ease:'power3.out',stagger:.09,overwrite:true})});
/* parallax */
$$('[data-s]').forEach(e=>gsap.to(e,{y:()=>-parseFloat(e.dataset.s)*innerHeight*.6,ease:'none',scrollTrigger:{trigger:e.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
pinOk&&$$('.sh').forEach((e,i)=>gsap.to(e,{y:[-120,90,-60][i%3],rotate:i?45:0,ease:'none',scrollTrigger:{trigger:e.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
/* tipografia cinética com pin */
const kw=split($('[data-kin]'));
if(pinOk)gsap.timeline({scrollTrigger:{trigger:'.pb',start:'top top',end:'+=110%',pin:true,scrub:.6}}).fromTo(kw,{opacity:.1},{opacity:1,stagger:.12,ease:'none'}).fromTo('[data-kin2]',{opacity:0,y:24},{opacity:1,y:0,ease:'none'},'>-.1');
else gsap.timeline({scrollTrigger:{trigger:'.pb',start:'top 65%',once:true}}).from(kw,{opacity:.1,y:28,duration:.7,stagger:.08,ease:'power3.out'}).from('[data-kin2]',{opacity:0,y:20,duration:.7,ease:'power3.out'},'-=.3');
/* contadores */
$$('[data-c]').forEach(el=>{const to=+el.dataset.c,x=el.dataset.x||'',o={v:0};el.textContent='0'+x;ScrollTrigger.create({trigger:el,start:'top 92%',once:true,onEnter:()=>gsap.to(o,{v:to,duration:1.8,ease:'power2.out',onUpdate:()=>el.textContent=Math.round(o.v)+x})})});
/* marquee com paragem suave */
const mt=gsap.to('.mqi',{xPercent:-50,duration:34,ease:'none',repeat:-1}),mq=$('.mq');
mq.addEventListener('mouseenter',()=>gsap.to(mt,{timeScale:0,duration:.7}));mq.addEventListener('mouseleave',()=>gsap.to(mt,{timeScale:1,duration:.7}));
/* barra de progresso */
gsap.to('.prog',{scaleX:1,ease:'none',scrollTrigger:{scrub:.2,start:0,end:'max'}});
/* botão WhatsApp */
gsap.from('.wa',{scale:0,opacity:0,delay:2,duration:.9,ease:'back.out(2.2)'});
if(fine){
 /* tilt 3D */
 let cur=null;const rs=t=>gsap.to(t,{rotationX:0,rotationY:0,duration:.7,ease:'power3.out',overwrite:'auto'});
 document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('.card,.tile,.stat');if(cur&&cur!==t)rs(cur);cur=t;if(!t)return;const r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;gsap.to(t,{rotationY:(px-.5)*10,rotationX:(.5-py)*10,transformPerspective:900,duration:.5,ease:'power2.out',overwrite:'auto'})});
 /* cursor */
 const c=$('.cur'),cx=gsap.quickTo(c,'x',{duration:.25,ease:'power3'}),cy=gsap.quickTo(c,'y',{duration:.25,ease:'power3'});
 addEventListener('pointermove',e=>{document.body.classList.add('cur-on');cx(e.clientX);cy(e.clientY)});
 document.addEventListener('pointerover',e=>{const v=e.target.closest('.tile,#servicos .card'),b=e.target.closest('a,button,input,textarea,summary,label,.stat');c.classList.toggle('ver',!!v);c.classList.toggle('big',!!b&&!v)});
 /* botões magnéticos */
 $$('.btn,.wa,.soc a,.fb,.lnk').forEach(el=>{const xt=gsap.quickTo(el,'x',{duration:.6,ease:'elastic.out(1,.4)'}),yt=gsap.quickTo(el,'y',{duration:.6,ease:'elastic.out(1,.4)'});
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();xt((e.clientX-r.left-r.width/2)*.3);yt((e.clientY-r.top-r.height/2)*.3)});el.addEventListener('pointerleave',()=>{xt(0);yt(0)})})}
}
