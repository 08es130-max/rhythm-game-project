"""Editable head study, not a finished full-body asset.
Blender 4.5: --background --python-exit-code 1 --python this_file -- --out DIR
Custom facial surface and individually authored ribbon-loft hair locks; no primitive character assembly.
"""
import bpy, math, argparse, sys, json
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi, exp, sqrt

ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,required=True);parser.add_argument('--render',action='store_true');parser.add_argument('--views',default='front,three-quarter,side,back')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:]);OUT=args.out.resolve();OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
collections={}
for name in ['01_FACE','02_EYES','03_HAIR','04_DETAILS','05_RIG','00_REFERENCE','90_STUDIO']:
 c=bpy.data.collections.new(name);scene.collection.children.link(c);collections[name]=c
objects=[]

def mat(name,color,rough=.5,metal=0,emission=0):
 if name in bpy.data.materials:return bpy.data.materials[name]
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1);b.inputs['Roughness'].default_value=rough;b.inputs['Metallic'].default_value=metal
 b.inputs['Specular IOR Level'].default_value=.28
 if emission:b.inputs['Emission Color'].default_value=(*color,1);b.inputs['Emission Strength'].default_value=emission
 return m
skin=mat('M_SKIN_PorcelainPeach',(0.88,.59,.49),.61)
white=mat('M_EYE_WarmWhite',(.91,.88,.84),.28)
line=mat('M_LASH_Charcoal',(0.012,.009,.015),.6)
lowerline=mat('M_LID_RoseBrown',(.17,.065,.072),.7)
lip=mat('M_LIP_Rose',(.54,.22,.235),.57)
mouth=mat('M_MOUTH_Line',(.13,.035,.047),.7)
hairmats=[mat('M_HAIR_InkTeal',(.004,.013,.019),.54),mat('M_HAIR_BlueTeal',(.007,.020,.026),.55),mat('M_HAIR_Shadow',(.003,.009,.015),.58),mat('M_HAIR_Sheen',(.013,.032,.038),.57)]
gold=mat('M_HAIR_ACCENT_Gold',(.72,.47,.17),.3,.65)
shine=mat('M_EYE_Catchlight',(1,.97,.93),.12,emission=.5)


def mesh(name,verts,faces,material,collection='01_FACE'):
 data=bpy.data.meshes.new(name+'_Topology');data.from_pydata(verts,[],faces);data.update()
 obj=bpy.data.objects.new(name,data);collections[collection].objects.link(obj)
 if material:obj.data.materials.append(material)
 for p in data.polygons:p.use_smooth=True
 objects.append(obj)
 return obj


def interp(z,pts):
 if z<=pts[0][0]:return pts[0][1]
 for k,((a,b),(c,d)) in enumerate(zip(pts,pts[1:])):
  if z<=c:
   t=(z-a)/(c-a);h=c-a
   prev=pts[max(0,k-1)];nxt=pts[min(len(pts)-1,k+2)]
   m0=(d-prev[1])/(c-prev[0]);m1=(nxt[1]-b)/(nxt[0]-a)
   return (2*t**3-3*t*t+1)*b+(t**3-2*t*t+t)*h*m0+(-2*t**3+3*t*t)*d+(t**3-t*t)*h*m1
 return pts[-1][1]
widths=[(.061,.008),(.074,.030),(.101,.060),(.14,.080),(.18,.084),(.215,.082),(.26,.084),(.30,.079),(.335,.060),(.358,.03),(.368,.001)]
depths=[(.061,.033),(.08,.050),(.13,.065),(.18,.073),(.23,.073),(.28,.068),(.33,.05),(.368,.001)]

