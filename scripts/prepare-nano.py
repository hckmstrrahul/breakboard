"""Extract the official Arduino Nano V3.3 EAGLE board (CC BY-SA 4.0)."""
from pathlib import Path
import json, xml.etree.ElementTree as E
b=E.parse('reference/nano/cad/A00005-cad-files/NanoV3.3.brd').getroot().find('.//board')
def attrs(e):
    return {'type':e.tag,**e.attrib,**({'text':e.text.strip()} if e.text and e.text.strip() else {})}
components=[dict(x.attrib) for x in b.findall('elements/element')]
used={e['library']+'/'+e['package'] for e in components}
libs={lib.get('name')+'/'+p.get('name'):[attrs(x) for x in p if x.tag in ['wire','pad','smd','hole','circle','rectangle','text']] for lib in b.findall('libraries/library') for p in lib.findall('packages/package') if lib.get('name')+'/'+p.get('name') in used}
result={'source':'Arduino NanoV3.3.brd','outline':[attrs(x) for x in b.findall('plain/wire') if x.get('layer')=='20'],'holes':[attrs(x) for x in b.findall('plain/hole')],'art':[attrs(x) for x in b.find('plain') if x.tag in ['wire','text','rectangle','circle'] and x.get('layer') in ['21','22','25','26','27','28']],'components':components,'packages':libs,'copper':[attrs(x) for s in b.findall('signals/signal') for x in s if x.tag in ['wire','via']]}
Path('src/nano-layout.json').write_text(json.dumps(result,separators=(',',':')))
print('Extracted Nano V3.3 board, both sides, original copper and component footprints.')
