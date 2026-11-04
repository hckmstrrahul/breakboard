"""Extract published HackRF One KiCad placement and artwork (CERN-OHL-P-2.0)."""
import re,json
from pathlib import Path
raw=Path('reference/hackrf/hackrf-one.kicad_pcb').read_text()
tokens=re.findall(r'\(|\)|"(?:\\.|[^"\\])*"|[^\s()]+',raw)
stack=[];root=[]
for t in tokens:
 if t=='(': n=[]; (stack[-1] if stack else root).append(n);stack.append(n)
 elif t==')':stack.pop()
 else:
  if t.startswith('"'):t=json.loads(t)
  else:
   try:t=float(t)
   except ValueError:pass
  stack[-1].append(t)
b=root[0]
def children(n,k):return[x for x in n if isinstance(x,list) and x[0]==k]
def child(n,k,d=None):return next(iter(children(n,k)),d or [k])
def props(n,keys):return{k:child(n,k)[1:] for k in keys if len(child(n,k))>1}
footprints=[]
for f in children(b,'footprint'):
 texts=children(f,'fp_text')
 ref=next(t[2] for t in texts if t[1]=='reference');val=next(t[2] for t in texts if t[1]=='value')
 pads=[dict(number=p[1],type=p[2],shape=p[3],**props(p,['at','size','drill','layers','net'])) for p in children(f,'pad')]
 lines=[dict(type=k,**props(p,['start','end','center','mid','layer','width'])) for k in ['fp_line','fp_circle','fp_arc','fp_rect'] for p in children(f,k)]
 footprints.append(dict(ref=ref,value=val,footprint=f[1],**props(f,['at','layer']),pads=pads,lines=lines,texts=[dict(text=t[2],role=t[1],**props(t,['at','layer','effects'])) for t in texts]))
art=[]
for k in ['gr_text','gr_line','gr_arc','gr_circle','gr_poly']:
 for p in children(b,k):
  item=dict(type=k,**props(p,['at','start','end','mid','center','layer','width']))
  if k=='gr_text':item['text']=p[1];item['size']=child(child(p,'effects'),'font');
  if k=='gr_poly':item['points']=[p[1:] for p in children(child(p,'pts'),'xy')]
  art.append(item)
traces=[props(p,['start','end','width','layer']) for p in children(b,'segment') if child(p,'layer')[1] in ['F.Cu','B.Cu']]
result=dict(source='Great Scott Gadgets HackRF One KiCad layout',footprints=footprints,art=art,traces=traces)
# Chain source line/arc segments and sample their true circular profiles.
import math
lines=[x for x in art if x.get('layer')==['Edge.Cuts']]
points=[];current=lines[0]['start']
while lines:
 distance,index,which=min((math.dist(current,segment[key]),i,key) for i,segment in enumerate(lines) for key in ['start','end'])
 assert distance<.005, 'Disconnected board outline'
 segment=lines.pop(index);a=segment[which];b=segment['end' if which=='start' else 'start']
 if not points: points.append(a)
 if segment['type']=='gr_arc':
  middle=segment['mid'];ax,ay=a;bx,by=middle;cx,cy=b
  denominator=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by))
  ux=((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/denominator
  uy=((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/denominator
  radius=math.hypot(ax-ux,ay-uy);begin=math.atan2(ay-uy,ax-ux);end=math.atan2(cy-uy,cx-ux);mid=math.atan2(by-uy,bx-ux)
  sweep=(end-begin)%(math.pi*2)
  if (mid-begin)%(math.pi*2)>sweep:sweep-=math.pi*2
  for i in range(1,13):points.append([round(ux+radius*math.cos(begin+sweep*i/12),5),round(uy+radius*math.sin(begin+sweep*i/12),5)])
 else:points.append(b)
 current=b
result.update(outline=points,revision='10',date='2023-12-09')
Path('src/hackrf-layout.json').write_text(json.dumps(result,separators=(',',':')))
print('Extracted',len(footprints),'footprints,',len(points),'outline points and',len(traces),'visible trace segments.')
