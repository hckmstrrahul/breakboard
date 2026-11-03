"""Extract board geometry and top artwork from Arduino's CC BY-SA 4.0 EAGLE file."""
from pathlib import Path
import json,xml.etree.ElementTree as E
r=E.parse('reference/uno/A000066-cad-files/UNO-TH_Rev3e.brd').getroot();b=r.find('.//board')
def attrs(e):
 d=dict(e.attrib)
 if e.text and e.text.strip():d['text']=e.text.strip()
 return {'type':e.tag,**d}
# Keep board markings separate from physical component geometry. The FRAME
# documentation layer is intentionally excluded from board artwork.
components=[{'type':x.tag,**x.attrib} for x in b.findall('elements/element')]
used={e['library']+'/'+e['package'] for e in components if e['package'] not in ['TP-SP','FIDUCIA-MOUNT','FRAME']}
libs={}
for lib in b.findall('libraries/library'):
 for p in lib.findall('packages/package'):
  key=lib.get('name')+'/'+p.get('name')
  if key in used:libs[key]=[attrs(x) for x in p if x.tag in ['wire','pad','smd','hole','circle','rectangle','text']]
result={'source':'Arduino UNO-TH_Rev3e.brd','outline':[attrs(x) for x in b.findall('plain/wire') if x.get('layer')=='20'],'holes':[attrs(x) for x in b.findall('plain/hole')], 'art':[attrs(x) for x in b.find('plain') if x.tag in ['wire','text','rectangle','circle'] and x.get('layer') in ['21','22','25','26','27','28']], 'components':components, 'packages':libs,'copper':[attrs(x) for s in b.findall('signals/signal') for x in s if x.tag in ['wire','via']]}
frame=b.find("libraries/library[@name='Arduino-utility']/packages/package[@name='FRAME']")
result['frame']=[[float(x.get(k)) for k in ['x1','y1','x2','y2']] for x in frame.findall('rectangle') if x.get('layer')=='21']
Path('src/uno-layout.json').write_text(json.dumps(result,separators=(',',':')))
print('Saved Uno PCB coordinates:',Path('src/uno-layout.json').stat().st_size,'bytes')
