"""Validate and export manually authored 06_EXPORT collection in Blender 4.x.
blender model.blend --background --python-exit-code 1 --python tools/blender/shioriko_export.py -- --check-only
blender model.blend --background --python-exit-code 1 --python tools/blender/shioriko_export.py -- --output /path/model.glb
"""
import argparse
import json
from pathlib import Path
import sys
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = json.loads((ROOT / 'assets/models/shioriko/model.json').read_text(encoding='utf-8-sig'))
REQUIRED_MESHES = ['Body', 'Face', 'Eyes_L', 'Eyes_R', 'Hair_Base', 'Hair_Bangs', 'Hair_Side_L',
    'Hair_Side_R', 'Hair_Back', 'Hair_Braid', 'Hair_LooseStrands', 'Costume_Bodice', 'Costume_SkirtBase',
    'Costume_SkirtPlaid', 'Costume_Lace', 'Costume_Sleeve_L', 'Costume_Sleeve_R', 'Costume_Garter',
    'Costume_Stockings', 'Costume_Boot_L', 'Costume_Boot_R', 'Acc_Hat', 'Acc_Rose', 'Acc_Feather',
    'Acc_Choker', 'Acc_Ribbons', 'Acc_Chains', 'Acc_Gems']
REQUIRED_BONES = ['Hips', 'Spine', 'Chest', 'UpperChest', 'Neck', 'Head', 'Eye_L', 'Eye_R'] + [
    side + part for side in ['Left', 'Right'] for part in
    ['Shoulder', 'UpperArm', 'LowerArm', 'Hand', 'UpperLeg', 'LowerLeg', 'Foot', 'Toes']]


def validate():
    errors, warnings = [], []
    collection = bpy.data.collections.get('06_EXPORT')
    objects = list(collection.all_objects) if collection else []
    if not objects:
        return objects, {'errors': ['06_EXPORT is empty: no authored model'], 'warnings': []}
    meshes = [o for o in objects if o.type == 'MESH']
    rigs = [o for o in objects if o.type == 'ARMATURE']
    names = {o.name for o in meshes}
    for name in REQUIRED_MESHES:
        if name not in names:
            errors.append('Missing mesh: ' + name)
    if len(rigs) != 1:
        errors.append('Exactly one export armature is required')
    bones = {b.name for rig in rigs for b in rig.data.bones}
    for name in REQUIRED_BONES:
        if name not in bones:
            errors.append('Missing bone: ' + name)
    morphs, clips, images = set(), set(), set()
    triangles = 0
    depsgraph = bpy.context.evaluated_depsgraph_get()
    corners = []
    for obj in objects:
        if obj.type not in {'MESH', 'ARMATURE', 'EMPTY'}:
            errors.append('Unsupported export object: ' + obj.name)
        if obj.hide_render or obj.hide_get():
            errors.append('Hidden export object: ' + obj.name)
        if any(abs(v - 1) > .0001 for v in obj.scale) or any(abs(v) > .0001 for v in obj.rotation_euler):
            errors.append('Apply rotation/scale before rigging: ' + obj.name)
        if obj.parent and obj.parent not in objects:
            errors.append('Parent outside export collection: ' + obj.name)
        animated = [obj]
        if obj.type == 'MESH' and obj.data.shape_keys:
            morphs.update(k.name for k in obj.data.shape_keys.key_blocks if k.name != 'Basis')
            animated.append(obj.data.shape_keys)
            if any(m.type != 'ARMATURE' and m.show_render for m in obj.modifiers):
                errors.append('Bake non-armature topology before authoring shape keys: ' + obj.name)
        for owner in animated:
            ad = owner.animation_data
            if ad:
                if ad.action:
                    warnings.append('Ensure active action is pushed into a named NLA track: ' + ad.action.name)
                for track in ad.nla_tracks:
                    if not track.mute:
                        clips.add(track.name)
        if obj.type != 'MESH':
            continue
        if not obj.data.uv_layers:
            errors.append('No UVs: ' + obj.name)
        ancestor = obj.parent
        while ancestor and ancestor not in rigs:
            ancestor = ancestor.parent
        if not any(m.type == 'ARMATURE' and m.object in rigs for m in obj.modifiers) and ancestor not in rigs:
            errors.append('Mesh is not bound to export rig: ' + obj.name)
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        try:
            mesh.calc_loop_triangles()
            triangles += len(mesh.loop_triangles)
            corners.extend(obj.matrix_world @ Vector(c) for c in obj.bound_box)
        finally:
            evaluated.to_mesh_clear()
        if not obj.data.materials:
            errors.append('No materials: ' + obj.name)
        for material in obj.data.materials:
            if not material or not material.use_nodes:
                errors.append('Use node-based glTF PBR materials: ' + obj.name)
                continue
            for node in material.node_tree.nodes:
                if node.type == 'TEX_IMAGE' and node.image:
                    images.add(node.image)
    for name in CONTRACT['expressions']:
        if name == 'Neutral':  # Neutral is the zero-weight basis, not a redundant shape key.
            continue
        if name == 'Blink' and {'Blink_L', 'Blink_R'} <= morphs:
            continue
        if name not in morphs:
            errors.append('Missing expression: ' + name)
    for name in CONTRACT['animations']:
        if name not in clips:
            warnings.append('Animation not yet authored: ' + name)
    for image in images:
        if max(image.size) > CONTRACT['maxTextureSize']:
            errors.append('Texture exceeds mobile size: ' + image.name)
        if not image.has_data:
            errors.append('Missing texture pixels: ' + image.name)
    if triangles > CONTRACT['maxTriangles']:
        errors.append('Triangle ceiling exceeded')
    if triangles < 80000:
        warnings.append('Below target triangle range; visual quality still requires human review')
    if corners:
        minimum, maximum = min(v.z for v in corners), max(v.z for v in corners)
        if abs(minimum) > .02 or abs(maximum - minimum - 1.6) > .1:
            errors.append('Expected feet Z=0 and height near 1.6m in Blender')
    if not str(bpy.context.scene.get('shioriko_visual_review', '')).strip():
        errors.append('Missing human visual review record (scene.shioriko_visual_review)')
    return objects, {'errors': errors, 'warnings': warnings, 'triangles': triangles,
                     'expressions': sorted(morphs), 'animations': sorted(clips), 'textures': len(images)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check-only', action='store_true')
    parser.add_argument('--output', type=Path, default=ROOT / CONTRACT['path'])
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
    if bpy.context.mode != 'OBJECT':
        raise RuntimeError('Run export in Object Mode')
    objects, report = validate()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report['errors']:
        raise RuntimeError('Production export blocked by validation errors')
    if args.check_only:
        return
    selected, active = list(bpy.context.selected_objects), bpy.context.view_layer.objects.active
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    try:
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = next(o for o in objects if o.type == 'ARMATURE')
        bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', use_selection=True,
            export_yup=True, export_animations=True, export_animation_mode='NLA_TRACKS',
            export_morph=True, export_skins=True, export_extras=True, export_apply=False,
            export_cameras=False, export_lights=False)
    finally:
        bpy.ops.object.select_all(action='DESELECT')
        for obj in selected:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = active
    print('GLB exported; run tools/validate_shioriko_glb.py and device visual review before release.')


if __name__ == '__main__':
    main()
