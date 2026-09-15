"""Rebuild with: blender --background --python design/ichiban/create_scene.py"""
import bpy, math, os, random
from mathutils import Vector
OUT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def mat(name,h):
    rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    m=bpy.data.materials.new(name);m.diffuse_color=(*rgb,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*rgb,1);p.inputs['Roughness'].default_value=.88;p.inputs['Specular IOR Level'].default_value=.03
    p.inputs['Emission Color'].default_value=(*rgb,1);p.inputs['Emission Strength'].default_value=.75
    return m
ink=mat('Ink #020d15','020d15');paper=mat('Paper #fdfcf8','fdfcf8');warm=mat('Warm #f8f0e3','f8f0e3');blue=mat('Blue #02569b','02569b');yellow=mat('Yellow #f8b003','f8b003')
assets=[];flex=[]
def box(name,loc,size,m,r=.08):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m)
    b=o.modifiers.new('Rounded paper edge','BEVEL');b.width=r;b.segments=5;bpy.ops.object.modifier_apply(modifier=b.name);assets.append(o);return o
# True 2D corner radii, independent of the thin card's thickness.
def rounded_card(name,w,h,r,z,m):
    rng=random.Random(42);pts=[]
    for cx,cy,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for i in range(25):
            a=math.radians(start+i*90/24);pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
    dense=[]
    for i,p in enumerate(pts):
        q=pts[(i+1)%len(pts)];n=max(1,int(math.dist(p,q)/.014))
        for j in range(n):
            t=j/n;dense.append((p[0]*(1-t)+q[0]*t+rng.uniform(-.007,.007),p[1]*(1-t)+q[1]*t+rng.uniform(-.007,.007),z))
    me=bpy.data.meshes.new(name);me.from_pydata(dense,[],[tuple(range(len(dense)))]);me.update()
    ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);ob.data.materials.append(m);assets.append(ob)
    mod=ob.modifiers.new('Card thickness','SOLIDIFY');mod.thickness=.025
    bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.modifier_apply(modifier=mod.name)
    return ob
rounded_card('Ticket_ink_outline',6.4,2.65,.22,.015,ink)
rounded_card('Ticket_blue_frame',6.27,2.52,.18,.045,blue)

# Dense strip grid: semicircular pull tab at left, die-cut notches along both edges.
x0=-2.88;x1=2.72;N=320
verts=[];faces=[];rng=random.Random(37)
for i in range(N+1):
    x=x0+(x1-x0)*i/N
    phase=((x+2.34)/.45)%1
    notch=.085 if .35<phase<.62 else 0
    half=.89-(notch if x<2.20 else 0)
    if x<-2.40: half=.43*math.sqrt(max(.001,1-((x+2.40)/.48)**2))
    if x>2.34: half=.89*math.sqrt(max(.001,1-((x-2.34)/.38)**2))
    for y in [-half,half]:verts.append((x+rng.uniform(-.003,.003),y+rng.uniform(-.009,.009),.115))
for i in range(N):faces.append((2*i,2*i+2,2*i+3,2*i+1))
mesh=bpy.data.meshes.new('Perforated strip grid');mesh.from_pydata(verts,[],faces);mesh.update()
o=bpy.data.objects.new('Peel_strip',mesh);bpy.context.collection.objects.link(o);o.data.materials.append(yellow);o.data.materials.append(ink)
s=o.modifiers.new('Paper reverse and edge','SOLIDIFY');s.thickness=.012;s.material_offset=1;bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.modifier_apply(modifier=s.name)
assets.append(o);flex.append(o)
# Matching white silhouette remains inside the card after the seal is peeled.
well=bpy.data.objects.new('White_inner_paper',mesh.copy());bpy.context.collection.objects.link(well)
well.data.materials.clear();well.data.materials.append(paper)
for p in well.data.polygons:p.material_index=0
well.location.z=-.032;assets.append(well)

# Fold moves left to right. Back-facing glyphs follow the same surface deformation.
def deform(v,p):
    x,y,z=v;r=.14;b=x0-.01+(x1-x0+.02)*p;d=b-x;h=z-.115
    if d<=0:return (x,y,z)
    a=min(math.pi,d/r)
    if d<math.pi*r: return (b-r*math.sin(a)+h*math.sin(a),y,.115+r*(1-math.cos(a))+h*math.cos(a))
    return (b+d-math.pi*r,y,.115+2*r-h)
for o in flex:
    o.shape_key_add(name='Basis');base=[v.co.copy() for v in o.data.vertices]
    # Sampled morphs preserve a travelling curl; runtime blends adjacent poses.
    for j in range(1,21):
        k=o.shape_key_add(name='Peel_%02d'%j)
        for v,co in zip(k.data,base):v.co=deform(co,j/20)
        for frame,value in [(1,0),(1+(j-1)*3,0),(1+j*3,1),(1+(j+1)*3,0)]:
            if frame<=61:k.value=value;k.keyframe_insert(data_path='value',frame=frame)
    for poly in o.data.polygons:poly.use_smooth=False
scene=bpy.context.scene;scene.frame_start=1;scene.frame_end=61;scene.render.fps=30
for f,label in [(1,'SEALED'),(31,'HALF PEELED'),(61,'REVEALED')]:scene.timeline_markers.new(label,frame=f)
scene['Notes']='Art asset only. Sampled fold morph targets; blend adjacent Peel poses for pointer-driven motion. Brand colors, crayon-like irregular edges, rounded card corners, white paper well. No lettering or decorative graphics. No prize selection logic.'
bpy.ops.object.camera_add(location=(1.5,-6.8,17));cam=bpy.context.object;cam.name='STUDIO_camera';cam.rotation_euler=(Vector((1.5,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=14;scene.camera=cam
floor=box('STUDIO_floor',(0,0,-.14),(200,200,.1),warm,.01);assets.remove(floor)
world=bpy.data.worlds.new('Warm studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(1,1,1,1);world.node_tree.nodes['Background'].inputs[1].default_value=.12;scene.world=world
bpy.ops.object.light_add(type='AREA',location=(-3,-4,8));bpy.context.object.data.energy=70;bpy.context.object.data.size=7
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.view_settings.view_transform='Standard'
scene.render.resolution_x=1500;scene.render.resolution_y=750;scene.render.resolution_percentage=100
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'ichiban-crayon.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in assets:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'ichiban-crayon.glb'),use_selection=True,export_format='GLB',export_animations=True,export_morph_normal=False)
for frame,name in [(1,'sealed'),(31,'half'),(61,'opened')]:
    scene.frame_set(frame)
    if frame==1:
        cam.location=(0,-6.8,17);cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=8.5
    else:
        cam.location=(1.5,-6.8,17);cam.rotation_euler=(Vector((1.5,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=14
    scene.render.filepath=os.path.join(OUT,name+'.png');bpy.ops.render.render(write_still=True)

# Separate ready-open asset: bake the evaluated shape, not an animation-dependent default.
scene.frame_set(61)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'ichiban-crayon-opened.blend'))
bpy.ops.object.select_all(action='DESELECT')
for source in assets:
    evaluated=source.evaluated_get(bpy.context.evaluated_depsgraph_get())
    me=bpy.data.meshes.new_from_object(evaluated)
    ob=bpy.data.objects.new(source.name+'_opened',me);bpy.context.collection.objects.link(ob);ob.matrix_world=source.matrix_world;ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'ichiban-crayon-opened.glb'),use_selection=True,export_format='GLB',export_animations=False)
