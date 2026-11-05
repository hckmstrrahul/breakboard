// Original, deterministic score. Every sound is synthesized here; no samples.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const DURATION=30;
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SR=48000,N=SR*DURATION,TAU=Math.PI*2,BEAT=60/96,BAR=4*BEAT;
const L=new Float32Array(N),R=new Float32Array(N);
let seed=348195;function noise(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;}
const hz=n=>440*2**((n-69)/12);
function voice(at,duration,note,amp,pan=0,kind='key'){
 const first=Math.round(at*SR),length=Math.round(duration*SR),f=hz(note),lg=Math.sqrt((1-pan)/2),rg=Math.sqrt((1+pan)/2);
 for(let j=0;j<length&&first+j<N;j++){
  const t=j/SR,p=TAU*f*t;let sample;
  if(kind==='pad'){
   const attack=Math.min(1,t/1.2),release=Math.min(1,(duration-t)/1.6),breath=.92+.08*Math.sin(TAU*.08*t);
   sample=(Math.sin(p)+.20*Math.sin(p*2)+.11*Math.sin(p*1.0014+.5))*attack*release*breath*.68;
  }else if(kind==='bass'){
   const env=Math.min(1,t/.018)*Math.exp(-t/1.6)*Math.min(1,(duration-t)/.08);
   sample=(Math.sin(p)+.18*Math.sin(2*p))*env;
  }else{
   // Soft struck tine, with a transient that quickly becomes a sine tone.
   const env=(1-Math.exp(-t*160))*Math.exp(-t/1.1)*Math.min(1,(duration-t)/.12);
   sample=(Math.sin(p+.8*Math.exp(-t*6)*Math.sin(p*2))+.12*Math.sin(p*3)*Math.exp(-t*3))*env;
  }
  const v=amp*sample;L[first+j]+=v*lg;R[first+j]+=v*rg;
 }
}
function drum(at,type,amp=.05){
 const first=Math.round(at*SR),duration=type==='kick'?.32:.12,length=Math.round(duration*SR);let previous=0;
 for(let j=0;j<length&&first+j<N;j++){
  const t=j/SR,n=noise();let s;
  if(type==='kick'){const phase=TAU*(47*t+24*.026*(1-Math.exp(-t/.026)));s=Math.sin(phase)*Math.exp(-t*19)*(1-Math.exp(-t*500));}
  else{s=(n-previous)*Math.exp(-t*65)*Math.min(1,t/.002)*.45;previous=n;}
  L[first+j]+=s*amp*(type==='kick'?.707:.58);R[first+j]+=s*amp*(type==='kick'?.707:.82);
 }
}
const CHORDS=[
 {root:38,notes:[53,57,60,64],arp:[69,72,76,65]}, // D minor 9
 {root:34,notes:[50,53,57,60],arp:[65,69,72,62]}, // B-flat major 9
 {root:41,notes:[53,57,60,64],arp:[69,72,76,67]}, // F major 9
 {root:36,notes:[50,55,57,62],arp:[67,69,74,62]}, // C suspended / added 6,9
];
// Intro: a single breath and a three-note invitation.
CHORDS[0].notes.forEach((n,i)=>voice(0,6.5,n,.022,(i-1.5)*.28,'pad'));
voice(.5,3.2,69,.068,-.25);voice(1.75,3.2,76,.046,.3);voice(3.125,3.2,72,.05,.1);
for(let bar=2;bar<11;bar++){
 const time=bar*BAR,index=Math.floor((bar-2)/2)%4,chord=CHORDS[index],montage=bar>=50;
 if((bar-2)%2===0)chord.notes.forEach((n,i)=>voice(time,6.5,n,.026,(i-1.5)*.3,'pad'));
 voice(time,2.4,chord.root,.073,0,'bass');
 if(bar%2)voice(time+2.5*BEAT,1.5,chord.root+12,.025,.05,'bass');
 const offsets=bar%2?[.5,2,3.5]:[0,1.5,3];
 for(let i=0;i<offsets.length;i++){
  const n=chord.arp[(i+bar)%4],a=(i===0?.060:.044)*(montage?1.12:1);
  voice(time+offsets[i]*BEAT,3.3,n,a,((i+bar)%3-1)*.3);
 }
 // A small answering phrase every four bars; no busy continuous lead.
 if((bar-2)%4===3){voice(time+1.25*BEAT,2.3,chord.arp[1]+12,.025,.25);voice(time+2.75*BEAT,2.3,chord.arp[0]+12,.022,-.25);}
 if(bar>=6){drum(time,'kick',.065);drum(time+2*BEAT,'kick',.043);drum(time+BEAT,'brush',.026);drum(time+3*BEAT,'brush',.032);}
 if(montage)for(const beat of [.5,1.5,2.5,3.5])drum(time+beat*BEAT,'brush',.012);
}
// Last bar resolves softly into the picture fade.
CHORDS[0].notes.forEach((n,i)=>voice(27.5,2.5,n,.027,(i-1.5)*.25,'pad'));
voice(27.5,2.5,38,.05,0,'bass');voice(27.5,2.5,69,.045,-.2);voice(28.125,1.875,76,.035,.2);