def face_y(x,z):
 w=max(.001,interp(z,widths));u=min(.9999,abs(x/w));f=(1-u*u)**.23
 d=interp(z,depths)
 # Sculpted central bridge/tip, nasolabial transition, soft cheek pads, recessed orbital rims.
 n=.0015*exp(-(x/.011)**2-((z-.191)/.029)**2)+.0012*exp(-(x/.011)**2-((z-.17)/.009)**2)
 cheek=.004*exp(-((abs(x)-.047)/.022)**2-((z-.164)/.027)**2)
 eye=-.003*exp(-((abs(x)-.042)/.027)**2-((z-.215)/.019)**2)
 muzzle=.003*exp(-(x/.027)**2-((z-.131)/.015)**2)
 return -d*f-n-cheek-eye-muzzle

# Smooth bespoke facial cross-sections. Landmarks remain separate and editable.
verts=[];faces=[];N=112;R=80
for j in range(R+1):
 z=.061+(.368-.061)*j/R;w=interp(z,widths)
 for i in range(N):
  a=2*pi*i/N;x=w*sin(a)
  if cos(a)>=0:y=face_y(x,z)
  else:y=(.067*sqrt(max(0,1-((z-.222)/.158)**2)))*(-cos(a))+.006
  verts.append((x,y,z))
for j in range(R):
 for i in range(N):
  k=j*N+i;l=j*N+(i+1)%N;faces.append((k,l,l+N,k+N))
face=mesh('Face',verts,faces,skin)
# Correct outward normals for radial topology.
bpy.context.view_layer.objects.active=face;face.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');face.select_set(False)
color=face.data.color_attributes.new(name='SkinTint',type='FLOAT_COLOR',domain='POINT')
for v,c in zip(face.data.vertices,color.data):
 x,y,z=v.co;blush=exp(-((abs(x)-.052)/.021)**2-((z-.167)/.020)**2)*max(0,-y/.075)*.38
 c.color=(.88+blush*.12,.59-blush*.12,.49-blush*.08,1)
