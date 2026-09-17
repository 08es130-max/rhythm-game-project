# Blender scene setup helper for Shioriko production model.
# Run inside Blender's Scripting workspace. This creates the production collection hierarchy,
# material slots, armature naming baseline, and export metadata. It does NOT replace manual sculpting/modeling.

import bpy

COLLECTIONS = [
    "00_REFERENCE",
    "01_BODY",
    "02_HAIR",
    "03_COSTUME",
    "04_ACCESSORIES",
    "05_RIG",
    "06_EXPORT",
]

MATERIALS = [
    "M_SKIN","M_FACE","M_EYE","M_HAIR","M_HAIR_ACCENT",
    "M_CLOTH_BLACK","M_CLOTH_PLAID","M_LACE","M_GOLD",
    "M_LEATHER","M_GEM","M_FEATHER"
]

BONES = [
    ("Hips", None),
    ("Spine", "Hips"),
    ("Chest", "Spine"),
    ("UpperChest", "Chest"),
    ("Neck", "UpperChest"),
    ("Head", "Neck"),
    ("LeftShoulder", "UpperChest"), ("LeftUpperArm", "LeftShoulder"),
    ("LeftLowerArm", "LeftUpperArm"), ("LeftHand", "LeftLowerArm"),
    ("RightShoulder", "UpperChest"), ("RightUpperArm", "RightShoulder"),
    ("RightLowerArm", "RightUpperArm"), ("RightHand", "RightLowerArm"),
    ("LeftUpperLeg", "Hips"), ("LeftLowerLeg", "LeftUpperLeg"),
    ("LeftFoot", "LeftLowerLeg"), ("LeftToes", "LeftFoot"),
    ("RightUpperLeg", "Hips"), ("RightLowerLeg", "RightUpperLeg"),
    ("RightFoot", "RightLowerLeg"), ("RightToes", "RightFoot"),
]

def ensure_collection(name):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c

def ensure_material(name):
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
    return m

def create_rig():
    if bpy.data.objects.get("Shioriko_Rig"):
        return bpy.data.objects["Shioriko_Rig"]
    arm_data = bpy.data.armatures.new("Shioriko_Rig")
    arm_obj = bpy.data.objects.new("Shioriko_Rig", arm_data)
    ensure_collection("05_RIG").objects.link(arm_obj)
    bpy.context.view_layer.objects.active = arm_obj
    arm_obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    y = 0.0
    created = {}
    for i, (name, parent) in enumerate(BONES):
        b = arm_data.edit_bones.new(name)
        b.head = (0, y + i*0.01, 0)
        b.tail = (0, y + i*0.01, 0.1)
        if parent and parent in created:
            b.parent = created[parent]
        created[name] = b
    bpy.ops.object.mode_set(mode='OBJECT')
    arm_obj["model_id"] = "shioriko-live-v1"
    arm_obj["target_height_m"] = 1.60
    arm_obj["export_format"] = "GLB"
    return arm_obj

for name in COLLECTIONS:
    ensure_collection(name)
for name in MATERIALS:
    ensure_material(name)

rig = create_rig()
bpy.context.scene["shioriko_model_spec"] = "docs/shioriko-3d-production-spec.md"
bpy.context.scene["shioriko_export_path"] = "//assets/models/shioriko/shioriko-live-v1.glb"

print("Shioriko production scene scaffold ready.")
print("Next: manually model/sculpt face, hair, costume and accessories to the approved references.")
