"""Non-destructive authoring scaffold. Run in Blender 4.x, not ordinary Python.
Does not create character geometry, fake shape keys, or a production-ready rig.
"""
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parents[2]
COLLECTIONS = ['00_REFERENCE', '01_BODY', '02_HAIR', '03_COSTUME', '04_ACCESSORIES', '05_RIG', '06_EXPORT']
MATERIALS = ['M_SKIN', 'M_FACE', 'M_EYE', 'M_HAIR', 'M_HAIR_ACCENT', 'M_CLOTH_BLACK',
             'M_CLOTH_PLAID', 'M_LACE', 'M_GOLD', 'M_LEATHER', 'M_GEM', 'M_FEATHER']
BONES = ['Hips', 'Spine', 'Chest', 'UpperChest', 'Neck', 'Head', 'Eye_L', 'Eye_R', 'Jaw'] + [
    side + part for side in ['Left', 'Right'] for part in
    ['Shoulder', 'UpperArm', 'LowerArm', 'Hand', 'UpperLeg', 'LowerLeg', 'Foot', 'Toes']]


def ensure_collection(name):
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def setup():
    if bpy.context.mode != 'OBJECT':
        raise RuntimeError('Switch to Object Mode before running setup; existing work is not modified.')
    for name in COLLECTIONS:
        ensure_collection(name)
    for name in MATERIALS:
        if name not in bpy.data.materials:
            material = bpy.data.materials.new(name)
            material.use_nodes = True
    rig = bpy.data.objects.get('Shioriko_Rig')
    if rig is None:
        rig = bpy.data.objects.new('Shioriko_Rig', bpy.data.armatures.new('Shioriko_Rig'))
        ensure_collection('05_RIG').objects.link(rig)
        rig['authoring_note'] = 'Empty rig container. Fit and skin a humanoid rig manually before export.'
    rig['required_bone_names'] = ','.join(BONES)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    scene['shioriko_model_spec'] = 'docs/shioriko-3d-production-spec.md'
    scene['shioriko_export_path'] = str(ROOT / 'assets/models/shioriko/shioriko-live-v1.glb')
    scene['shioriko_axis_note'] = 'Blender Z up / -Y forward -> glTF Y up / +Z forward'
    scene['shioriko_target_height_m'] = 1.6
    scene['shioriko_visual_review'] = scene.get('shioriko_visual_review', '')
    # Reference is an image empty, never exported. It does not alter the approved PNG.
    reference = ROOT / 'assets/home-characters/shioriko/new/normal.png'
    if reference.is_file() and not bpy.data.objects.get('Shioriko_ApprovedReference'):
        obj = bpy.data.objects.new('Shioriko_ApprovedReference', None)
        obj.empty_display_type = 'IMAGE'
        obj.data = bpy.data.images.load(str(reference), check_existing=True)
        obj.empty_display_size = 1.6
        obj.hide_render = True
        ensure_collection('00_REFERENCE').objects.link(obj)
    print('Authoring scaffold ready. No production model has been generated.')
    print('Manually model, UV, texture, rig and review. Link approved meshes + rig into 06_EXPORT.')


if __name__ == '__main__':
    setup()
