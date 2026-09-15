"""blender --background --python design/monopoly/create_dice.py
One six-faced model + two baked Bullet rigid-body throws. No runtime physics dependency.
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector, Quaternion
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/3d_model'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, roughness):
    m = bpy.data.materials.new(name); m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Roughness'].default_value = roughness
    return m
ivory = material('Warm porcelain', (.93, .87, .71), .26)
ink = material('Deep charcoal pips', (.027, .039, .055), .32)
red = material('Vermilion one', (.7, .045, .025), .3)
bpy.ops.mesh.primitive_cube_add(size=1)
body = bpy.context.object; body.name = 'Die'
body.data.materials.append(ivory)
bevel = body.modifiers.new('Soft rounded edges', 'BEVEL'); bevel.width=.075; bevel.segments=5
bpy.ops.object.modifier_apply(modifier=bevel.name)
body.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
parts=[body]
patterns={1:[(0,0)],2:[(-1,-1),(1,1)],3:[(-1,-1),(0,0),(1,1)],4:[(-1,-1),(-1,1),(1,-1),(1,1)],5:[(-1,-1),(-1,1),(0,0),(1,-1),(1,1)],6:[(x,y) for x in [-1,1] for y in [-1,0,1]]}
# Opposite faces sum to seven; these axes match dice.ts after glTF conversion.
for value, normal in [(1,(0,0,1)),(2,(1,0,0)),(3,(0,1,0)),(4,(0,-1,0)),(5,(-1,0,0)),(6,(0,0,-1))]:
    n=Vector(normal); rotation=Vector((0,0,1)).rotation_difference(n)
    for x,y in patterns[value]:
        p=rotation @ Vector((x*.235,y*.235,.499))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, location=p)
        pip=bpy.context.object; pip.name=f'Face {value} pip'
        pip.scale=(.083,.083,.012); pip.rotation_mode='QUATERNION'; pip.rotation_quaternion=rotation
        pip.data.materials.append(red if value==1 else ink)
        for poly in pip.data.polygons: poly.use_smooth=True
        parts.append(pip)
bpy.ops.object.select_all(action='DESELECT')
for part in parts: part.select_set(True)
bpy.context.view_layer.objects.active=body
bpy.ops.object.convert(target='MESH')
bpy.ops.object.join()
bpy.ops.export_scene.gltf(filepath=str(OUT/'monopoly-die.glb'), use_selection=True, export_format='GLB')
body.hide_render=True; body.hide_set(True)
scene=bpy.context.scene; scene.render.fps=60; scene.frame_end=156
bpy.ops.mesh.primitive_plane_add(size=200)
floor=bpy.context.object
bpy.ops.rigidbody.object_add(); floor.rigid_body.type='PASSIVE'; floor.rigid_body.friction=.72
bodies=[]
for i, side in enumerate([-1,1]):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(side*.65,0,.53))
    cube=bpy.context.object; cube.name=f'Physics {i}'
    bpy.ops.rigidbody.object_add()
    rb=cube.rigid_body; rb.collision_shape='BOX'; rb.friction=.72; rb.restitution=.32
    rb.linear_damping=.32; rb.angular_damping=.38; rb.use_margin=True; rb.collision_margin=.005
    rb.kinematic=True; rb.keyframe_insert('kinematic',frame=1); rb.keyframe_insert('kinematic',frame=8)
    rb.kinematic=False; rb.keyframe_insert('kinematic',frame=9)
    cube.rotation_mode='XYZ'
    cube.keyframe_insert('location',frame=1); cube.keyframe_insert('rotation_euler',frame=1)
    cube.location=(side*.9, .06*i,1.25+i*.08)
    cube.rotation_euler=(.65+ .18*i,side*.72,.2*side)
    cube.keyframe_insert('location',frame=8); cube.keyframe_insert('rotation_euler',frame=8)
    for curve in cube.animation_data.action.fcurves:
        for key in curve.keyframe_points: key.interpolation='LINEAR'
    bodies.append(cube)
scene.rigidbody_world.substeps_per_frame=8; scene.rigidbody_world.solver_iterations=30
scene.rigidbody_world.point_cache.frame_end=156
tracks=[[],[]]; conversion=Quaternion((1,0,0),-math.pi/2)
for frame in range(1,157):
    scene.frame_set(frame)
    for i,cube in enumerate(bodies):
        matrix=cube.evaluated_get(bpy.context.evaluated_depsgraph_get()).matrix_world
        pos=conversion @ matrix.translation
        quat=conversion @ matrix.to_quaternion() @ conversion.inverted()
        tracks[i].append([*[round(x,6) for x in pos], *[round(x,7) for x in (quat.x,quat.y,quat.z,quat.w)]])
(OUT/'monopoly-dice-motion.json').write_text(json.dumps({'fps':60,'tracks':tracks},separators=(',',':')))
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'design/monopoly/monopoly-dice.blend'))
print('Final positions:', [t[-1][:3] for t in tracks])
