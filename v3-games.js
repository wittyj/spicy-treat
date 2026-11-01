import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const MOB = matchMedia('(max-width:820px)').matches || matchMedia('(pointer:coarse)').matches;
const TOUCH = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const DPR = Math.min(devicePixelRatio || 1, MOB ? 1.25 : 1.75);
const ROLLS = window.ST_ROLLS;
const HN = ['Mixed','Small Pepper','Ata Dey','Fire Dey'], CH = ['🌶','🌶','🌶🌶','🌶🌶🌶'];
const fmt = n => '₦' + n.toLocaleString('en-NG');
const WA = 'https://wa.me/234XXXXXXXXXX?text=';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
const lerp = (a,b,t) => a + (b-a)*t;
const V = (x,y,z) => new THREE.Vector3(x,y,z);
function glOK(){ try{ const c=document.createElement('canvas'); return !!(c.getContext('webgl2')||c.getContext('webgl')); }catch(e){ return false; } }

/* ---------- textures ---------- */
const loader = new THREE.TextureLoader();
function photo(name, crop){ const t = loader.load('img/'+name+'-sm.webp'); t.colorSpace = THREE.SRGBColorSpace; if(crop){ t.repeat.set(crop[0],crop[1]); t.offset.set(crop[2],crop[3]); } return t; }
function ctex(w,h,draw,rep){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } t.anisotropy=4; return t; }
function speckle(g,w,h,n,cols,smin,smax){ for(let i=0;i<n;i++){ g.fillStyle=cols[(Math.random()*cols.length)|0]; const s=smin+Math.random()*(smax-smin); g.globalAlpha=.15+Math.random()*.35; g.fillRect(Math.random()*w,Math.random()*h,s,s);} g.globalAlpha=1; }
/* Brand box colours: change window.ST_BRAND (set in the page script) to recolour every 3D box */
const BRAND = Object.assign({box:'#3b2419', red:'#b3121b', gold:'#d6ae5c'}, window.ST_BRAND||{});
const T = {};
const LOGO = new Promise(res=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>res(null); im.src='img/logo-icon-256.png'; });
function stampLogo(tex, fn){ LOGO.then(im=>{ if(!im) return; const g=tex.image.getContext('2d'); fn(g, im, tex.image.width, tex.image.height); tex.needsUpdate=true; }); return tex; }
function linen(g,w,h,base){ g.fillStyle=base; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=2){ g.fillStyle=`rgba(255,255,255,${Math.random()*.035})`; g.fillRect(0,y,w,1);} for(let x=0;x<w;x+=2){ g.fillStyle=`rgba(0,0,0,${Math.random()*.05})`; g.fillRect(x,0,1,h);} }
T.brandSide = () => stampLogo(ctex(512,256,(g,w,h)=>{ linen(g,w,h,BRAND.box); g.fillStyle=BRAND.red; g.fillRect(0,h*.62,w,h*.16); g.fillStyle=BRAND.gold; g.fillRect(0,h*.6,w,4); g.fillRect(0,h*.78,w,4); g.fillRect(0,0,w,5); g.fillStyle=BRAND.gold; g.font='600 46px Fraunces, Georgia, serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('Spicy Treat',w/2+26,h*.33); }), (g,im,w,h)=>{ const hh=h*.42, ww=im.width*hh/im.height; g.drawImage(im, w/2-150-ww/2+26, h*.33-hh/2, ww, hh); });
T.brandLid = () => stampLogo(ctex(512,384,(g,w,h)=>{ linen(g,w,h,BRAND.box); g.strokeStyle=BRAND.gold; g.lineWidth=5; g.strokeRect(18,18,w-36,h-36); g.lineWidth=1.5; g.strokeRect(30,30,w-60,h-60); g.fillStyle=BRAND.gold; g.font='600 76px Fraunces, Georgia, serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('Spicy Treat',w/2,h/2+62); g.font='800 16px Manrope, sans-serif'; g.fillText('P A S T R Y   W I T H   A   K I C K',w/2,h/2+112); }), (g,im,w,h)=>{ const hh=h*.42, ww=im.width*hh/im.height; g.drawImage(im, w/2-ww/2, h*.1, ww, hh); });
T.kraft = () => ctex(256,256,(g,w,h)=>{ g.fillStyle='#c39a68'; g.fillRect(0,0,w,h); speckle(g,w,h,2600,['#a97f50','#d6b385','#8c6a45','#e0c194'],1,3); for(let i=0;i<60;i++){ g.strokeStyle='rgba(120,85,50,.18)'; g.beginPath(); const y=Math.random()*h; g.moveTo(0,y); g.bezierCurveTo(w*.3,y+Math.random()*8,w*.6,y-Math.random()*8,w,y); g.stroke(); } },[1,1]);
T.wood = (base='#9b6a3c') => ctex(512,256,(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h); for(let i=0;i<120;i++){ g.strokeStyle=`rgba(${60+Math.random()*40|0},${30+Math.random()*20|0},10,${.08+Math.random()*.15})`; g.lineWidth=1+Math.random()*3; g.beginPath(); const y=Math.random()*h; g.moveTo(0,y); for(let x=0;x<=w;x+=32) g.lineTo(x,y+Math.sin(x*.02+i)*4); g.stroke(); } speckle(g,w,h,800,['#6b4423','#c08a55'],1,2); },[2,1]);
T.tiles = (c1='#efe2cc',grout='#b9a68c',rep=[6,3]) => ctex(256,256,(g,w,h)=>{ g.fillStyle=grout; g.fillRect(0,0,w,h); for(let y=0;y<4;y++)for(let x=0;x<4;x++){ g.fillStyle=c1; g.globalAlpha=.85+Math.random()*.15; g.fillRect(x*64+2,y*64+2,60,60);} g.globalAlpha=1; speckle(g,w,h,400,['#fff','#d8c7ad'],1,2); },rep);
T.crust = () => ctex(512,256,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#f2cf8e'); gr.addColorStop(.5,'#f7ddaa'); gr.addColorStop(1,'#f3d39a'); g.fillStyle=gr; g.fillRect(0,0,w,h); for(let i=0;i<260;i++){ const x=Math.random()*w,y=Math.random()*h,r=6+Math.random()*30; const rg=g.createRadialGradient(x,y,0,x,y,r); rg.addColorStop(0,'rgba(196,120,48,.28)'); rg.addColorStop(1,'rgba(196,120,48,0)'); g.fillStyle=rg; g.fillRect(x-r,y-r,r*2,r*2);} speckle(g,w,h,900,['#b4682a','#fff1d0'],1,2); });
T.soft = () => ctex(64,64,(g)=>{ const r=g.createRadialGradient(32,32,1,32,32,31); r.addColorStop(0,'rgba(255,255,255,.9)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); });
T.ember = () => ctex(64,64,(g)=>{ const r=g.createRadialGradient(32,32,1,32,32,30); r.addColorStop(0,'rgba(255,245,200,1)'); r.addColorStop(.3,'rgba(255,120,30,.9)'); r.addColorStop(1,'rgba(200,20,10,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); });
T.flake = () => ctex(64,64,(g)=>{ g.translate(32,32); g.rotate(.7); g.fillStyle='#c4150e'; g.beginPath(); g.ellipse(0,0,24,10,0,0,7); g.fill(); g.fillStyle='rgba(255,170,80,.7)'; g.beginPath(); g.ellipse(-5,-2,10,3,0,0,7); g.fill(); });
T.label = (txt,fg='#fbf4e8',bg='#b3121b',w=512,h=128,fs=56) => ctex(w,h,(g)=>{ g.fillStyle=bg; if(g.roundRect){g.beginPath();g.roundRect(4,4,w-8,h-8,h*.3);g.fill();}else g.fillRect(0,0,w,h); g.fillStyle=fg; g.font=`700 ${fs}px Fraunces, Georgia, serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,w/2,h/2+3); });
T.sticker = (h) => stampLogo(ctex(256,256,(g)=>{ g.fillStyle=['#e59a1e','#e59a1e','#c8161d','#6e0a10'][h]; g.beginPath(); g.arc(128,128,124,0,7); g.fill(); g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=6; g.beginPath(); g.arc(128,128,108,0,7); g.stroke(); g.fillStyle='#fff'; g.textAlign='center'; g.font='bold 26px sans-serif'; g.fillText(CH[h],128,150); g.font='700 32px Fraunces, Georgia, serif'; g.fillText(HN[h],128,188); g.font='800 16px Manrope, sans-serif'; g.fillText('SPICY TREAT',128,214); }), (g,im)=>{ const hh=86, ww=im.width*hh/im.height; g.drawImage(im,128-ww/2,30,ww,hh); });
T.sky = (top,mid,bot) => ctex(16,256,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,top); gr.addColorStop(.55,mid); gr.addColorStop(1,bot); g.fillStyle=gr; g.fillRect(0,0,w,h); });
T.windows = (base) => ctex(128,256,(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h); speckle(g,w,h,300,['#000','#fff'],1,3); for(let y=10;y<h;y+=24)for(let x=8;x<w;x+=20){ const lit=Math.random()<.3; g.fillStyle=lit?'#ffe6a8':(Math.random()<.5?'#3d5468':'#2b3a4a'); g.fillRect(x,y,12,15); g.fillStyle='rgba(255,255,255,.15)'; g.fillRect(x,y,12,3);} });

/* ---------- shared stage ---------- */
const stages = [];
function makeStage(id, opts={}){
 const el = document.getElementById(id), canvas = el.querySelector('canvas.gl');
 let renderer;
 try{ renderer = new THREE.WebGLRenderer({canvas, antialias:!MOB, powerPreference:'high-performance'}); }catch(e){ el.classList.add('nogl'); return null; }
 renderer.setPixelRatio(DPR); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = opts.exposure||1;
 renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
 const scene = new THREE.Scene();
 const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(renderer), .04).texture;
 const cam = new THREE.PerspectiveCamera(opts.fov||45, 1, .1, 400);
 const S = {el, canvas, renderer, scene, cam, visible:false, update:()=>{}, onResize:null};
 const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if(!w||!h) return; renderer.setSize(w,h,false); cam.aspect = w/h; cam.updateProjectionMatrix(); S.onResize && S.onResize(w,h); };
 new ResizeObserver(resize).observe(canvas); resize();
 new IntersectionObserver(([e]) => { S.visible = e.isIntersecting; }, {threshold:0}).observe(el);
 S.visible = true; stages.push(S);
 const ld = el.querySelector('.loading3d'); setTimeout(()=>ld && ld.classList.add('gone'), 300);
 return S;
}
let last = performance.now();
function loop(t){ requestAnimationFrame(loop); const dt = Math.min((t-last)/1000, .1); last = t; if(document.hidden) return; for(const s of stages){ if(s.visible){ s.update(dt, t/1000); s.renderer.render(s.scene, s.cam); } } }
requestAnimationFrame(loop);
function lazy(id, init){ const el=document.getElementById(id); if(!glOK()){ el.classList.add('nogl'); return; } let done=false; const io=new IntersectionObserver(([e])=>{ if(e.isIntersecting && !done){ done=true; io.disconnect(); try{ init(); }catch(err){ console.warn('3D init failed', err); el.classList.add('nogl'); } } },{rootMargin:'400px 0px'}); io.observe(el); }
function tapHandler(canvas, onTap, onDrag){ let d=null; canvas.addEventListener('pointerdown',e=>{ d={x:e.clientX,y:e.clientY,lx:e.clientX,moved:false}; }); canvas.addEventListener('pointermove',e=>{ if(!d) return; if(Math.abs(e.clientX-d.x)>6||Math.abs(e.clientY-d.y)>6) d.moved=true; if(onDrag && d.moved) onDrag(e.clientX-d.lx); d.lx=e.clientX; }); const up=e=>{ if(d && !d.moved) onTap(e); d=null; }; canvas.addEventListener('pointerup',up); canvas.addEventListener('pointercancel',()=>d=null); }
function ndc(canvas,e){ const r=canvas.getBoundingClientRect(); return new THREE.Vector2((e.clientX-r.left)/r.width*2-1, -(e.clientY-r.top)/r.height*2+1); }
function particles(n, tex, size, blending, color){ const g=new THREE.BufferGeometry(); const p=new Float32Array(n*3); for(let i=0;i<n;i++) p[i*3+1]=-99; g.setAttribute('position',new THREE.BufferAttribute(p,3)); const m=new THREE.PointsMaterial({map:tex,size,transparent:true,depthWrite:false,blending:blending||THREE.AdditiveBlending,color:color||'#fff'}); const pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.userData={p,v:new Float32Array(n*3),life:new Float32Array(n),n}; return pts; }

/* ---------- models ---------- */
const PEP = {1:{c:'#f2ad16',s:.82},2:{c:'#d0120c',s:.9},3:{c:'#8a0a0a',s:1}};
function pepperGeo(type){
 const prof = type===1 ? [[0,-.55],[.28,-.56],[.48,-.44],[.57,-.15],[.6,.18],[.55,.44],[.36,.58],[.12,.6],[0,.57]]
  : type===2 ? [[0,-.36],[.2,-.42],[.42,-.31],[.55,-.06],[.56,.12],[.48,.3],[.3,.38],[.1,.36],[0,.33]]
  : [[0,-1.15],[.05,-1.05],[.12,-.75],[.19,-.25],[.24,.25],[.26,.58],[.2,.74],[0,.77]];
 const g = new THREE.LatheGeometry(prof.map(p=>new THREE.Vector2(p[0],p[1])), 48, 0, Math.PI*2);
 const p = g.attributes.position;
 for(let i=0;i<p.count;i++){ let x=p.getX(i), y=p.getY(i), z=p.getZ(i); const th=Math.atan2(z,x);
  let k=1; if(type===1) k=1+.08*Math.cos(4*th); if(type===2) k=1+.1*Math.cos(5*th)+.025*Math.sin(th*13+y*14);
  x*=k; z*=k; if(type===3){ const b=Math.max(0,.3-y); x+=.32*b*b; }
  if(type!==3 && y<-.25){ y += .06*Math.cos((type===1?4:5)*th)*(-.25-y)*4; }
  p.setXYZ(i,x,y,z); }
 g.computeVertexNormals(); return g;
}
const pepGeos = {};
function makePepper(h, face){
 const d = PEP[h], g = new THREE.Group();
 pepGeos[h] = pepGeos[h] || pepperGeo(h);
 const mat = new THREE.MeshPhysicalMaterial({color:d.c, roughness:.2, clearcoat:1, clearcoatRoughness:.08, envMapIntensity:1.2});
 const body = new THREE.Mesh(pepGeos[h], mat); body.castShadow = true; g.add(body);
 const top = h===3 ? .77 : (h===1?.6:.36);
 const green = new THREE.MeshPhysicalMaterial({color:'#2f6b22', roughness:.45, clearcoat:.4});
 const cal = new THREE.Mesh(new THREE.CylinderGeometry(h===3?.16:.22,h===3?.2:.3,.08,14), green); cal.position.y = top; g.add(cal);
 const stem = new THREE.Mesh(new THREE.CylinderGeometry(.035,.06,.38,8), green); stem.position.set(.06, top+.2, 0); stem.rotation.z = -.5; stem.castShadow = true; g.add(stem);
 if(face){ const white = new THREE.MeshStandardMaterial({color:'#fff', roughness:.2}), black = new THREE.MeshStandardMaterial({color:'#111', roughness:.15});
  const ey = h===3 ? .35 : (h===1?.12:.05), ez = h===3 ? .23 : (h===1?.55:.5), ex = h===3 ? .1 : .18;
  [-1,1].forEach(s=>{ const e=new THREE.Mesh(new THREE.SphereGeometry(h===3?.085:.12,16,12),white); e.position.set(s*ex,ey,ez); g.add(e); const pu=new THREE.Mesh(new THREE.SphereGeometry(h===3?.045:.06,12,10),black); pu.position.set(s*ex,ey,ez+(h===3?.06:.09)); g.add(pu); });
  const m = new THREE.Mesh(new THREE.TorusGeometry(h===3?.06:.09,.018,6,16,Math.PI), black); m.position.set(0,ey-(h===3?.12:.16),ez+.02); m.rotation.z=Math.PI; g.add(m);
  if(h===3){ [-1,1].forEach(s=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(.14,.025,.02),black); b.position.set(s*.1,ey+.11,ez+.02); b.rotation.z=s*-.45; g.add(b); }); }
  const shoe = new THREE.MeshPhysicalMaterial({color:'#1f1714', roughness:.4, clearcoat:.5});
  [-1,1].forEach(s=>{ const f=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),shoe); f.scale.set(1,.55,1.4); f.position.set((h===3?.62:0)+s*.18,(h===3?-1.13:-.48),.05); f.castShadow=true; g.add(f); });
 }
 g.scale.setScalar(d.s); g.userData.h = h; g.userData.mat = mat; return g;
}
const crustTex = T.crust();
const RAW = new THREE.Color('#ffefcf'), GOLD = new THREE.Color('#e2963c');
function makeRoll(i){
 const r=.5, len=1.5, g=new THREE.Group(), shape=new THREE.Group(); g.add(shape); shape.scale.y=.8;
 const dough = new THREE.MeshPhysicalMaterial({map:crustTex, color:RAW.clone(), roughness:.5, clearcoat:.35, clearcoatRoughness:.35, sheen:.5, sheenColor:new THREE.Color('#ffd79a'), envMapIntensity:.8});
 const body = new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,48,1,true), dough); body.rotation.z=Math.PI/2; body.castShadow=true; body.receiveShadow=true; shape.add(body);
 const cap = new THREE.Mesh(new THREE.SphereGeometry(r,48,24,0,Math.PI*2,0,Math.PI/2), dough); cap.rotation.z=Math.PI/2; cap.position.x=-len/2; cap.castShadow=true; shape.add(cap);
 const fillTex = photo('roll-'+ROLLS[i].id, [.42,.52,.3,.2]);
 const face = new THREE.Mesh(new THREE.CircleGeometry(r*.93,48), new THREE.MeshPhysicalMaterial({map:fillTex, roughness:.35, clearcoat:.6, clearcoatRoughness:.2})); face.rotation.y=Math.PI/2; face.position.x=len/2+.002; shape.add(face);
 const rim = new THREE.Mesh(new THREE.TorusGeometry(r*.965,.05,12,48), dough); rim.rotation.y=Math.PI/2; rim.position.x=len/2; shape.add(rim);
 const scoreM = new THREE.MeshStandardMaterial({color:'#9a5520', roughness:.7});
 [-.45,0,.45].forEach(x=>{ const s=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.42,4,8), scoreM); s.rotation.x=Math.PI/2; s.rotation.y=.35; s.position.set(x,r*.985,0); shape.add(s); });
 const sp=[]; for(let k=0;k<160;k++){ const a=Math.random()*Math.PI*.9+.05*Math.PI, x=(Math.random()-.5)*len*1.05; sp.push(x, Math.sin(a)*r*1.01, Math.cos(a)*r*1.01); }
 const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp,3));
 shape.add(new THREE.Points(sg, new THREE.PointsMaterial({color: ROLLS[i].id==='egg'||ROLLS[i].id==='veggie' ? '#f3e7c6' : '#8a2a12', size:.035})));
 g.userData = {dough, face, fillTex};
 g.setBake = k => { dough.color.copy(RAW).lerp(GOLD, k); dough.clearcoat = .35 + k*.5; };
 g.traverse(o=>{ if(o.isMesh) o.userData.act='roll'; });
 return g;
}

/* ======================= 1. PEPPER KITCHEN ======================= */
lazy('pk-stage', () => {
 const S = makeStage('pk-stage', {fov: MOB?55:42, exposure:1.05}); if(!S) return;
 const {scene, cam, canvas} = S;
 scene.background = new THREE.Color('#1c100c'); scene.fog = new THREE.Fog('#1c100c', 16, 34);
 const M = (c,o={}) => new THREE.MeshStandardMaterial({color:c, roughness:.7, ...o});
 scene.add(new THREE.HemisphereLight('#ffe9c8','#3a1d12',.55));
 const sun = new THREE.DirectionalLight('#ffe2b8', 2.2); sun.position.set(4,9,6); sun.castShadow=true; sun.shadow.mapSize.set(MOB?1024:2048, MOB?1024:2048); Object.assign(sun.shadow.camera,{left:-7,right:7,top:6,bottom:-4}); sun.shadow.bias=-.0004; sun.shadow.radius=4; scene.add(sun);
 const pend = new THREE.PointLight('#ffc27a', 18, 9, 2); pend.position.set(0,3.4,.6); scene.add(pend);
 const wall = new THREE.Mesh(new THREE.PlaneGeometry(26,12), new THREE.MeshStandardMaterial({map:T.tiles('#f1e4cf','#bba88d',[10,5]), roughness:.35, envMapIntensity:.6})); wall.position.set(0,3.5,-3.2); wall.receiveShadow=true; scene.add(wall);
 const floor = new THREE.Mesh(new THREE.PlaneGeometry(30,20), new THREE.MeshStandardMaterial({map:T.tiles('#7a3b26','#3b1d12',[12,8]), roughness:.6})); floor.rotation.x=-Math.PI/2; floor.position.y=-2.4; scene.add(floor);
 const winM = new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.4), new THREE.MeshBasicMaterial({color:'#ffe7bf'})); winM.position.set(4.6,3.6,-3.18); scene.add(winM);
 const frameM = M('#3b2a20'); [[4.6,3.6,3.5,.08],[4.6,3.6,.08,2.5]].forEach(([x,y,w,h])=>{ const f=new THREE.Mesh(new THREE.BoxGeometry(w,h,.06),frameM); f.position.set(x,y,-3.15); scene.add(f); });
 const counter = new THREE.Mesh(new THREE.BoxGeometry(13,.22,4.4), new THREE.MeshStandardMaterial({map:T.wood('#a8743f'), roughness:.45, envMapIntensity:.7})); counter.position.set(0,-.11,-.6); counter.receiveShadow=true; scene.add(counter);
 const cab = new THREE.Mesh(new THREE.BoxGeometry(13,2.2,4.2), M('#1d1512',{roughness:.55})); cab.position.set(0,-1.32,-.6); scene.add(cab);
 for(let i=-3;i<=3;i++){ const hdl=new THREE.Mesh(new THREE.BoxGeometry(.6,.05,.05), M('#d8b06a',{metalness:.9,roughness:.25})); hdl.position.set(i*1.8,-.55,1.52); scene.add(hdl); }
 const shelf = new THREE.Mesh(new THREE.BoxGeometry(5.2,.12,.7), new THREE.MeshStandardMaterial({map:T.wood('#8e5f33')})); shelf.position.set(-.6,3.2,-2.85); shelf.castShadow=true; scene.add(shelf);
 const glass = new THREE.MeshPhysicalMaterial({color:'#fff', roughness:.05, transparent:true, opacity:.28, clearcoat:1, envMapIntensity:1.5});
 [['#c8161d',-2.6],['#e7a52a',-1.5],['#7a0b0b',-.4],['#b5651e',.7],['#d6261c',1.7]].forEach(([c,x])=>{ const j=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.75,24),glass); j.position.set(x,3.64,-2.85); scene.add(j); const f=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.5,20),M(c,{roughness:.9})); f.position.set(x,3.53,-2.85); scene.add(f); const l=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.1,24),M('#2a1d17',{metalness:.5,roughness:.4})); l.position.set(x,4.05,-2.85); scene.add(l); });
 const shade = new THREE.Mesh(new THREE.ConeGeometry(.6,.5,32,1,true), new THREE.MeshStandardMaterial({color:'#1e1a18', metalness:.6, roughness:.35, side:THREE.DoubleSide})); shade.position.set(0,3.75,.6); scene.add(shade);
 const bulb = new THREE.Mesh(new THREE.SphereGeometry(.14,16,12), new THREE.MeshBasicMaterial({color:'#fff1cf'})); bulb.position.set(0,3.55,.6); scene.add(bulb);
 const cord = new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,3), M('#111')); cord.position.set(0,5.5,.6); scene.add(cord);
 const board = new THREE.Mesh(new THREE.BoxGeometry(2.7,.1,1.6), new THREE.MeshStandardMaterial({map:T.wood('#d2a066'), roughness:.5})); board.position.set(0,.05,.45); board.receiveShadow=true; board.castShadow=true; scene.add(board);
 // OVEN
 const steel = new THREE.MeshPhysicalMaterial({color:'#b9b6b2', metalness:.92, roughness:.28, envMapIntensity:1.1});
 const oven = new THREE.Group(); oven.position.set(-3.7,0,-1.05); scene.add(oven);
 const OW=2.5, OH=1.95, OD=1.9;
 [[0,OH-.04,0,OW,.08,OD],[0,.04,0,OW,.08,OD],[-OW/2+.04,OH/2,0,.08,OH,OD],[OW/2-.04,OH/2,0,.08,OH,OD],[0,OH/2,-OD/2+.04,OW,OH,.08]].forEach(([x,y,z,w,h,d])=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),steel); m.position.set(x,y,z); m.castShadow=true; oven.add(m); });
 const inner = new THREE.Mesh(new THREE.BoxGeometry(OW-.2,OH-.55,OD-.15), new THREE.MeshStandardMaterial({color:'#2a120a', emissive:'#ff5a14', emissiveIntensity:.15, side:THREE.BackSide, roughness:.8})); inner.position.set(0,(OH-.45)/2+.04,.02); oven.add(inner);
 for(let i=-5;i<=5;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,OD-.3),steel); b.rotation.x=Math.PI/2; b.position.set(i*.2,.42,0); oven.add(b);}
 const panel = new THREE.Mesh(new THREE.BoxGeometry(OW,.4,.06), new THREE.MeshPhysicalMaterial({color:'#151210', metalness:.4, roughness:.25, clearcoat:1})); panel.position.set(0,OH-.24,OD/2+.01); oven.add(panel);
 const tC=document.createElement('canvas'); tC.width=256; tC.height=80; const tG=tC.getContext('2d'); const timerTex=new THREE.CanvasTexture(tC); timerTex.colorSpace=THREE.SRGBColorSpace;
 function drawTimer(txt,on){ tG.fillStyle='#0b0908'; tG.fillRect(0,0,256,80); tG.fillStyle=on?'#ff8a2a':'#5a3a2a'; tG.font='bold 56px monospace'; tG.textAlign='center'; tG.textBaseline='middle'; tG.fillText(txt,128,42); timerTex.needsUpdate=true; }
 drawTimer('180°',false);
 const disp = new THREE.Mesh(new THREE.PlaneGeometry(.75,.24), new THREE.MeshBasicMaterial({map:timerTex, toneMapped:false})); disp.position.set(0,OH-.24,OD/2+.045); oven.add(disp);
 [-.85,-.6,.6,.85].forEach(x=>{ const k=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.08,20),steel); k.rotation.x=Math.PI/2; k.position.set(x,OH-.24,OD/2+.07); oven.add(k); });
 const doorPivot = new THREE.Group(); doorPivot.position.set(0,.08,OD/2); oven.add(doorPivot);
 const DH = OH-.5;
 const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(OW-.06,DH,.08), steel); doorFrame.position.set(0,DH/2,.04); doorFrame.castShadow=true; doorPivot.add(doorFrame);
 const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(OW-.6,DH-.45), new THREE.MeshPhysicalMaterial({color:'#2a1208', emissive:'#ff6a1a', emissiveIntensity:.15, roughness:.05, metalness:.1, clearcoat:1, transparent:true, opacity:.88})); doorGlass.position.set(0,DH/2-.05,.085); doorPivot.add(doorGlass);
 const handle = new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,OW-.5,16), steel); handle.rotation.z=Math.PI/2; handle.position.set(0,DH-.12,.2); doorPivot.add(handle);
 [-1,1].forEach(s=>{ const hb=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.14,8),steel); hb.rotation.x=Math.PI/2; hb.position.set(s*(OW/2-.35),DH-.12,.13); doorPivot.add(hb); });
 const ovenLight = new THREE.PointLight('#ff7a2a', 0, 5, 2); ovenLight.position.set(0,.9,.2); oven.add(ovenLight);
 oven.traverse(o=>{ if(o.isMesh) o.userData.act='oven'; });
 // BOX
 const kraft = new THREE.MeshPhysicalMaterial({map:T.brandSide(), roughness:.55, clearcoat:.25, clearcoatRoughness:.5}); const kraftIn = new THREE.MeshStandardMaterial({color:BRAND.red, roughness:.75});
 const goldTrim = new THREE.MeshPhysicalMaterial({color:BRAND.gold, metalness:.95, roughness:.25}); const plainBox = new THREE.MeshPhysicalMaterial({map:ctex(64,64,(g,w,h)=>linen(g,w,h,BRAND.box)), roughness:.55, clearcoat:.25});
 const lidMats = [plainBox, plainBox, new THREE.MeshPhysicalMaterial({map:T.brandLid(), roughness:.5, clearcoat:.35, clearcoatRoughness:.4}), kraftIn, plainBox, plainBox];
 const box = new THREE.Group(); box.position.set(2.95,0,.25); box.rotation.y=-.28; scene.add(box);
 const BW=2.1, BD=1.35, BH=.78, BT=.035;
 const bb = new THREE.Mesh(new THREE.BoxGeometry(BW,BT,BD),kraftIn); bb.position.y=BT/2; bb.receiveShadow=true; box.add(bb);
 [[0,BH/2,BD/2,BW,BH,BT],[0,BH/2,-BD/2,BW,BH,BT],[BW/2,BH/2,0,BT,BH,BD],[-BW/2,BH/2,0,BT,BH,BD]].forEach(([x,y,z,w,h,d])=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),kraft); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; box.add(m); });
 [[0,BD/2,BW+.04,.025,.045],[0,-BD/2,BW+.04,.025,.045],[BW/2,0,.045,.025,BD+.04],[-BW/2,0,.045,.025,BD+.04]].forEach(([x,z,w,h,d])=>{ const t=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),goldTrim); t.position.set(x,BH,z); box.add(t); });
 const nap = new THREE.Mesh(new THREE.BoxGeometry(.7,.02,.7), M('#f4efe6',{roughness:.95})); nap.position.set(-.55,.06,.1); nap.rotation.y=.4; box.add(nap);
 const lidP = new THREE.Group(); lidP.position.set(0,BH,-BD/2); box.add(lidP);
 const lid = new THREE.Mesh(new THREE.BoxGeometry(BW+.05,BT,BD+.05), lidMats); lid.position.set(0,0,BD/2); lid.castShadow=true; lidP.add(lid);
 const flap = new THREE.Mesh(new THREE.BoxGeometry(BW+.05,.18,BT), plainBox); flap.position.set(0,-.09,BD+.02); lidP.add(flap);
 lidP.rotation.x = -1.95;
 const sticker = new THREE.Mesh(new THREE.CircleGeometry(.3,40), new THREE.MeshStandardMaterial({map:T.sticker(2), roughness:.4, transparent:true})); sticker.rotation.x=-Math.PI/2; sticker.visible=false; box.add(sticker);
 box.traverse(o=>{ if(o.isMesh) o.userData.act='box'; });
 // PEPPERS tray
 const tray = new THREE.Mesh(new THREE.BoxGeometry(2.6,.08,1.0), new THREE.MeshStandardMaterial({map:T.wood('#6e4527'), roughness:.5})); tray.position.set(-1.25,.04,1.75); tray.receiveShadow=true; scene.add(tray);
 const peppers = {}; const pepX = {1:-2.05,2:-1.25,3:-.4};
 [1,2,3].forEach(h=>{ const p=makePepper(h,false); p.position.set(pepX[h], h===1?.5:.36, 1.75); if(h===3){ p.rotation.z=Math.PI/2.2; p.position.y=.3; } p.traverse(o=>{ if(o.isMesh){ o.userData.act='heat'; o.userData.h=h; } }); scene.add(p); peppers[h]=p; p.userData.baseY=p.position.y; p.userData.mat.emissive=new THREE.Color('#000'); });
 const ring = new THREE.Mesh(new THREE.TorusGeometry(.42,.025,8,40), new THREE.MeshBasicMaterial({color:'#ffb347', toneMapped:false})); ring.rotation.x=-Math.PI/2; ring.position.set(-1.25,.1,1.75); scene.add(ring);
 // burner + pan + flames
 const burner = new THREE.Group(); burner.position.set(1.45,0,1.65); scene.add(burner);
 const bp = new THREE.Mesh(new THREE.CylinderGeometry(.5,.55,.08,32), new THREE.MeshPhysicalMaterial({color:'#1a1715', metalness:.8, roughness:.35})); bp.position.y=.04; burner.add(bp);
 const pan = new THREE.Mesh(new THREE.CylinderGeometry(.55,.45,.22,40,1,true), new THREE.MeshPhysicalMaterial({color:'#222', metalness:.9, roughness:.3, side:THREE.DoubleSide})); pan.position.y=.52; burner.add(pan);
 const sauce = new THREE.Mesh(new THREE.CircleGeometry(.5,32), new THREE.MeshPhysicalMaterial({color:'#b5160c', roughness:.15, clearcoat:1})); sauce.rotation.x=-Math.PI/2; sauce.position.y=.56; burner.add(sauce);
 const flameMat = new THREE.MeshBasicMaterial({color:'#ff7a1a', transparent:true, opacity:.8, blending:THREE.AdditiveBlending, depthWrite:false, toneMapped:false});
 const flameCore = new THREE.MeshBasicMaterial({color:'#5aa8ff', transparent:true, opacity:.7, blending:THREE.AdditiveBlending, depthWrite:false, toneMapped:false});
 const flames=[]; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; const f=new THREE.Mesh(new THREE.ConeGeometry(.06,.3,8),flameMat); f.position.set(Math.cos(a)*.38,.2,Math.sin(a)*.38); f.userData.ph=Math.random()*6; burner.add(f); flames.push(f); const c=new THREE.Mesh(new THREE.ConeGeometry(.035,.1,6),flameCore); c.position.set(Math.cos(a)*.38,.13,Math.sin(a)*.38); burner.add(c); }
 const heatLight = new THREE.PointLight('#ff5a1a', 4, 4, 2); heatLight.position.set(1.45,.9,1.65); scene.add(heatLight);
 // ROLL + particles
 let roll = makeRoll(0); const BOARD = V(0,.47,.45); roll.position.copy(BOARD); roll.rotation.y=-.45; scene.add(roll);
 const flakes = particles(MOB?120:220, T.flake(), .09, THREE.NormalBlending); scene.add(flakes);
 const embers = particles(MOB?60:110, T.ember(), .12); scene.add(embers);
 const steam = particles(MOB?40:70, T.soft(), .9, THREE.NormalBlending, '#ffffff'); steam.material.opacity=.35; scene.add(steam);
 // camera/controls
 const DEF = {pos: MOB?V(-.1,3.9,10.6):V(.6,4.3,9.4), tgt: MOB?V(-.4,.5,0):V(-.2,.6,.0)};
 cam.position.copy(DEF.pos);
 const ctl = new OrbitControls(cam, canvas); ctl.target.copy(DEF.tgt); ctl.enableDamping=true; ctl.dampingFactor=.07; ctl.enablePan=false; ctl.enableZoom=false; ctl.rotateSpeed=.65;
 ctl.minPolarAngle=.55; ctl.maxPolarAngle=1.38; ctl.minAzimuthAngle=-1.2; ctl.maxAzimuthAngle=1.2; ctl.update();
 canvas.style.touchAction='pan-y';
 let focus=null, focusT=0; function setFocus(f,t=1.8){ focus=f; focusT=t; }
 const st = {roll:0, heat:2, heatPicked:false, dip:false, phase:'select', steamT:0};
 const seq = []; let segT=0; function run(steps){ seq.length=0; seq.push(...steps); segT=0; }
 const toastEl=$('#pkToast'); function toast(m){ toastEl.textContent=m; toastEl.classList.add('show'); clearTimeout(toastEl._t); toastEl._t=setTimeout(()=>toastEl.classList.remove('show'),1900); }
 const peek=$('#pkPeek'), insideB=$('#pkInside');
 function seeInside(){ const r=ROLLS[st.roll]; window.stLightbox && window.stLightbox.open([{src:'img/inbox-'+r.id+'.webp',alt:'Concept image: '+r.name+' inside the Spicy Treat box',cap:r.name+' · '+HN[st.heat]+' · inside your Spicy Treat box'},{src:'img/roll-'+r.id+'.webp',alt:'Concept image: '+r.name,cap:r.name+' close-up'}],0,{zoomTo:1.9,fx:.02,fy:.12}); }
 peek.onclick=seeInside; insideB.onclick=seeInside;
 const thumbs=$$('#pkThumbs button'), heatsB=$$('#pkHeats button'), mainB=$('#pkMain'), waB=$('#pkWA'), againB=$('#pkAgain');
 const stickerTex={}; function stTex(h){ return stickerTex[h] || (stickerTex[h]=T.sticker(h)); }
 function sync(){ const r=ROLLS[st.roll], tot=r.price+(st.dip?300:0);
  thumbs.forEach((b,k)=>b.classList.toggle('on',k===st.roll)); heatsB.forEach(b=>b.classList.toggle('on',+b.dataset.h===st.heat));
  $('#pkName').textContent=r.name; $('#pkHeatL').textContent=CH[st.heat]+' '+HN[st.heat]; $('#pkTotal').textContent=fmt(tot);
  waB.href = WA+encodeURIComponent(`Hi Spicy Treat! I baked my order in the Pepper Kitchen:\n${r.name}, heat: ${HN[st.heat]}${st.dip?'\n+ pepper dip (NGN 300)':''}\nTotal: NGN ${tot.toLocaleString()}`);
  const ph=st.phase, busy = ph==='baking'||ph==='boxing';
  mainB.hidden = ph==='boxed'; waB.hidden = ph!=='boxed'; againB.hidden = ph!=='boxed'; insideB.hidden = ph!=='boxed'; peek.classList.toggle('on', ph==='boxed'); if(ph==='boxed') $('#pkPeekImg').src='img/inbox-'+r.id+'-sm.webp';
  mainB.disabled = busy; mainB.textContent = ph==='baking' ? '⏲ Baking…' : ph==='boxing' ? '📦 Boxing…' : ph==='baked' ? '📦 Box it up' : '🔥 Put it in the oven';
  const si = ph==='select' ? (st.heatPicked?2:1) : ph==='baking' ? 2 : (ph==='baked'||ph==='boxing') ? 3 : 4;
  $$('#pkSteps span').forEach((s,k)=>{ s.classList.toggle('on',k===si); s.classList.toggle('done',k<si); });
  sticker.material.map = stTex(st.heat); sticker.material.needsUpdate=true; ring.position.x = pepX[st.heat];
 }
 function resetToBoard(){ seq.length=0; st.phase='select'; roll.setBake(0); roll.position.copy(BOARD); roll.scale.setScalar(1); roll.rotation.set(0,-.45,0); lidP.rotation.x=-1.95; sticker.visible=false; doorPivot.rotation.x=0; ovenLight.intensity=0; inner.material.emissiveIntensity=.15; doorGlass.material.emissiveIntensity=.15; drawTimer('180°',false); setFocus(DEF,1.4); }
 function selectRoll(i){ if(st.phase==='baking'||st.phase==='boxing') return; if(st.phase!=='select') resetToBoard(); scene.remove(roll); roll=makeRoll(i); roll.position.copy(BOARD); roll.rotation.y=-.45; scene.add(roll); st.roll=i; if(!st.heatPicked && ROLLS[i].heat) st.heat=ROLLS[i].heat; roll.userData.pop=1; sync(); toast(ROLLS[i].name+' on the board'); }
 function setHeat(h, fromGlobal){ if(st.phase==='baking'||st.phase==='boxing') return; if(st.phase!=='select') resetToBoard(); st.heat=h; st.heatPicked=true; peppers[h].userData.jump=1; sync(); if(!fromGlobal){ window.stSetHeat && window.stSetHeat(h,'kitchen'); toast(['','Small Pepper: warm and friendly','Ata Dey: proper Naija heat','Fire Dey: for serious pepper lovers 🔥'][h]); } }
 function arc(from,to,u,h){ const p=from.clone().lerp(to,u); p.y+=Math.sin(u*Math.PI)*h; return p; }
 const OV_FRONT = V(-3.7,.75,.9), OV_IN = V(-3.7,.62,-1.0);
 function puff(at,n){ const P=steam.userData; for(let k=0;k<n;k++){ const i=(Math.random()*P.n)|0; P.p[i*3]=at.x+(Math.random()-.5)*.8; P.p[i*3+1]=at.y+Math.random()*.3; P.p[i*3+2]=at.z+(Math.random()-.5)*.5; P.life[i]=1.6+Math.random(); P.v[i*3]=(Math.random()-.5)*.2; P.v[i*3+1]=.5+Math.random()*.5; P.v[i*3+2]=(Math.random()-.5)*.2; } }
 function showCanvas(){ if(!MOB) return; const r=canvas.getBoundingClientRect(); if(r.top<50||r.bottom>innerHeight) window.scrollBy({top:r.top-60,behavior:'smooth'}); }
 function bake(){ if(st.phase!=='select') return; showCanvas(); st.phase='baking'; sync(); setFocus({pos:MOB?V(-1.4,3.6,8.6):V(-1.3,2.7,5.2), tgt:V(-3.3,.9,-.2)}, 9);
  toast('Into the oven! 🔥'); const from=roll.position.clone();
  run([ {d:.7,f:u=>doorPivot.rotation.x=ease(u)*1.45},
   {d:.9,f:u=>{ roll.position.copy(arc(from,OV_FRONT,ease(u),.9)); roll.rotation.y=lerp(-.45,0,u); }},
   {d:.7,f:u=>{ roll.position.copy(OV_FRONT.clone().lerp(OV_IN,ease(u))); roll.scale.setScalar(1-.15*u); }},
   {d:.55,f:u=>doorPivot.rotation.x=(1-ease(u))*1.45},
   {d:3.6,f:u=>{ roll.setBake(ease(u)); ovenLight.intensity=6+Math.sin(u*40)*1.5; inner.material.emissiveIntensity=.15+u*.9; doorGlass.material.emissiveIntensity=.15+.85*Math.min(1,u*3); drawTimer('00:0'+Math.max(0,Math.ceil((1-u)*4)), true); }},
   {d:.55,f:u=>{ doorPivot.rotation.x=ease(u)*1.45; if(u>.3) puff(OV_FRONT,3); ovenLight.intensity=6*(1-u); inner.material.emissiveIntensity=1.05-u*.8; doorGlass.material.emissiveIntensity=1-u*.85; if(u>.95) drawTimer('DONE',true); }},
   {d:1.2,f:u=>{ roll.position.copy(arc(OV_IN,BOARD,ease(u),1.0)); roll.scale.setScalar(.85+.15*u); roll.rotation.y=lerp(0,-.45,u); }, done:()=>{ st.phase='baked'; st.steamT=6; sync(); toast('Golden and steaming! Now box it 📦'); setFocus(DEF,1.6); }},
   {d:.6,f:u=>doorPivot.rotation.x=(1-ease(u))*1.45, done:()=>drawTimer('180°',false)} ]); }
 function doBox(){ if(st.phase!=='baked') return; showCanvas(); st.phase='boxing'; sync(); setFocus({pos:MOB?V(2.4,4.4,9.2):V(2.3,3.3,6), tgt:V(2.7,.5,.2)}, 4); const from=roll.position.clone(), to=box.localToWorld(V(.12,.36,0));
  run([ {d:1.0,f:u=>{ roll.position.copy(arc(from,to,ease(u),1.2)); roll.scale.setScalar(1-.33*ease(u)); roll.rotation.y=lerp(-.45,-.28,u); }},
   {d:.75,f:u=>lidP.rotation.x=-1.95*(1-ease(u))},
   {d:.7,f:u=>{ sticker.visible=true; const y=BH+BT/2+.006; const b=u<.7? 1-Math.pow(1-u/.7,2) : 1-Math.sin((u-.7)/.3*Math.PI)*.08; sticker.position.set(.55,lerp(y+1.6,y,b),.25); sticker.rotation.z=(1-u)*3; sticker.scale.setScalar(u<.7?1.4-u*.5:1); }, done:()=>{ st.phase='boxed'; sync(); toast('Boxed with your '+HN[st.heat]+' sticker! Send your order 💬'); if(MOB) setTimeout(()=>waB.scrollIntoView({behavior:'smooth',block:'center'}),1400); }} ]); }
 thumbs.forEach((b,i)=>b.onclick=()=>selectRoll(i)); heatsB.forEach(b=>b.onclick=()=>setHeat(+b.dataset.h));
 $('#pkDip').onchange=e=>{ st.dip=e.target.checked; sync(); };
 mainB.onclick=()=>{ if(st.phase==='select') bake(); else if(st.phase==='baked') doBox(); };
 againB.onclick=()=>{ resetToBoard(); sync(); };
 window.addEventListener('stheat', e=>{ if(e.detail.src!=='kitchen') setHeat(e.detail.h, true); });
 window.addEventListener('stbuild', e=>selectRoll(e.detail));
 const ray=new THREE.Raycaster();
 tapHandler(canvas, e=>{ ray.setFromCamera(ndc(canvas,e),cam); const hit=ray.intersectObjects(scene.children,true).find(h=>h.object.userData.act); if(!hit) return; const a=hit.object.userData.act;
  if(a==='heat') setHeat(hit.object.userData.h); else if(a==='oven'){ if(st.phase==='select') bake(); else toast(st.phase==='baked'?'Already baked! Box it 📦':'Baking…'); } else if(a==='box'){ if(st.phase==='baked') doBox(); else if(st.phase==='select') toast('Bake it first 🔥'); } else if(a==='roll'){ roll.userData.spin=1; } });
 canvas.style.cursor='grab';
 S.update = (dt,t) => {
  if(seq.length){ const s=seq[0]; segT+=dt; const u=Math.min(1,segT/s.d); s.f(u); if(u>=1){ s.done&&s.done(); seq.shift(); segT=0; } }
  else if(st.phase==='select'||st.phase==='baked'){ roll.position.y = BOARD.y + Math.sin(t*2)*.03 + (roll.userData.pop? Math.sin(roll.userData.pop*Math.PI)*.4:0); roll.rotation.y = -.45 + Math.sin(t*.7)*.18 + (roll.userData.spin? (1-roll.userData.spin)*Math.PI*2:0); }
  if(roll.userData.pop) roll.userData.pop=Math.max(0,roll.userData.pop-dt*2.2); if(roll.userData.spin) roll.userData.spin=Math.max(0,roll.userData.spin-dt*1.2);
  const k=[0,.35,.7,1.15][st.heat];
  [1,2,3].forEach(h=>{ const p=peppers[h], on=h===st.heat; p.rotation.y += dt*(on?1.2:.2); const j=p.userData.jump||0; p.position.y = p.userData.baseY + (on? .12+Math.sin(t*3)*.05:0) + Math.sin(j*Math.PI)*.5; if(j) p.userData.jump=Math.max(0,j-dt*2); p.userData.mat.emissive.set(on?'#ff3300':'#000'); p.userData.mat.emissiveIntensity = on? .12+Math.sin(t*4)*.05:0; });
  ring.scale.setScalar(1+Math.sin(t*4)*.06);
  flames.forEach(f=>{ const s=(.35+k*1.5)*(.8+Math.sin(t*16+f.userData.ph)*.25); f.scale.set(1,s,1); f.position.y=.12+.15*s; }); flameMat.color.setHSL(.08-k*.04,1,.55);
  heatLight.intensity = 2+k*10+Math.sin(t*11)*k*2;
  const F=flakes.userData, act=Math.floor(F.n*[0,.25,.55,1][st.heat]);
  for(let i=0;i<F.n;i++){ if(i>=act){ F.p[i*3+1]=-99; continue; } if(F.p[i*3+1]<-50||F.p[i*3+1]>3.2){ const a=Math.random()*Math.PI*2, r=.6+Math.random()*1.6; F.p[i*3]=Math.cos(a)*r; F.p[i*3+1]=.1+Math.random()*.4; F.p[i*3+2]=.45+Math.sin(a)*r*.7; F.v[i*3+1]=.25+Math.random()*.6; }
   const x=F.p[i*3], z=F.p[i*3+2]-.45, sp=(.4+k*.9)*dt; F.p[i*3]=x*Math.cos(sp)-z*Math.sin(sp); F.p[i*3+2]=.45+x*Math.sin(sp)+z*Math.cos(sp); F.p[i*3+1]+=F.v[i*3+1]*dt*(.5+k); }
  flakes.geometry.attributes.position.needsUpdate=true;
  const E=embers.userData, eact=Math.floor(E.n*[0,.15,.45,1][st.heat]);
  for(let i=0;i<E.n;i++){ if(i>=eact){ E.p[i*3+1]=-99; continue; } if(E.p[i*3+1]<-50||E.p[i*3+1]>2.8){ E.p[i*3]=1.45+(Math.random()-.5)*.9; E.p[i*3+1]=.6; E.p[i*3+2]=1.65+(Math.random()-.5)*.9; E.v[i*3+1]=.6+Math.random()*1.2; } E.p[i*3+1]+=E.v[i*3+1]*dt*(.6+k); E.p[i*3]+=Math.sin(t*3+i)*dt*.15; }
  embers.geometry.attributes.position.needsUpdate=true;
  if(st.steamT>0){ st.steamT-=dt; if(Math.random()<.5) puff(roll.position.clone().add(V(0,.35,0)), 1); }
  if(st.phase==='boxed' && Math.random()<.04) puff(box.localToWorld(V(0,.9,0)),1);
  const P=steam.userData; for(let i=0;i<P.n;i++){ if(P.life[i]>0){ P.life[i]-=dt; P.p[i*3]+=P.v[i*3]*dt; P.p[i*3+1]+=P.v[i*3+1]*dt; P.p[i*3+2]+=P.v[i*3+2]*dt; if(P.life[i]<=0) P.p[i*3+1]=-99; } }
  steam.geometry.attributes.position.needsUpdate=true;
  pend.intensity = 16+Math.sin(t*1.3)*.6;
  if(focusT>0){ focusT-=dt; const r=1-Math.exp(-dt*2.4); cam.position.lerp(focus.pos,r); ctl.target.lerp(focus.tgt,r); }
  ctl.update();
 };
 S.onResize=(w,h)=>{ cam.fov = w<820?55:42; if(w>820) cam.setViewOffset(w,h,Math.min(220,w*.15),0,w,h); else cam.clearViewOffset(); cam.updateProjectionMatrix(); }; S.onResize(canvas.clientWidth,canvas.clientHeight);
 sync();
 window.__pk = {select:selectRoll, heat:setHeat, bake, box:doBox, get phase(){return st.phase;}};
});

/* ======================= 2. HEAT QUEST ======================= */
const MENU = window.ST_MENU || {boxes:[],flav:[],packs:[],events:[]};
const ZONES = [
 {name:'Roll Bar', icon:'🥖', photo:'roll-suya', sec:'roll-bar', col:'#c8161d'},
 {name:'Lunch Box', icon:'📦', photo:'box-classic', sec:'lunch-box', col:'#e59a1e'},
 {name:'Chin-Chin', icon:'🫙', photo:'pack-jar', sec:'chin-chin', col:'#b5651e'},
 {name:'Spicy Drop', icon:'🔥', photo:'drop', sec:'spicy-drop', col:'#7a0b0b'},
 {name:'Cakes & Events', icon:'🎂', photo:'cake', sec:'cakes-events', col:'#d4566e'},
 {name:'About', icon:'🏠', photo:'ingredients', sec:'about', col:'#2f6b22'}];
const FLAV_PICK = {1:'Sweet Heat', 2:'Suya Spice', 3:'Classic Pepper'};
function item(img,b,s,pr,pick){ return `<div class="hq-item${pick?' pick':''}"><img src="img/${img}-sm.webp" alt="" loading="lazy"><div><b>${b}${pick?'<span class="pk3">FOR YOUR HEAT</span>':''}</b><small>${s}</small></div>${pr?`<span class="pr">${pr}</span>`:''}</div>`; }
function zoneHTML(i,h){ const z=ZONES[i]; let o=`<span class="eyebrow">${z.icon} Stall ${i+1} of 6</span><h3>${z.name}</h3><div class="hero-ph"><img src="img/${z.photo}-sm.webp" alt="Concept image: ${z.name}"></div>`;
 if(i===0){ o+=`<div class="rec3">${CH[h]} <b>${HN[h]}</b> picks are highlighted.</div>`; ROLLS.forEach(r=>{ o+=item('roll-'+r.id, r.name, (r.heat?CH[r.heat]+' '+HN[r.heat]+' · ':'')+r.desc, fmt(r.price), r.heat===h); }); }
 else if(i===1){ o+=`<div class="rec3">Pre-order the evening before. Orders and transfers close at <b>10:00am</b>. Office champions get <b>1 free box for every 10</b>.</div>`; MENU.boxes.forEach(b=>o+=item(b.i||'box-classic',b.n,b.d,fmt(b.p), h>=2 && b.n==='Spicy Treat Box')); }
 else if(i===2){ o+=`<div class="rec3">Flavours: ${MENU.flav.map(f=>f.n).join(' · ')}. Suggested for ${HN[h]}: <b>${FLAV_PICK[h]}</b>.</div>`; MENU.flav.forEach(f=>o+=item('chinchin-macro',f.n,f.d,'',f.n===FLAV_PICK[h])); MENU.packs.forEach(p=>o+=item(p.i||'chinchin',p.n+' · '+p.s,p.d,p.p,false)); }
 else if(i===3){ o+=`<div class="rec3">One limited roll a week. Announced on WhatsApp and Instagram. Sample drop shown: <b>Peppered Snail Roll</b> (price: <i>placeholder, TBC</i>).</div>`+item('drop','Peppered Snail Roll','Sample of a weekly limited drop','TBC',h===3); }
 else if(i===4){ MENU.events.forEach(e=>o+=item(e.i,e.t,e.d,'',false)); o+=`<div class="rec3">Request a quote with the form below. Cakes need 3–5 days' notice.</div>`; }
 else { o+=`<div class="rec3">Our heat scale: 🌶 Small Pepper · 🌶🌶 Ata Dey · 🌶🌶🌶 Fire Dey. Every item is labelled.</div><p style="color:#d9cbb9;font-size:.9rem">Savoury and spicy Nigerian bakes, made in Lagos. Delivery areas: <i>[placeholder]</i>. Order on WhatsApp or Chowdeck.</p>`; }
 return o+`<a class="btn primary" style="width:100%;margin-top:10px" href="#${z.sec}" data-go>See the full ${z.name} section ↓</a>`; }

lazy('hq-stage', () => {
 const S = makeStage('hq-stage', {fov:50, exposure:1.1}); if(!S) return;
 const {scene, cam, canvas, el} = S;
 scene.background = T.sky('#f6b46a','#f6d3a0','#fbe9cf'); scene.fog = new THREE.Fog('#f7d9ab', 30, 75);
 scene.add(new THREE.HemisphereLight('#fff1d6','#7a4a2a',.9));
 const sun = new THREE.DirectionalLight('#ffd9a0', 2.6); sun.position.set(12,20,8); sun.castShadow=true; sun.shadow.mapSize.set(MOB?1024:2048,MOB?1024:2048); Object.assign(sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,far:60}); sun.shadow.bias=-.0005; sun.shadow.radius=3; scene.add(sun);
 const R=14;
 const grassT = ctex(256,256,(g,w,h)=>{ g.fillStyle='#7aa04a'; g.fillRect(0,0,w,h); speckle(g,w,h,3000,['#5d8a36','#94b85c','#6f9a40','#a7c46b'],1,3); },[6,6]);
 const island = new THREE.Mesh(new THREE.CylinderGeometry(R,R-.5,1,64), new THREE.MeshStandardMaterial({map:grassT, roughness:.9})); island.position.y=-.5; island.receiveShadow=true; scene.add(island);
 const rockG = new THREE.ConeGeometry(R-.4,9,48,6); const rp=rockG.attributes.position; for(let i=0;i<rp.count;i++){ const n=.6+.4*Math.sin(rp.getX(i)*1.3)*Math.cos(rp.getZ(i)*1.1); rp.setX(i,rp.getX(i)*(1+n*.08)); rp.setZ(i,rp.getZ(i)*(1+n*.08)); } rockG.computeVertexNormals();
 const rock = new THREE.Mesh(rockG, new THREE.MeshStandardMaterial({color:'#8a5a3a', roughness:.95, flatShading:true})); rock.rotation.x=Math.PI; rock.position.y=-5.5; scene.add(rock);
 const pathT = ctex(256,64,(g,w,h)=>{ g.fillStyle='#d9b98a'; g.fillRect(0,0,w,h); speckle(g,w,h,900,['#c2a070','#ead0a6','#b08c5c'],1,3); },[24,1]);
 const path = new THREE.Mesh(new THREE.RingGeometry(7.4,9.2,96), new THREE.MeshStandardMaterial({map:pathT, roughness:.9})); path.rotation.x=-Math.PI/2; path.position.y=.01; path.receiveShadow=true; scene.add(path);
 const plaza = new THREE.Mesh(new THREE.CircleGeometry(3.6,48), new THREE.MeshStandardMaterial({map:T.tiles('#e8d6b6','#b8a07c',[3,3]), roughness:.6})); plaza.rotation.x=-Math.PI/2; plaza.position.y=.012; plaza.receiveShadow=true; scene.add(plaza);
 [0,1,2,3,4,5].forEach(k=>{ const a=k/6*Math.PI*2-Math.PI/6+Math.PI/6; const sp=new THREE.Mesh(new THREE.PlaneGeometry(1.4,4.4), path.material); sp.rotation.x=-Math.PI/2; sp.rotation.z=-a+Math.PI/2; sp.position.set(Math.cos(a)*5.5,.011,Math.sin(a)*5.5); sp.receiveShadow=true; scene.add(sp); });
 // centrepiece giant roll
 const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.7,.8,32), new THREE.MeshStandardMaterial({map:T.wood('#7a4a26'), roughness:.5})); plinth.position.y=.4; plinth.castShadow=true; plinth.receiveShadow=true; scene.add(plinth);
 const big = makeRoll(0); big.setBake(1); big.scale.setScalar(1.9); big.position.y=1.85; scene.add(big);
 const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8), new THREE.MeshStandardMaterial({map:T.label('Spicy Treat'), roughness:.4})); sign.position.set(0,3.6,0); scene.add(sign);
 // palms
 const trunkM=new THREE.MeshStandardMaterial({color:'#8a6239',roughness:.9}), leafM=new THREE.MeshStandardMaterial({color:'#3f7a2c',roughness:.6,side:THREE.DoubleSide});
 function palm(x,z,s){ const p=new THREE.Group(); const tr=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,3.4,8),trunkM); tr.position.y=1.7; tr.rotation.z=.08; tr.castShadow=true; p.add(tr); for(let i=0;i<7;i++){ const l=new THREE.Mesh(new THREE.PlaneGeometry(.5,2.2,1,4),leafM); const lp=l.geometry.attributes.position; for(let k=0;k<lp.count;k++) lp.setZ(k,-Math.pow(lp.getY(k)+1.1,2)*.18); l.geometry.computeVertexNormals(); l.position.set(0,3.3,0); l.rotation.set(-1.1,i/7*Math.PI*2,0,'YXZ'); l.translateY(1); l.castShadow=true; p.add(l); } p.position.set(x,0,z); p.scale.setScalar(s); scene.add(p); }
 // stalls
 const stalls=[], ARR=[], stallR=11.4;
 ZONES.forEach((z,i)=>{ const a=i/6*Math.PI*2; const g=new THREE.Group(); g.position.set(Math.cos(a)*stallR,0,Math.sin(a)*stallR); g.lookAt(0,0,0); scene.add(g);
  const woodM=new THREE.MeshStandardMaterial({map:T.wood('#9a6a3c'),roughness:.55});
  const ctr=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.1,1.1),woodM); ctr.position.set(0,.55,.2); ctr.castShadow=true; ctr.receiveShadow=true; g.add(ctr);
  const top=new THREE.Mesh(new THREE.BoxGeometry(3.4,.08,1.3),new THREE.MeshPhysicalMaterial({color:'#efe4d2',roughness:.25,clearcoat:.6})); top.position.set(0,1.14,.2); g.add(top);
  [-1.5,1.5].forEach(x=>{ const po=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2.8,8),woodM); po.position.set(x,1.4,.7); po.castShadow=true; g.add(po); const pb=po.clone(); pb.position.z=-.4; g.add(pb); });
  const stripes=ctex(256,64,(c,w,h)=>{ for(let k=0;k<8;k++){ c.fillStyle=k%2?'#fbf4e8':z.col; c.fillRect(k*32,0,32,h);} c.fillStyle='rgba(0,0,0,.12)'; c.fillRect(0,h-8,w,8); });
  const awn=new THREE.Mesh(new THREE.BoxGeometry(3.6,.08,1.7),new THREE.MeshStandardMaterial({map:stripes,roughness:.7})); awn.position.set(0,2.85,.25); awn.rotation.x=.22; awn.castShadow=true; g.add(awn);
  const val=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.3),new THREE.MeshStandardMaterial({map:stripes,side:THREE.DoubleSide})); val.position.set(0,2.55,1.07); g.add(val);
  const board=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.6,.08),new THREE.MeshStandardMaterial({color:'#2a1a12',roughness:.5})); board.position.set(0,2.0,-.45); g.add(board);
  const ph=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.4),new THREE.MeshStandardMaterial({map:photo(z.photo),roughness:.35})); ph.position.set(0,2.0,-.405); g.add(ph);
  const nm=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.5),new THREE.MeshStandardMaterial({map:T.label(z.icon+' '+z.name,'#fbf4e8',z.col,512,100,46),transparent:true})); nm.position.set(0,3.35,.6); nm.rotation.x=-.1; g.add(nm);
  const dish=new THREE.Mesh(new THREE.CylinderGeometry(.5,.4,.06,24),new THREE.MeshPhysicalMaterial({color:'#fff',roughness:.15,clearcoat:1})); dish.position.set(-.8,1.21,.35); g.add(dish);
  const fd=new THREE.Mesh(new THREE.SphereGeometry(.35,24,16),new THREE.MeshPhysicalMaterial({map:photo(z.photo,[.3,.3,.35,.35]),roughness:.4,clearcoat:.6})); fd.scale.y=.55; fd.position.set(-.8,1.36,.35); fd.castShadow=true; g.add(fd);
  const lamp=new THREE.PointLight('#ffb35a',0,6,2); lamp.position.set(0,2.4,1.2); g.add(lamp);
  const glow=new THREE.Mesh(new THREE.RingGeometry(1.0,1.25,48),new THREE.MeshBasicMaterial({color:'#ffcf6a',transparent:true,opacity:0,toneMapped:false,side:THREE.DoubleSide})); glow.rotation.x=-Math.PI/2; glow.position.set(Math.cos(a)*8.3,.03,Math.sin(a)*8.3); scene.add(glow);
  g.traverse(o=>{ if(o.isMesh) o.userData.zone=i; });
  stalls.push({g,lamp,glow,fd}); ARR.push(V(Math.cos(a)*8.3,0,Math.sin(a)*8.3));
  palm(Math.cos(a+Math.PI/6)*12.2, Math.sin(a+Math.PI/6)*12.2, .8+Math.random()*.3);
 });
 // clouds
 const cloudM=new THREE.MeshStandardMaterial({color:'#fff',roughness:1,transparent:true,opacity:.92}); const clouds=[];
 for(let i=0;i<7;i++){ const c=new THREE.Group(); for(let k=0;k<4;k++){ const s=new THREE.Mesh(new THREE.SphereGeometry(1+Math.random(),12,10),cloudM); s.position.set(k*1.3,Math.random()*.6,Math.random()); c.add(s);} const a=Math.random()*Math.PI*2, r=22+Math.random()*10; c.position.set(Math.cos(a)*r,-4+Math.random()*12,Math.sin(a)*r); c.userData.a=a; c.userData.r=r; scene.add(c); clouds.push(c); }
 const embers=particles(MOB?50:90,T.ember(),.25); scene.add(embers);
 // characters
 let hero=null, heat=0, playing=false, zoneOpen=-1, yaw=0, target=null;
 const lineup=new THREE.Group(); scene.add(lineup);
 [1,2,3].forEach((h,k)=>{ const p=makePepper(h,true); p.scale.multiplyScalar(1.3); p.userData.base=(h===3?1.2:.6)*p.scale.y; p.position.set((k-1)*1.5,p.userData.base,4.6); p.traverse(o=>{ if(o.isMesh) o.userData.choose=h; }); lineup.add(p); });
 const flame=new THREE.Group(); for(let i=0;i<6;i++){ const f=new THREE.Mesh(new THREE.ConeGeometry(.09,.4,8),new THREE.MeshBasicMaterial({color:i%2?'#ffb02a':'#ff4a12',transparent:true,opacity:.85,blending:THREE.AdditiveBlending,toneMapped:false})); f.position.set(Math.cos(i)*.1,0,Math.sin(i)*.1); f.userData.ph=i; flame.add(f);} 
 const pos=V(0,0,5.6);
 cam.position.set(0,6.5,13); const look=V(0,1.6,3.5); cam.lookAt(look);
 canvas.style.touchAction='pan-y';
 const choose=$('#hqChoose'), status=$('#hqStatus'), zonesEl=$('#hqZones'), drawer=$('#hqDrawer'), dc=$('#hqDC'), joy=$('#hqJoy');
 if(TOUCH) el.classList.add('hq-on-touch');
 function chooseChar(h, fromGlobal){ heat=h; if(hero) scene.remove(hero); hero=makePepper(h,true); hero.scale.multiplyScalar(1.4); scene.add(hero); hero.add(flame); flame.visible=h===3; flame.position.set(0,h===3?1.05:.8,0);
  lineup.visible=false; playing=true; choose.classList.add('gone'); status.classList.add('on'); zonesEl.classList.add('on'); joy.classList.add('on');
  $('#hqWho').textContent=CH[h]+' '+HN[h]; stalls.forEach(()=>{}); if(zoneOpen>=0) dc.innerHTML=zoneHTML(zoneOpen,heat);
  if(!fromGlobal) window.stSetHeat && window.stSetHeat(h,'quest'); }
 function openZone(i){ zoneOpen=i; dc.innerHTML=zoneHTML(i,heat||2); drawer.classList.add('on'); $$('#hqZones button').forEach((b,k)=>b.classList.toggle('on',k===i)); }
 function closeZone(){ zoneOpen=-1; drawer.classList.remove('on'); $$('#hqZones button').forEach(b=>b.classList.remove('on')); }
 function goZone(i){ if(!playing) chooseChar(heat||2); target={p:ARR[i].clone(),zone:i}; closeZone(); }
 $$('#hqChoose button').forEach(b=>b.onclick=()=>chooseChar(+b.dataset.h));
 $('#hqSwap').onclick=()=>{ playing=false; closeZone(); lineup.visible=true; if(hero) hero.visible=false; choose.classList.remove('gone'); status.classList.remove('on'); zonesEl.classList.remove('on'); joy.classList.remove('on'); };
 $$('#hqZones button').forEach(b=>b.onclick=()=>goZone(+b.dataset.z));
 $('#hqX').onclick=closeZone;
 dc.addEventListener('click',e=>{ if(e.target.closest('[data-go]')) closeZone(); });
 window.addEventListener('stheat',e=>{ if(e.detail.src!=='quest' && playing){ chooseChar(e.detail.h,true); } else if(e.detail.src!=='quest') heat=e.detail.h; });
 // input
 const keys={}; let kbFocus=false;
 canvas.addEventListener('focus',()=>kbFocus=true); canvas.addEventListener('blur',()=>kbFocus=false);
 addEventListener('keydown',e=>{ if(!S.visible||!playing) return; const k=e.key.toLowerCase(); if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){ if(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return; const r=el.getBoundingClientRect(); if(r.top>innerHeight*.5||r.bottom<innerHeight*.5) return; keys[k]=true; target=null; if(k.startsWith('arrow')) e.preventDefault(); } });
 addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
 const ray=new THREE.Raycaster(), ground=new THREE.Plane(V(0,1,0),0);
 tapHandler(canvas, e=>{ ray.setFromCamera(ndc(canvas,e),cam); const hits=ray.intersectObjects(scene.children,true); const c=hits.find(h=>h.object.userData.choose); if(c && !playing){ chooseChar(c.object.userData.choose); return; } if(!playing) return; const z=hits.find(h=>h.object.userData.zone!==undefined); if(z){ goZone(z.object.userData.zone); return; } const p=V(); if(ray.ray.intersectPlane(ground,p) && p.length()<R-.8){ target={p,zone:-1}; closeZone(); } }, dx=>{ yaw-=dx*.006; });
 let jv={x:0,y:0}, jid=null; const knob=joy.querySelector('i');
 function jmove(e){ const r=joy.getBoundingClientRect(); let x=(e.clientX-r.left-r.width/2)/(r.width/2), y=(e.clientY-r.top-r.height/2)/(r.height/2); const l=Math.hypot(x,y); if(l>1){x/=l;y/=l;} jv={x,y}; knob.style.transform=`translate(${x*32}px,${y*32}px)`; }
 joy.addEventListener('pointerdown',e=>{ jid=e.pointerId; joy.setPointerCapture(jid); jmove(e); target=null; e.preventDefault(); });
 joy.addEventListener('pointermove',e=>{ if(e.pointerId===jid) jmove(e); });
 const jend=()=>{ jid=null; jv={x:0,y:0}; knob.style.transform=''; }; joy.addEventListener('pointerup',jend); joy.addEventListener('pointercancel',jend);
 let near=-1, walkT=0;
 S.update=(dt,t)=>{
  big.rotation.y+=dt*.3; big.position.y=1.85+Math.sin(t*1.5)*.08; sign.lookAt(cam.position.x,3.6,cam.position.z);
  clouds.forEach(c=>{ c.userData.a+=dt*.01; c.position.x=Math.cos(c.userData.a)*c.userData.r; c.position.z=Math.sin(c.userData.a)*c.userData.r; });
  lineup.children.forEach((p,k)=>{ p.rotation.y=Math.sin(t+k)*.5; p.position.y=p.userData.base+Math.abs(Math.sin(t*3+k))*.25; });
  let mx=0, mz=0;
  if(playing && hero){ hero.visible=true;
   const fwd=(keys.arrowup||keys.w?1:0)-(keys.arrowdown||keys.s?1:0)-jv.y, turn=(keys.arrowleft||keys.a?1:0)-(keys.arrowright||keys.d?1:0)-jv.x;
   if(Math.abs(fwd)>.05||Math.abs(turn)>.05){ const f=V(-Math.sin(yaw),0,-Math.cos(yaw)), r=V(Math.cos(yaw),0,-Math.sin(yaw)); mx=f.x*fwd-r.x*turn; mz=f.z*fwd-r.z*turn; }
   else if(target){ const d=target.p.clone().sub(pos); d.y=0; const l=d.length(); if(l<.15){ if(target.zone>=0) openZone(target.zone); target=null; } else { mx=d.x/l; mz=d.z/l; } }
   const l=Math.hypot(mx,mz); if(l>0){ mx/=Math.max(1,l); mz/=Math.max(1,l); const sp=5.2; pos.x+=mx*sp*dt; pos.z+=mz*sp*dt; const ang=Math.atan2(mx,mz); let d=ang-hero.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); hero.rotation.y+=d*Math.min(1,dt*10); walkT+=dt*12; }
   const rr=Math.hypot(pos.x,pos.z); if(rr>R-1.2){ pos.x*=(R-1.2)/rr; pos.z*=(R-1.2)/rr; } if(rr<2.1){ pos.x*=2.1/Math.max(rr,.01); pos.z*=2.1/Math.max(rr,.01); }
   ARR.forEach((a,i)=>{ const s=stalls[i].g.position; const dx=pos.x-s.x, dz=pos.z-s.z, dd=Math.hypot(dx,dz); if(dd<2.4){ pos.x=s.x+dx/dd*2.4; pos.z=s.z+dz/dd*2.4; } });
   const baseY=(heat===3?1.2:.6)*hero.scale.y; hero.position.set(pos.x, baseY+(l>0?Math.abs(Math.sin(walkT))*.18:Math.sin(t*2)*.04), pos.z); hero.rotation.z=l>0?Math.sin(walkT)*.08:0;
   let nn=-1; ARR.forEach((a,i)=>{ if(a.distanceTo(V(pos.x,0,pos.z))<1.6) nn=i; });
   if(nn!==near){ near=nn; if(nn>=0 && zoneOpen!==nn && !target) openZone(nn); }
   flame.children.forEach(f=>{ f.scale.y=.8+Math.sin(t*18+f.userData.ph)*.35; });
   const want=V(pos.x+Math.sin(yaw)*(MOB?9.5:8.2), MOB?7.2:6.2, pos.z+Math.cos(yaw)*(MOB?9.5:8.2)); cam.position.lerp(want,1-Math.exp(-dt*3)); look.lerp(V(pos.x,1.2,pos.z),1-Math.exp(-dt*5)); cam.lookAt(look);
  } else { const a=t*.12; cam.position.lerp(V(Math.sin(a)*3,6.5,13),1-Math.exp(-dt*2)); look.lerp(V(0,1.6,3.5),1-Math.exp(-dt*3)); cam.lookAt(look); }
  stalls.forEach((s,i)=>{ const on=i===zoneOpen||i===near; const rec = heat && ((i===0)||(i===2)||(i===3&&heat===3)||(i===1&&heat>=2)); s.lamp.intensity=lerp(s.lamp.intensity,on?14:(rec?5:1.5),dt*4); s.glow.material.opacity=lerp(s.glow.material.opacity,on?.9:(playing?.35+Math.sin(t*3+i)*.15:0),dt*4); s.fd.rotation.y+=dt*.5; });
  const E=embers.userData, ea=Math.floor(E.n*[.1,.2,.5,1][heat]);
  for(let i=0;i<E.n;i++){ if(i>=ea){ E.p[i*3+1]=-99; continue; } if(E.p[i*3+1]<-50||E.p[i*3+1]>9){ const a=Math.random()*Math.PI*2,r=Math.random()*R; E.p[i*3]=Math.cos(a)*r; E.p[i*3+1]=0; E.p[i*3+2]=Math.sin(a)*r; E.v[i*3+1]=.5+Math.random()*1.4; } E.p[i*3+1]+=E.v[i*3+1]*dt; E.p[i*3]+=Math.sin(t+i)*dt*.3; }
  embers.geometry.attributes.position.needsUpdate=true;
 };
 window.__hq={choose:chooseChar, goZone, get zone(){return zoneOpen;}, get pos(){return pos.clone();}};
});