vnode=skin.node_tree.nodes.new('ShaderNodeVertexColor');vnode.layer_name='SkinTint';skin.node_tree.links.new(vnode.outputs['Color'],skin.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
face['design_notes']='Fuller cheeks; shorter rounded jaw; modest nose bridge. Edit/sculpt this mesh. Visual approval pending.'

# Neck surface loft, separate for later body integration.
v=[];f=[]
for j,(z,rx,ry) in enumerate([(0,.041,.032),(.022,.036,.029),(.05,.029,.027),(.085,.027,.028),(.108,.032,.031)]):
 for i in range(64):a=2*pi*i/64;v.append((rx*sin(a),ry*cos(a)+.018,z))
for j in range(4):
 for i in range(64):a=j*64+i;b=j*64+(i+1)%64;f.append((a,a+64,b+64,b))
neck=mesh('Neck',v,f,mat('M_SKIN_Neck',(.88,.59,.49),.61))

# Curve-to-mesh ribbon helpers used for fine lid contours and individually editable hair locks.
def cat(points,t):
 n=len(points)-1;u=min(n-1e-8,max(0,t*n));k=int(u);a=u-k
 p0=Vector(points[max(0,k-1)]);p1=Vector(points[k]);p2=Vector(points[k+1]);p3=Vector(points[min(n,k+2)])
 return .5*((2*p1)+(-p0+p2)*a+(2*p0-5*p1+4*p2-p3)*a*a+(-p0+3*p1-3*p2+p3)*a*a*a)

def tube(name,points,radius,material,collection='04_DETAILS',segments=48,sides=8,taper=False):
 v=[];f=[]
 for j in range(segments+1):
  t=j/segments;c=cat(points,t);tan=(cat(points,min(1,t+.002))-cat(points,max(0,t-.002))).normalized();axis=tan.cross(Vector((0,1,0))).normalized()
  if axis.length<.1:axis=Vector((1,0,0))
  axis2=tan.cross(axis).normalized();r=radius*(max(.06,sin(pi*t)**.35) if taper else 1)
  for i in range(sides):a=2*pi*i/sides;v.append(c+axis*r*cos(a)+axis2*r*sin(a))
 for j in range(segments):
  for i in range(sides):a=j*sides+i;b=j*sides+(i+1)%sides;f.append((a,b,b+sides,a+sides))
 return mesh(name,v,f,material,collection)

# Eye whites: almond shaped domed surfaces, not spheres glued onto a head.
eye_specs=[]
for side,s in [('L',1),('R',-1)]:
 cx=s*.040;cz=.215;rx=.027;top=.020;bottom=.028
 def eye_border(u,upper=True):return cz+.0015*u+(top if upper else -bottom)*(max(0,1-u*u)**.68)
 def eye_depth(x,z,u=0,v=0):return face_y(x,z)-.0018-.0028*(1-u*u)*max(0,1-v*v)
 vs=[];fs=[];NX=48;NY=16
 for j in range(NY+1):
  q=-1+2*j/NY
  for i in range(NX+1):
   u=-1+2*i/NX;x=cx+s*rx*u;z=cz+.0015*u+(top if q>=0 else bottom)*q*(max(0,1-u*u)**.68)
   vs.append((x,eye_depth(x,z,u,q),z))
 for j in range(NY):
  for i in range(NX):a=j*(NX+1)+i;fs.append((a,a+1,a+NX+2,a+NX+1))
 eye=mesh('Eyes_'+side,vs,fs if s==1 else [tuple(reversed(f)) for f in fs],white,'02_EYES');eye['touchTarget']='Head'
 # Iris radial topology, layered pigment ring and fiber wedges.
 icx=cx-s*.001;icz=cz+.0005;irx=.0138;irz=.0175
 palette=[]
 for j in range(8):
  c=[(.003,.001,.004),(.07,.005,.02),(.29,.028,.072),(.48,.060,.12),(.66,.13,.22),(.52,.07,.16),(.32,.015,.055),(.035,.004,.012)][j]
  palette.append(c)
 iv=[];iff=[];rings=10;seg=96
 for j in range(rings+1):
  r=j/rings
  for i in range(seg):
   a=2*pi*i/seg;x=icx+irx*r*cos(a);z=icz+irz*r*sin(a)*(1.5 if sin(a)<0 else 1)
   y=face_y(x,z)-.0048-.0008*(1-r*r)
   iv.append((x,y,z))
 for j in range(rings):
  for i in range(seg):a=j*seg+i;b=j*seg+(i+1)%seg;iff.append((a,b,b+seg,a+seg))
 iris_material=mat('M_IRIS_Pigment',(.4,.04,.10),.4,emission=.02)
 if not iris_material.node_tree.nodes.get('IrisPigment'):
  node=iris_material.node_tree.nodes.new('ShaderNodeVertexColor');node.name='IrisPigment';node.layer_name='IrisPigment';iris_material.node_tree.links.new(node.outputs['Color'],iris_material.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 iris=mesh('Iris_'+side,iv,[tuple(reversed(f)) for f in iff],iris_material,'02_EYES')
 pigment=iris.data.color_attributes.new(name='IrisPigment',type='FLOAT_COLOR',domain='POINT')
 for idx,value in enumerate(pigment.data):
  row=idx//seg;col=idx%seg
  index=0 if row<3 else (7 if row==10 else (1 if row==3 else [2,3,4,5,4,2][row-4]))
  shade=(.80-.16*sin(2*pi*col/seg))*(.94+.06*sin(col*.75));value.color=tuple(x*shade for x in palette[index])+(1,)
 # Fine highlight lenses built as filled curved discs.
 for hi,(dx,dz,r) in enumerate([(-.0033,.0060,.0028),(.0030,-.0048,.00115),(-.0005,.008,.00065)]):
  x0=icx+dx;z0=icz+dz
  vv=[(x0,face_y(x0,z0)-.0063,z0)]
  for i in range(40):a=2*pi*i/40;x=x0+r*cos(a);z=z0+r*sin(a);vv.append((x,face_y(x,z)-.0064,z))
  mesh('EyeHighlight_'+side+'_'+str(hi),vv,[(0,i+1,(i+1)%40+1) for i in range(40)],shine,'02_EYES')
 upper=[];lower=[];fold=[]
 for i in range(19):
  u=-1+2*i/18;x=cx+s*rx*u;z=eye_border(u,True);upper.append((x,face_y(x,z)-.0028,z));fold.append((x,face_y(x,z+.0035)-.001,z+.0035))
  z2=eye_border(u,False);lower.append((x,face_y(x,z2)-.0021,z2))
 tube('LashUpper_'+side,upper,.0017,line,'02_EYES',64,8,True)
 tube('LidLower_'+side,lower,.00065,lowerline,'02_EYES',56,6,True)
 tube('LidCrease_'+side,fold,.00045,lip,'02_EYES',56,6,True)
 for k in range(3):
  u=.6+k*.14;x=cx+s*rx*u;z=eye_border(u,True)
  tube('LashWing_'+side+'_'+str(k),[(x,face_y(x,z)-.003,z),(x+s*.003,-.062,z+.0015),(x+s*.006,-.059,z+.003+k*.0006)],.00085,line,'02_EYES',12,6,True)
 brow=[]
 for i in range(9):
  u=i/8;x=s*(.021+.043*u);z=.239+.003*sin(pi*u)-.004*u;brow.append((x,face_y(x,z)-.002,z))
 tube('Eyebrow_'+side,brow,.00175,hairmats[0],'02_EYES',40,8,True)
 eye_specs.append((side,cx,cz))

# Mouth: restrained closed smile, sculpted cupid/lower-lip volumes.
upper=[];lower=[];seam=[]
for i in range(25):
 x=-.019+.038*i/24;u=x/.019;z=.125+.0028*u*u
 seam.append((x,face_y(x,z)-.0014,z))
 upper.append((x,face_y(x,z)-.0011,z+.0011*(1-u*u)))
 lower.append((x,face_y(x,z)-.0015,z-.0017*(1-u*u)))
tube('Mouth_Seam',seam,.00055,mouth,segments=56,sides=6,taper=True)
tube('Lip_Upper',upper,.00065,lip,segments=56,sides=8,taper=True)
tube('Lip_Lower',lower,.00085,mat('M_LIP_SoftPeach',(.76,.39,.37),.48),segments=56,sides=8,taper=True)
for s in [-1,1]:
 points=[(s*.005,face_y(s*.005,.166)-.0003,.166),(s*.007,face_y(s*.007,.164)-.0007,.164),(s*.009,face_y(s*.009,.165)-.0001,.165)]
 tube('Nostril_'+str(s),points,.00033,lip,segments=12,sides=6,taper=True)
# Ears: outer rim and inner bowl, largely covered by side locks.
for s in [-1,1]:
 v=[];f=[]
 for j in range(13):
  r=j/12
  for i in range(64):
   a=2*pi*i/64;v.append((s*(.079+.014*r),.004+.010*r*cos(a),.199+.024*r*sin(a)))
 for j in range(12):
  for i in range(64):a=j*64+i;b=j*64+(i+1)%64;f.append((a,b,b+64,a+64))
 mesh('Ear_'+str(s),v,f,mat('M_SKIN_Ear',(.85,.50,.44),.65))
 points=[(s*(.079+.014),.004+.010*cos(2*pi*i/32),.199+.024*sin(2*pi*i/32)) for i in range(33)]
 tube('EarHelix_'+str(s),points,.0027,mat('M_SKIN_Helix',(.9,.62,.53),.65),segments=64,sides=8)

# Short layered hair cap follows custom silhouette; bangs are separate authored lofts.
v=[];f=[];NH=96;RH=24
for j in range(RH+1):
 t=j/RH
 for i in range(NH):
  a=2*pi*i/NH;front=max(0,cos(a));bottom=.087+.198*front**5
  z=.386-(.386-bottom)*t;rad=sqrt(max(0,1-((z-.25)/.136)**2))
  v.append((.09*rad*sin(a),-.079*rad*cos(a)+.012,z))
for j in range(RH):
 for i in range(NH):a=j*NH+i;b=j*NH+(i+1)%NH;f.append((a,b,b+NH,a+NH))
v.append((0,.012,.3862));f.extend((len(v)-1,(i+1)%NH,i) for i in range(NH));mesh('Hair_Base',v,f,hairmats[2],'03_HAIR')

hair_paths=[]
def lock(name,points,width,depth=.0024,index=0,segments=20):
 # Rounded flattened ribbon section with a quiet central ridge; taper at the ends.
 v=[];f=[];sides=8
 for j in range(segments+1):
  t=j/segments;c=cat(points,t);tan=(cat(points,min(1,t+.002))-cat(points,max(0,t-.002))).normalized()
  outward=Vector((c.x,c.y-.01,0)).normalized();axis=tan.cross(outward).normalized();normal=axis.cross(tan).normalized()
  if normal.dot(outward)<0:normal=-normal
  w=width*(.25+.75*sin(pi*min(.999,t))**.55)*(1-t**5)+.00012
  for i in range(sides):
   a=2*pi*i/sides;p=c+axis*(w*cos(a))+normal*(depth*sin(a)*(sin(pi*t)**.5+.15));v.append(p)
 for j in range(segments):
  for i in range(sides):a=j*sides+i;b=j*sides+(i+1)%sides;f.append((a,b,b+sides,a+sides))
 obj=mesh(name,v,f,hairmats[index%3],'03_HAIR')
 sub=obj.modifiers.new('HairSurface_Subdivision','SUBSURF');sub.levels=1;sub.render_levels=1
 obj['control_points']=json.dumps(points);obj['edit_note']='Individual loft mesh: proportional edit / sculpt. Original guide stored in custom property.'
 hair_paths.append({'name':name,'points':points,'half_width':width})
 # Thin highlight follows hair flow without a flat painted stripe.
 if False: # Smooth reference-style hair: omit raised strand highlight tubes.
  sheen=[]
  for k in range(12):
   t=.15+.5*k/11;c=cat(points,t);out=Vector((c.x,c.y-.01,0)).normalized();sheen.append(c+out*(depth*1.3+.0001))
  tube(name+'_Flow',sheen,.00038,hairmats[3],'03_HAIR',28,6,True)
 return obj

for k in range(21):
 a=math.radians(65+230*k/20);s,c=sin(a),cos(a);end=.058+.007*sin(k*1.7);r=.093
 pts=[(.006*s,.012-.006*c,.387),(.041*s,.012-.037*c,.375),(.068*s,.012-.061*c,.35),(.087*s,.012-.077*c,.31),(.096*s,.012-.083*c,.26),(.096*s,.012-.084*c,.205),((r+.003)*s,.012-.086*c,end+.028),((r+.002)*s,.012-.083*c,end)]
 lock('Hair_Back_%02d'%k,pts,.0145,.0028,k)
# Layered temple locks with soft outward ends, never below the jaw/neck area.
for s,label in [(1,'L'),(-1,'R')]:
 for k in range(4):
  pts=[(s*(.045+.005*k),-.050,.344),(s*(.080+.002*k),-.052,.281),(s*(.083+.002*k),-.048,.218),(s*(.081+.002*k),-.047,.188),(s*(.077+.002*k),-.049,.164+k*.005),(s*(.071+.002*k),-.052,.153+k*.006),(s*(.066+.002*k),-.054,.153+k*.006)]
  lock('Hair_Side_'+label+'_'+str(k),pts,.0095,.0026,k+1)
# Swept, asymmetric front fringe. Eye openings stay visible.
bangs=[
 [(-.013,-.03,.374),(-.053,-.066,.333),(-.077,-.069,.276),(-.084,-.065,.225),(-.08,-.065,.203)],
 [(-.007,-.034,.376),(-.035,-.077,.338),(-.052,-.079,.297),(-.063,-.078,.259),(-.068,-.073,.244)],
 [(.002,-.031,.377),(-.006,-.083,.341),(-.017,-.084,.302),(-.031,-.081,.271),(-.041,-.078,.253)],
 [(.008,-.026,.376),(.018,-.081,.346),(.018,-.085,.313),(.007,-.084,.282),(-.010,-.082,.25)],
 [(.015,-.020,.374),(.037,-.072,.34),(.047,-.078,.306),(.051,-.077,.28),(.062,-.068,.264)],
 [(.022,-.012,.372),(.065,-.053,.335),(.078,-.056,.287),(.084,-.055,.25),(.084,-.049,.223)]
]
for k,pts in enumerate(bangs):lock('Hair_Bangs_%02d'%k,[(.002,.008,.387)]+pts,[.016,.016,.017,.017,.015,.012][k],.0032,k)
# Small crown braid: three continuous interwoven meshes, on one side of the part.
center=[(.015,.007,.377),(.052,-.008,.357),(.077,-.014,.323),(.087,-.018,.28),(.089,-.018,.248)]
for strand in range(3):
 points=[]
 for i in range(100):
  t=i/99;c=cat(center,t);phase=t*7*2*pi+strand*2*pi/3
  c+=Vector((.0037*cos(phase),-.0037*sin(phase),.0022*cos(phase)));points.append(c)
 tube('Hair_Braid_'+str(strand),points,.0025,hairmats[strand%2],'03_HAIR',100,8)
# Delicate bent gold barrette on the left, rather than stage headwear.
for dz in [0,.006]:
 pts=[(-.085,-.053,.280+dz),(-.069,-.068,.285+dz),(-.060,-.074,.281+dz)]
 tube('Acc_Hairpin_'+str(dz),pts,.00105,gold,segments=16,sides=8)

# Round-face review: widen cheeks and shorten eye-to-chin distance per supplied casual portrait.
for obj in objects:
 for vertex in obj.data.vertices:
  if obj.name.startswith('Ear'):vertex.co.x*=.91;vertex.co.y+=.012
  vertex.co.x*=1.10
  vertex.co.z=.215+(vertex.co.z-.215)*(.60 if vertex.co.z<.215 else .90)
# Native editable naming and minimal head rig; no fake body bones or expression claims.
arm=bpy.data.armatures.new('Shioriko_HeadRig');rig=bpy.data.objects.new('Shioriko_HeadRig',arm);collections['05_RIG'].objects.link(rig)
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for name,h,t,parent in [('Neck',(0,.015,.01),(0,.015,.09),None),('Head',(0,.015,.09),(0,.015,.31),'Neck'),('Eye_L',(.04,-.05,.215),(.04,-.08,.215),'Head'),('Eye_R',(-.04,-.05,.215),(-.04,-.08,.215),'Head')]:
 b=arm.edit_bones.new(name);b.head=h;b.tail=t
 if parent:b.parent=arm.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
for obj in objects:
 obj.parent=rig
 vg=obj.vertex_groups.new(name='Neck' if obj==neck else 'Head');vg.add(list(range(len(obj.data.vertices))),1,'REPLACE')
 mod=obj.modifiers.new('HeadRig','ARMATURE');mod.object=rig
 # UVs for later hand-painted textures. Current color is vertex/PBR material driven.
 uv=obj.data.uv_layers.new(name='UVMap')
 for loop in obj.data.loops:
  co=obj.data.vertices[loop.vertex_index].co;uv.data[loop.index].uv=((co.x+.12)/.24,co.z/.4)
# Approved reference packed as a non-exporting image empty.
reference=ROOT/'assets/home-characters/shioriko/new/normal.png'
if reference.exists():
 image=bpy.data.images.load(str(reference));image.pack()
 ref=bpy.data.objects.new('REFERENCE_HomeApproved_NotForExport',None);ref.empty_display_type='IMAGE';ref.data=image;ref.empty_display_size=.5;ref.location=(.4,.1,.18);collections['00_REFERENCE'].objects.link(ref);ref.hide_render=True
scene['asset_status']='HEAD PROTOTYPE / awaiting human facial and hair review / not full-body production'
scene['reference']='assets/home-characters/shioriko/new/normal.png'
scene['next_step']='Review face likeness and short-hair silhouette BEFORE costume work. Edit separate meshes in collections.'
scene['authoring_method']='Custom facial cross-sections and individually controlled loft meshes; generated initial topology, not human-sculpted final model.'

# Studio inspection cameras and soft lights are not exported.
world=bpy.data.worlds.new('StudioWorld');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.15,.19,.23,1);world.node_tree.nodes['Background'].inputs[1].default_value=.45;scene.world=world
for name,loc,power,size,col in [('Key',(-.45,-.6,.75),18,.6,(1,.86,.78)),('Fill',(.45,-.3,.4),10,.5,(.75,.86,1)),('Rim',(.15,.4,.6),22,.5,(.65,.85,1))]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=col;o=bpy.data.objects.new(name,d);collections['90_STUDIO'].objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.22))-o.location).to_track_quat('-Z','Y').to_euler()
views={'front':(0,-.95,.245),'three-quarter':(.58,-.85,.27),'side':(.95,0,.24),'back':(0,.95,.25)}
for name,loc in views.items():
 d=bpy.data.cameras.new('Camera_'+name);o=bpy.data.objects.new('Camera_'+name,d);collections['90_STUDIO'].objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.20))-o.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=.455
