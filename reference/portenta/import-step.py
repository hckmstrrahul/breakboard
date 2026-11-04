"""Tessellate Arduino Portenta X8 official STEP using native OpenCascade.
Requires cadquery-ocp (no CadQuery/VTK renderer is used). Units: millimetres.
"""
from pathlib import Path
import json,time
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDocStd import TDocStd_Document
from OCP.TCollection import TCollection_ExtendedString
from OCP.XCAFDoc import XCAFDoc_DocumentTool,XCAFDoc_ColorSurf,XCAFDoc_ColorGen
from OCP.TDF import TDF_LabelSequence,TDF_Label
from OCP.TDataStd import TDataStd_Name
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID,TopAbs_SHELL,TopAbs_FACE,TopAbs_REVERSED
from OCP.TopoDS import TopoDS
from OCP.BRep import BRep_Tool
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.TopLoc import TopLoc_Location
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.Quantity import Quantity_Color,Quantity_TOC_sRGB
start=time.time()
print('Reading official STEP…',flush=True)
r=STEPCAFControl_Reader();r.SetColorMode(True);r.SetNameMode(True)
r.ReadFile('reference/portenta/PortentaX8.step')
doc=TDocStd_Document(TCollection_ExtendedString('MDTV-XCAF'));r.Transfer(doc)
st=XCAFDoc_DocumentTool.ShapeTool_s(doc.Main());ct=XCAFDoc_DocumentTool.ColorTool_s(doc.Main())
roots=TDF_LabelSequence();st.GetFreeShapes(roots)
solids=[]
for k in range(1,roots.Length()+1):
 shape=st.GetShape_s(roots.Value(k));it=TopExp_Explorer(shape,TopAbs_SOLID)
 while it.More():solids.append(it.Current());it.Next()
for k in range(1,roots.Length()+1):
 shape=st.GetShape_s(roots.Value(k));it=TopExp_Explorer(shape,TopAbs_SHELL,TopAbs_SOLID)
 while it.More():solids.append(it.Current());it.Next()
print('Imported',len(solids),'solids and free shells in',round(time.time()-start,2),'s',flush=True)
inv=[];meshes=[]
for i,s in enumerate(solids):
 b=Bnd_Box();BRepBndLib.Add_s(s,b);bounds=b.Get();label=TDF_Label();name=f'solid-{i}'
 if st.Search(s,label):
  n=TDataStd_Name()
  if label.FindAttribute(TDataStd_Name.GetID_s(),n):name=n.Get().ToExtString()
 color=Quantity_Color();has=ct.GetColor(s,XCAFDoc_ColorSurf,color) or ct.GetColor(s,XCAFDoc_ColorGen,color)
 rgb=list(color.Values(Quantity_TOC_sRGB)) if has else None
 inv.append({'i':i,'name':name,'min':list(bounds[:3]),'max':list(bounds[3:]),'color':rgb})
 # Mesh each solid independently. This also avoids a compound meshing failure
 # silently yielding empty geometry for all the smaller electronic components.
 BRepMesh_IncrementalMesh(s,.08,False,.65,True)
 p=[];idx=[];faces=TopExp_Explorer(s,TopAbs_FACE)
 while faces.More():
  f=TopoDS.Face_s(faces.Current());loc=TopLoc_Location();poly=BRep_Tool.Triangulation_s(f,loc)
  if poly:
   transform=loc.Transformation();offset=len(p)//3
   for j in range(1,poly.NbNodes()+1):
    v=poly.Node(j).Transformed(transform);p.extend([round(v.X(),5),round(v.Y(),5),round(v.Z(),5)])
   rev=f.Orientation()==TopAbs_REVERSED
   for j in range(1,poly.NbTriangles()+1):
    tri=poly.Triangle(j);a,b,c=[tri.Value(n)-1+offset for n in [1,2,3]];idx.extend([a,c,b] if rev else [a,b,c])
  faces.Next()
 if not idx:raise RuntimeError(f'Empty solid: {i} {name}')
 meshes.append({'name':name,'p':p,'i':idx,'c':rgb})
 if i%250==0:print('Tessellated',i,'/',len(solids),flush=True)
Path('reference/portenta/native-inventory.json').write_text(json.dumps(inv))
Path('reference/portenta/native-meshes.json').write_text(json.dumps(meshes,separators=(',',':')))
print('Completed',len(meshes),'solids in',round(time.time()-start,1),'seconds',flush=True)
