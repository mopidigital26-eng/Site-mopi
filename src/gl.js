// Fundo de partículas em WebGL direto (substitui o Three.js: ~120 KB a menos).
import {reduced} from './state.js';
const L=Math.hypot(3,10),fy=-3/L,fz=-10/L,TH=Math.tan(55*Math.PI/360);
const VS=`attribute vec2 a;attribute vec3 c;uniform float t,mx,mz,asp,h;varying vec3 v;
void main(){float d=(a.x-mx)*(a.x-mx)+(a.y-mz)*(a.y-mz);
float y=sin(a.x*.5+t)*.35+cos(a.y*.6+t*.8)*.3+exp(-d*.18)*1.3;
float ca=cos(mx*.01),sa=sin(mx*.01);
vec3 p=vec3(a.x*ca+a.y*sa,y-3.,-a.x*sa+a.y*ca-10.);
float vz=p.y*(${fy})+p.z*(${fz});
gl_Position=vec4(p.x/(${TH}*asp),(p.y*(${-fz})+p.z*(${fy}))/${TH},0.,vz);
gl_PointSize=.075*h*.5/vz;v=c;}`;
const FS='precision mediump float;varying vec3 v;void main(){gl_FragColor=vec4(v,.95);}';
export default function gl(cv){
const g=cv.getContext('webgl',{alpha:true});if(!g)return;
const sh=(t,s)=>{const o=g.createShader(t);g.shaderSource(o,s);g.compileShader(o);return o},pr=g.createProgram();
g.attachShader(pr,sh(g.VERTEX_SHADER,VS));g.attachShader(pr,sh(g.FRAGMENT_SHADER,FS));g.linkProgram(pr);
if(!g.getProgramParameter(pr,g.LINK_STATUS))return;g.useProgram(pr);
const sm=innerWidth<700,W=sm?44:80,D=sm?26:44,N=W*D,buf=new Float32Array(N*5),c1=[0x7c/255,0x4d/255,1],c2=[1,0x6b/255,0x4a/255];
for(let i=0;i<W;i++)for(let j=0;j<D;j++){const k=(i*D+j)*5,u=i/(W-1);buf[k]=(u-.5)*22;buf[k+1]=(j/(D-1)-.5)*13;for(let q=0;q<3;q++)buf[k+2+q]=c1[q]+(c2[q]-c1[q])*u}
g.bindBuffer(g.ARRAY_BUFFER,g.createBuffer());g.bufferData(g.ARRAY_BUFFER,buf,g.STATIC_DRAW);
const at=(n,s,o)=>{const l=g.getAttribLocation(pr,n);g.enableVertexAttribArray(l);g.vertexAttribPointer(l,s,g.FLOAT,false,20,o)};at('a',2,0);at('c',3,8);
g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE);g.clearColor(0,0,0,0);
const U=n=>g.getUniformLocation(pr,n),ut=U('t'),ux=U('mx'),uz=U('mz'),ua=U('asp'),uh=U('h');
let mx=0,mz=0,tx=0,tz=0,on=true;
const size=()=>{const p=cv.parentElement,d=Math.min(devicePixelRatio,1.75);cv.width=Math.round(p.clientWidth*d);cv.height=Math.round(p.clientHeight*d);g.viewport(0,0,cv.width,cv.height);g.uniform1f(ua,cv.width/cv.height);g.uniform1f(uh,cv.height)};
size();addEventListener('resize',size);
addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*22;tz=(e.clientY/innerHeight-.5)*13});
new IntersectionObserver(([e])=>on=e.isIntersecting).observe(cv.parentElement);
const draw=t=>{mx+=(tx-mx)*.06;mz+=(tz-mz)*.06;g.uniform1f(ut,t);g.uniform1f(ux,mx);g.uniform1f(uz,mz);g.clear(g.COLOR_BUFFER_BIT);g.drawArrays(g.POINTS,0,N)};
draw(0);cv.classList.add('on');if(reduced)return;
const loop=t=>{requestAnimationFrame(loop);on&&draw(t*.001)};requestAnimationFrame(loop)}