// Cross-fed, damped ambience: restrained stereo depth, no long noisy tails.
const taps=[.149,.211,.307,.419].map((s,i)=>({l:new Float32Array(Math.round(s*SR)),r:new Float32Array(Math.round((s+.013)*SR)),a:0,b:0,dl:0,dr:0,gain:[.53,.47,.43,.39][i]}));
let peak=0;
for(let i=0;i<N;i++){
 const dryL=L[i],dryR=R[i];let wetL=0,wetR=0;
 for(const tap of taps){const a=tap.l[tap.a],b=tap.r[tap.b];tap.dl=.72*tap.dl+.28*a;tap.dr=.72*tap.dr+.28*b;tap.l[tap.a]=dryL*.17+tap.dr*tap.gain;tap.r[tap.b]=dryR*.17+tap.dl*tap.gain;tap.a=(tap.a+1)%tap.l.length;tap.b=(tap.b+1)%tap.r.length;wetL+=a;wetR+=b;}
 const t=i/SR,fade=Math.min(1,t/1.2)*Math.min(1,Math.max(0,(DURATION-t)/3.2));
 L[i]=(dryL*.9+wetL*.32)*fade;R[i]=(dryR*.9+wetR*.32)*fade;peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));
}
const gain=.82/peak,bytes=Buffer.alloc(44+N*4);bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(2,22);bytes.writeUInt32LE(SR,24);bytes.writeUInt32LE(SR*4,28);bytes.writeUInt16LE(4,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(N*4,40);
for(let i=0;i<N;i++){bytes.writeInt16LE(Math.round(Math.max(-1,Math.min(1,L[i]*gain))*32767),44+i*4);bytes.writeInt16LE(Math.round(Math.max(-1,Math.min(1,R[i]*gain))*32767),46+i*4);}
await fs.mkdir(path.join(base,'cache'),{recursive:true});await fs.writeFile(path.join(base,'cache','grid-original.wav'),bytes);
await fs.writeFile(path.join(base,'cache','music-provenance.json'),JSON.stringify({title:'Objects in Motion',composition:'Original procedural composition for Breakboard',tempo:96,key:'D minor',duration:DURATION,sampleRate:SR,channels:2,seed:348195,sources:'Oscillators and deterministic synthesized noise only; no external audio recordings',arrangement:'Soft tine keys, sustained pads, sparse bass, light kick and brushed ticks; 12-bar arrangement for the continuous grid film',rawPeak:peak,normalizationGain:gain},null,2));
console.log('MUSIC COMPLETE',DURATION+'s',SR+' Hz stereo');
