"""blender --background --factory-startup --threads 1 --python design/dice/create_dice_throws.py
為骰子單元烘焙 1–6 顆的剛體拋擲軌跡。骰子模型沿用大富翁的 public/3d_model/monopoly-die.glb。
每一種顆數各跑一次模擬（sets[n-1] 有 n 條軌跡），骰子彼此會碰撞，落點不會疊在一起。
"""
import bpy, json, math
from pathlib import Path
from mathutils import Quaternion, Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/3d_model/dice-throws.json'
FRAMES = 200
SPACING = 1.3


def bake(count):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.fps = 60; scene.frame_start = 1; scene.frame_end = FRAMES
    bpy.ops.mesh.primitive_plane_add(size=200)
    floor = bpy.context.object
    bpy.ops.rigidbody.object_add(); floor.rigid_body.type = 'PASSIVE'; floor.rigid_body.friction = .72
    bodies = []
    # 4 顆以上排兩排，落點才會是投影畫面看得清楚的一塊，而不是一長條
    rows = 1 if count <= 3 else 2
    cols = math.ceil(count / rows)
    for i in range(count):
        row, col = divmod(i, cols)
        in_row = cols if row < rows - 1 else count - cols * (rows - 1)
        x = (col - (in_row - 1) / 2) * SPACING
        y = (row - (rows - 1) / 2) * 1.6
        side = -1 if x < 0 else 1
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, .53))
        cube = bpy.context.object
        bpy.ops.rigidbody.object_add()
        rb = cube.rigid_body; rb.collision_shape = 'BOX'; rb.friction = .72; rb.restitution = .32
        rb.linear_damping = .45; rb.angular_damping = .5; rb.use_margin = True; rb.collision_margin = .005
        rb.kinematic = True; rb.keyframe_insert('kinematic', frame=1); rb.keyframe_insert('kinematic', frame=8)
        rb.kinematic = False; rb.keyframe_insert('kinematic', frame=9)
        cube.rotation_mode = 'XYZ'
        cube.keyframe_insert('location', frame=1); cube.keyframe_insert('rotation_euler', frame=1)
        cube.location = (x * 1.05 + side * .05, y * 1.05 + .06 * (i % 3), 1.25 + .08 * (i % 3))
        cube.rotation_euler = (.65 + .18 * (i % 3), side * .72 + .1 * i, .2 * side + .15 * i)
        cube.keyframe_insert('location', frame=8); cube.keyframe_insert('rotation_euler', frame=8)
        for curve in cube.animation_data.action.fcurves:
            for key in curve.keyframe_points: key.interpolation = 'LINEAR'
        bodies.append(cube)
    world = scene.rigidbody_world
    world.substeps_per_frame = 8; world.solver_iterations = 30; world.point_cache.frame_end = FRAMES
    tracks = [[] for _ in bodies]
    conversion = Quaternion((1, 0, 0), -math.pi / 2)  # Blender Z-up → glTF Y-up
    for frame in range(1, FRAMES + 1):
        scene.frame_set(frame)
        depsgraph = bpy.context.evaluated_depsgraph_get()
        for i, cube in enumerate(bodies):
            matrix = cube.evaluated_get(depsgraph).matrix_world
            pos = conversion @ matrix.translation
            quat = conversion @ matrix.to_quaternion() @ conversion.inverted()
            tracks[i].append([*[round(v, 4) for v in pos], *[round(v, 5) for v in (quat.x, quat.y, quat.z, quat.w)]])
    # 整組平移到落點中心在原點，網頁端的鏡頭固定對著原點；平移不影響剛體軌跡本身
    cx = sum(t[-1][0] for t in tracks) / count
    cz = sum(t[-1][2] for t in tracks) / count
    for track in tracks:
        for pose in track:
            pose[0] = round(pose[0] - cx, 4); pose[2] = round(pose[2] - cz, 4)
    return tracks


def check(count, tracks):
    for i, track in enumerate(tracks):
        a, b = Vector(track[-2][:3]), Vector(track[-1][:3])
        q = Quaternion((track[-1][6], *track[-1][3:6]))
        up = max(abs((q @ n).y) for n in (Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))))
        assert (a - b).length < 1e-3, f'{count} 顆第 {i} 顆最後還在動'
        assert up > .995, f'{count} 顆第 {i} 顆沒有平躺（{up:.3f}）'
        for j in range(i):
            other = Vector(tracks[j][-1][:3])
            gap = math.hypot(b.x - other.x, b.z - other.z)
            assert gap > .95, f'{count} 顆第 {i}、{j} 顆疊在一起（{gap:.2f}）'
    print(count, '顆落點', [tuple(round(v, 2) for v in t[-1][:3]) for t in tracks])


sets = []
for count in range(1, 7):
    tracks = bake(count)
    check(count, tracks)
    sets.append(tracks)
OUT.write_text(json.dumps({'fps': 60, 'sets': sets}, separators=(',', ':')))
print('寫入', OUT, OUT.stat().st_size // 1024, 'KB')