scene.camera=bpy.data.objects['Camera_three-quarter']
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=800;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX'
# Open the .blend in a useful frontal material viewport for manual edits.
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':
   space=area.spaces.active;space.shading.type='MATERIAL'
   space.region_3d.view_location=(0,0,.21);space.region_3d.view_distance=.63
   space.region_3d.view_rotation=bpy.data.objects['Camera_front'].rotation_euler.to_quaternion()
   space.region_3d.view_perspective='ORTHO'
# Save with the face selected, studio camera ready, native mesh materials intact.
bpy.ops.object.select_all(action='DESELECT');face.select_set(True);bpy.context.view_layer.objects.active=face
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'shioriko-head-prototype-v1.blend'),compress=True)
# Apply only hair subdivision on the export copy of the in-memory scene; saved .blend keeps cages.
for o in list(objects):
 for mod in list(o.modifiers):
  if mod.type=='SUBSURF':
   bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
# Merge hair only for shipping draw calls. Saved Blender file retains all individual locks.
bpy.ops.object.select_all(action='DESELECT')
hair_objects=list(collections['03_HAIR'].objects)
for o in hair_objects:o.select_set(True)
bpy.context.view_layer.objects.active=hair_objects[0];bpy.ops.object.join();hair_export=bpy.context.object;hair_export.name='Hair_ReviewCombined'
objects=[o for c in ['01_FACE','02_EYES','03_HAIR','04_DETAILS'] for o in collections[c].objects if o.type=='MESH']
# Selection-only GLB contains real head meshes and skin, not references or studio.
bpy.ops.object.select_all(action='DESELECT')
for o in objects+[rig]:o.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(OUT/'shioriko-head-prototype-v1.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_armature_object_remove=True,export_texcoords=False,export_skins=True,export_morph=False,export_extras=True,export_apply=False,export_cameras=False,export_lights=False)
triangles=0
for o in objects:o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
(OUT/'head-study-design.json').write_text(json.dumps({'status':'unapproved-head-prototype','hair':hair_paths,'objects':len(objects),'estimated_triangles':triangles},indent=2),encoding='utf-8')
print('HEAD_STUDY',len(objects),'objects;',triangles,'estimated triangles',flush=True)
if args.render:
 for name in args.views.split(','):
  scene.camera=bpy.data.objects['Camera_'+name];scene.render.filepath=str(OUT/('head-'+name+'.png'));bpy.ops.render.render(write_still=True)
