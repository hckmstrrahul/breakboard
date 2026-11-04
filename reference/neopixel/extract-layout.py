"""Extract NeoMatrix v2 EAGLE coordinates and artwork; Adafruit CC BY-SA 3.0."""
import xml.etree.ElementTree as E,json
from pathlib import Path
b=E.parse('reference/neopixel/matrix-v2.brd').getroot().find('.//board')
def attrs(e):return {'type':e.tag,**e.attrib,**({'text':e.text.strip()} if e.text and e.text.strip() else {})}
components=[dict(e.attrib) for e in b.findall('elements/element')];used={e['library']+'/'+e['package'] for e in components}
packages={lib.get('name')+'/'+p.get('name'):[attrs(x) for x in p if x.tag in ['wire','pad','smd','hole','circle','rectangle','text']] for lib in b.findall('libraries/library') for p in lib.findall('packages/package') if lib.get('name')+'/'+p.get('name') in used}
result={'source':'Adafruit_NeoMatrix_8x8 v2.brd','components':components,'packages':packages,'holes':[attrs(x)for x in b.findall('plain/hole')],'art':[attrs(x) for x in b.find('plain') if x.tag in ['wire','rectangle','circle','text'] and x.get('layer') in ['21','22','25','26','27','28']],'copper':[attrs(x) for s in b.findall('signals/signal') for x in s if x.tag in ['wire','via']]}
Path('src/neopixel-layout.json').write_text(json.dumps(result,separators=(',',':')))
print('LED contacts',packages[next(k for k in packages if k.endswith('/WS2812B'))]);print('power pads',packages[next(k for k in packages if k.endswith('/1X03'))])
print('total elements',len(components))