/* ======================= 3. LAGOS LUNCH RUN ======================= */
lazy('lr-stage', () => {
 const S = makeStage('lr-stage', {fov: MOB?62:52, exposure:1.05}); if(!S) return;
 const {scene, cam, canvas, el} = S;
 scene.background = T.sky('#ffc98a','#ffe0b0','#fff1dc'); scene.fog = new THREE.Fog('#ffe2b8', 28, 85);
 scene.add(new THREE.HemisphereLight('#fff3dc','#6a4a34',.9));
 const sun = new THREE.DirectionalLight('#ffd7a0', 2.4); sun.position.set(-8,14,6); sun.castShadow=true; sun.shadow.mapSize.set(MOB?1024:2048,MOB?1024:2048); Object.assign(sun.shadow.camera,{left:-10,right:10,top:20,bottom:-12,far:60}); sun.shadow.bias=-.0005; scene.add(sun); scene.add(sun.target);
 const LANES=[-2.2,0,2.2], LEN=120;
 const roadT = ctex(256,512,(g,w,h)=>{ g.fillStyle='#3a3734'; g.fillRect(0,0,w,h); speckle(g,w,h,3000,['#2a2826','#4a4643','#55504c'],1,3); g.fillStyle='#f4efe6'; [w/3,2*w/3].forEach(x=>{ for(let y=0;y<h;y+=128) g.fillRect(x-3,y,6,64); }); g.fillStyle='#f2c230'; g.fillRect(6,0,6,h); g.fillRect(w-12,0,6,h); },[1,LEN/16]);
 const road = new THREE.Mesh(new THREE.PlaneGeometry(7.4,LEN), new THREE.MeshStandardMaterial({map:roadT, roughness:.75})); road.rotation.x=-Math.PI/2; road.position.z=-LEN/2+12; road.receiveShadow=true; scene.add(road);
 const swT = ctex(128,128,(g,w,h)=>{ g.fillStyle='#c9b79c'; g.fillRect(0,0,w,h); g.strokeStyle='#a8977c'; g.lineWidth=3; for(let i=0;i<=4;i++){ g.beginPath(); g.moveTo(0,i*32); g.lineTo(w,i*32); g.stroke(); } speckle(g,w,h,300,['#b5a488','#ddd0b8'],1,2); },[2,LEN/4]);
 [-1,1].forEach(s=>{ const sw=new THREE.Mesh(new THREE.BoxGeometry(3,.25,LEN),new THREE.MeshStandardMaterial({map:swT,roughness:.85})); sw.position.set(s*5.2,.12,-LEN/2+12); sw.receiveShadow=true; scene.add(sw); const gr=new THREE.Mesh(new THREE.PlaneGeometry(40,LEN),new THREE.MeshStandardMaterial({color:'#b89a72',roughness:1})); gr.rotation.x=-Math.PI/2; gr.position.set(s*26,-.01,-LEN/2+12); scene.add(gr); });
 // scenery pool
 const winTex=['#d9cfc0','#c7a77f','#e8e0d2','#9fb3bf','#e4c9a0'].map(c=>T.windows(c));
 const signs=['OFFICES','PLAZA','TOWER','HOUSE','CENTRE'];
 const scen=[]; const SPAN=10;
 for(let i=0;i<14;i++){ const s=i%2?1:-1, g=new THREE.Group(); const h=5+Math.random()*9, w=4+Math.random()*2.5;
  const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,6.5),new THREE.MeshStandardMaterial({map:winTex[i%5],roughness:.55,envMapIntensity:.6})); b.material.map=b.material.map.clone(); b.material.map.wrapS=b.material.map.wrapT=THREE.RepeatWrapping; b.material.map.repeat.set(w/4,h/7); b.material.map.needsUpdate=true; b.position.set(s*(7.3+w/2),h/2,0); b.castShadow=true; b.receiveShadow=true; g.add(b);
  if(i%3===0){ const sg=new THREE.Mesh(new THREE.PlaneGeometry(3,.7),new THREE.MeshStandardMaterial({map:T.label(['Marina','Broad St','Adeola Odeku','Admiralty','Allen Ave'][i%5]+' '+signs[i%5],'#fbf4e8','#1e3a4a',512,110,40)})); sg.position.set(s*(7.3-.01),3.2,0); sg.rotation.y=-s*Math.PI/2; g.add(sg); }
  if(i%2===0){ const pt=new THREE.Mesh(new THREE.CylinderGeometry(.1,.16,3.4,8),new THREE.MeshStandardMaterial({color:'#8a6239'})); pt.position.set(s*4.5,1.9,2.5); pt.castShadow=true; g.add(pt); const cr=new THREE.Mesh(new THREE.SphereGeometry(1.1,10,8),new THREE.MeshStandardMaterial({color:'#3f7a2c',roughness:.8,flatShading:true})); cr.scale.y=.55; cr.position.set(s*4.5,3.7,2.5); cr.castShadow=true; g.add(cr); }
  else { const lp=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,4.2,6),new THREE.MeshStandardMaterial({color:'#333',metalness:.6,roughness:.4})); lp.position.set(s*4.2,2.35,-2); g.add(lp); const lh=new THREE.Mesh(new THREE.BoxGeometry(.9,.12,.3),lp.material); lh.position.set(s*3.8,4.4,-2); g.add(lh); }
  g.position.z=-Math.floor(i/2)*SPAN+8; scene.add(g); scen.push(g); }
 // rider
 const rider=new THREE.Group(); scene.add(rider);
 const bodyM=new THREE.MeshPhysicalMaterial({color:'#c8161d',metalness:.3,roughness:.25,clearcoat:1}), blk=new THREE.MeshStandardMaterial({color:'#151515',roughness:.6}), chrome=new THREE.MeshPhysicalMaterial({color:'#ddd',metalness:1,roughness:.15});
 const wheels=[]; [.95,-.9].forEach(z=>{ const w=new THREE.Mesh(new THREE.TorusGeometry(.36,.13,12,24),blk); w.rotation.y=Math.PI/2; w.position.set(0,.48,z); w.castShadow=true; rider.add(w); wheels.push(w); const hub=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.2,12),chrome); hub.rotation.z=Math.PI/2; hub.position.copy(w.position); rider.add(hub); });
 const frame=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,1.5),bodyM); frame.position.set(0,.8,0); frame.castShadow=true; rider.add(frame);
 const tank=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),bodyM); tank.scale.set(1,.7,1.4); tank.position.set(0,1.05,.42); rider.add(tank);
 const seat=new THREE.Mesh(new THREE.BoxGeometry(.4,.14,.95),blk); seat.position.set(0,1.1,-.35); rider.add(seat);
 const fork=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.1,8),chrome); fork.position.set(0,1.0,.98); fork.rotation.x=-.35; rider.add(fork);
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.0,8),chrome); bar.rotation.z=Math.PI/2; bar.position.set(0,1.5,.8); rider.add(bar);
 const headl=new THREE.Mesh(new THREE.SphereGeometry(.13,12,10),new THREE.MeshBasicMaterial({color:'#fff6d0'})); headl.position.set(0,1.28,1.08); rider.add(headl);
 const shirt=new THREE.MeshStandardMaterial({color:'#e59a1e',roughness:.7}), skin=new THREE.MeshStandardMaterial({color:'#6b3e26',roughness:.6}), pants=new THREE.MeshStandardMaterial({color:'#2b3a55',roughness:.8});
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.27,.5,6,12),shirt); torso.position.set(0,1.75,-.2); torso.rotation.x=.3; torso.castShadow=true; rider.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.2,16,12),skin); head.position.set(0,2.32,-.02); rider.add(head);
 const helm=new THREE.Mesh(new THREE.SphereGeometry(.24,16,12,0,Math.PI*2,0,Math.PI/1.8),new THREE.MeshPhysicalMaterial({color:'#f4c430',roughness:.2,clearcoat:1})); helm.position.set(0,2.36,-.04); rider.add(helm);
 [-1,1].forEach(s=>{ const a=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.55,4,8),shirt); a.position.set(s*.32,1.75,.3); a.rotation.x=1.1; rider.add(a); const l=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.55,4,8),pants); l.position.set(s*.25,1.05,-.05); l.rotation.x=1.3; rider.add(l); });
 const kraftM=new THREE.MeshPhysicalMaterial({map:T.brandSide(),roughness:.5,clearcoat:.3});
 const carry=new THREE.Mesh(new THREE.BoxGeometry(.75,.5,.6),kraftM); carry.position.set(0,1.45,-.95); carry.castShadow=true; rider.add(carry);
 const stk=new THREE.Mesh(new THREE.CircleGeometry(.16,24),new THREE.MeshStandardMaterial({map:T.sticker(2)})); stk.position.set(0,1.45,-1.251); stk.rotation.y=Math.PI; rider.add(stk);
 const stack=[]; for(let i=0;i<3;i++){ const b=carry.clone(); b.scale.setScalar(.6); b.position.y=1.45+.32*(i+1); b.visible=false; rider.add(b); stack.push(b); }
 rider.rotation.y=Math.PI; // face forward (-z)
 // pickups & obstacles
 const pickM=kraftM, goldM=new THREE.MeshPhysicalMaterial({color:'#f2b632',metalness:.6,roughness:.25,clearcoat:1});
 const beamM=new THREE.MeshBasicMaterial({color:'#ffd27a',transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const items=[];
 function mkPick(gold){ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(.9,.6,.7),gold?goldM:pickM); b.position.y=.9; b.castShadow=true; g.add(b); const r=new THREE.Mesh(new THREE.BoxGeometry(.95,.08,.75),new THREE.MeshStandardMaterial({color:'#c8161d'})); r.position.y=1.0; g.add(r); const beam=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,5,16,1,true),beamM); beam.position.y=2.5; g.add(beam); const ring=new THREE.Mesh(new THREE.TorusGeometry(.7,.05,8,32),new THREE.MeshBasicMaterial({color:gold?'#ffcf3a':'#ffe2a8',toneMapped:false})); ring.rotation.x=Math.PI/2; ring.position.y=.05; g.add(ring); g.userData={type:gold?'gold':'pick',box:b}; return g; }
 const danfoT=ctex(256,128,(g,w,h)=>{ g.fillStyle='#f2c230'; g.fillRect(0,0,w,h); g.fillStyle='#111'; g.fillRect(0,h*.62,w,10); g.fillRect(0,h*.8,w,6); g.fillStyle='#2b3a4a'; for(let x=10;x<w-20;x+=46) g.fillRect(x,14,38,40); g.fillStyle='#111'; g.font='bold 20px sans-serif'; g.fillText('OSHODI - CMS',60,h-10); });
 function mkDanfo(){ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(1.9,1.9,4.2),[new THREE.MeshStandardMaterial({map:danfoT}),new THREE.MeshStandardMaterial({map:danfoT}),new THREE.MeshStandardMaterial({color:'#f2c230'}),blk,new THREE.MeshPhysicalMaterial({color:'#2b3a4a',roughness:.1,clearcoat:1}),new THREE.MeshStandardMaterial({color:'#f2c230'})]); b.position.y=1.35; b.castShadow=true; g.add(b); [-1.4,1.4].forEach(z=>[-.85,.85].forEach(x=>{ const w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.3,16),blk); w.rotation.z=Math.PI/2; w.position.set(x,.38,z); g.add(w); })); g.userData={type:'danfo',half:2.2}; return g; }
 function mkCone(){ const g=new THREE.Group(); const c=new THREE.Mesh(new THREE.ConeGeometry(.32,.9,16),new THREE.MeshStandardMaterial({color:'#ff6a1a',roughness:.5})); c.position.y=.45; c.castShadow=true; g.add(c); const s=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,.12,16),new THREE.MeshStandardMaterial({color:'#fff'})); s.position.y=.5; g.add(s); g.userData={type:'cone',half:.5}; return g; }
 function spawn(z){ const lane=(Math.random()*3)|0, r=Math.random(); let o; if(r<.5) o=mkPick(Math.random()<.12); else if(r<.75) o=mkDanfo(); else o=mkCone(); o.position.set(LANES[lane],0,z); o.userData.lane=lane; scene.add(o); items.push(o);
  if(o.userData.type!=='pick'&&o.userData.type!=='gold' && Math.random()<.6){ const l2=(lane+1+((Math.random()*2)|0))%3; const p=mkPick(false); p.position.set(LANES[l2],0,z); p.userData.lane=l2; scene.add(p); items.push(p); } }
 // state
 const DUR=45; let state='idle', auto=true, lane=1, x=0, gt=0, score=0, nextZ=-20, travelled=0, hitCD=0, shake=0;
 const clockEl=$('#lrClock'), scoreEl=$('#lrScore'), freeEl=$('#lrFree'), startEl=$('#lrStart'), resEl=$('#lrResult'), ctrlEl=$('#lrCtrl');
 function hud(){ const mins=Math.min(30,Math.floor(gt/DUR*30)); clockEl.textContent = (mins>=30?'10:00':'9:'+String(30+mins).padStart(2,'0')); scoreEl.textContent=score; freeEl.textContent=Math.floor(score/10); }
 function pop(txt,bad){ const d=document.createElement('div'); d.className='lr-pop'+(bad?' bad':''); d.textContent=txt; el.appendChild(d); setTimeout(()=>d.remove(),900); }
 function clearItems(){ items.forEach(o=>scene.remove(o)); items.length=0; nextZ=-20; }
 function start(){ const sr=el.getBoundingClientRect(); if(sr.top<50||sr.top>innerHeight*.3) el.scrollIntoView({behavior:'smooth',block:'start'}); clearItems(); state='play'; auto=false; lane=1; gt=0; score=0; travelled=0; stack.forEach(b=>b.visible=false); startEl.classList.add('gone'); resEl.classList.remove('on'); ctrlEl.classList.add('on'); hud(); canvas.focus({preventScroll:true}); }
 function end(){ state='done'; ctrlEl.classList.remove('on'); const free=Math.floor(score/10);
  $('#lrBig').textContent=score+' orders'; $('#lrText').innerHTML = score>=10 ? `Office champion! That's <b>${free} free box${free>1?'es':''}</b> 🎉` : `Just ${10-score} more for a free box. So close!`;
  $('#lrWA').href = WA+encodeURIComponent(`Hi Spicy Treat! I'm our office lunch champion. I just delivered ${score} orders in the Lagos Lunch Run 😄 I'd like to pre-order lunch boxes for tomorrow:\n[number] x [box]\nOffice/area: [area]`);
  resEl.classList.add('on'); }
 function steer(d){ if(state!=='play') return; lane=Math.max(0,Math.min(2,lane+d)); }
 $('#lrGo').onclick=start; $('#lrAgain').onclick=start;
 $('#lrL').addEventListener('pointerdown',e=>{ e.preventDefault(); steer(-1); }); $('#lrR').addEventListener('pointerdown',e=>{ e.preventDefault(); steer(1); });
 addEventListener('keydown',e=>{ if(state!=='play'||!S.visible) return; if(e.key==='ArrowLeft'||e.key==='a'){ steer(-1); e.preventDefault(); } if(e.key==='ArrowRight'||e.key==='d'){ steer(1); e.preventDefault(); } });
 let sx=null, sy=null, swiped=false;
 canvas.addEventListener('pointerdown',e=>{ sx=e.clientX; sy=e.clientY; swiped=false; });
 canvas.addEventListener('pointermove',e=>{ if(sx===null||swiped) return; const dx=e.clientX-sx; if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(e.clientY-sy)){ steer(dx>0?1:-1); swiped=true; } });
 canvas.addEventListener('pointerup',e=>{ if(sx!==null && !swiped && Math.abs(e.clientX-sx)<10 && Math.abs(e.clientY-sy)<10){ const r=canvas.getBoundingClientRect(); steer(e.clientX-r.left<r.width/2?-1:1); } sx=null; });
 canvas.style.touchAction='pan-y';
 let scrollBoost=0, lastSY=scrollY; addEventListener('scroll',()=>{ if(S.visible) scrollBoost=Math.min(1.5,scrollBoost+Math.abs(scrollY-lastSY)*.004); lastSY=scrollY; },{passive:true});
 S.update=(dt,t)=>{
  let speed;
  if(state==='play'){ gt+=dt; speed=13+gt*.2; if(gt>=DUR){ gt=DUR; hud(); end(); } }
  else speed= state==='idle' ? 9+scrollBoost*8 : 4;
  scrollBoost=Math.max(0,scrollBoost-dt*.8);
  if(state!=='play' && state!=='done'){ // autopilot
   const ahead=items.filter(o=>o.position.z<0 && o.position.z>-14).sort((a,b)=>b.position.z-a.position.z);
   const danger=ahead.find(o=>(o.userData.type==='danfo'||o.userData.type==='cone') && o.userData.lane===lane);
   const want=ahead.find(o=>o.userData.type!=='danfo'&&o.userData.type!=='cone');
   if(danger){ const safe=[0,1,2].filter(l=>!ahead.some(o=>(o.userData.type==='danfo'||o.userData.type==='cone')&&o.userData.lane===l&&o.position.z>-10)); if(safe.length) lane=safe.sort((a,b)=>Math.abs(a-lane)-Math.abs(b-lane))[0]; }
   else if(want && Math.random()<.05) lane=want.userData.lane;
  }
  const d=speed*dt; travelled+=d; roadT.offset.y=(roadT.offset.y+d/16)%1; swT.offset.y=(swT.offset.y+d/4)%1;
  scen.forEach(g=>{ g.position.z+=d; if(g.position.z>14) g.position.z-=7*SPAN; });
  nextZ+=d; while(nextZ>-90){ nextZ-=(state==='play'?7:9)+Math.random()*6; spawn(nextZ); }
  const tx=LANES[lane]; x=lerp(x,tx,1-Math.exp(-dt*12)); rider.position.x=x; rider.rotation.z=(x-tx)*.25; rider.position.y=Math.abs(Math.sin(t*20))*.02;
  wheels.forEach(w=>w.rotation.x-=d*2.6);
  hitCD=Math.max(0,hitCD-dt);
  for(let i=items.length-1;i>=0;i--){ const o=items[i]; o.position.z+=d; const ty=o.userData.type;
   if(ty==='pick'||ty==='gold'){ o.userData.box.rotation.y+=dt*2; o.userData.box.position.y=.9+Math.sin(t*4+i)*.12; }
   const half=o.userData.half||.5; if(Math.abs(o.position.z)<half+.8 && Math.abs(o.position.x-x)<1.1){
    if(ty==='pick'||ty==='gold'){ const v=ty==='gold'?5:1; if(state==='play'){ score+=v; pop('+'+v+(v>1?' Team Box!':' order'),false); stack.forEach((b,k)=>b.visible=k<Math.min(3,Math.floor(score/10))); hud(); } scene.remove(o); items.splice(i,1); continue; }
    else if(hitCD<=0){ hitCD=1; shake=.35; if(state==='play'){ gt=Math.min(DUR,gt+1.5); pop(ty==='danfo'?'Danfo! −1 min':'Cone! −1 min',true); hud(); } } }
   if(o.position.z>12){ scene.remove(o); items.splice(i,1); } }
  shake=Math.max(0,shake-dt);
  const cz=MOB?8.6:7.4, cy=MOB?5.6:4.4;
  cam.position.set(x*.6+(Math.random()-.5)*shake, cy+(Math.random()-.5)*shake, cz); cam.lookAt(x*.4,1.2,-8);
  sun.position.set(-8+x,14,6); sun.target.position.set(x,0,-4);
  if(state==='play') hud();
 };
 hud();
 window.__lr={start, end, get score(){return score;}, get state(){return state;}, set auto(v){auto=v;}, steer, get lane(){return lane;}, get items(){return items.map(o=>({t:o.userData.type,l:o.userData.lane,z:o.position.z}));}};
});
