# Shioriko 3D Production Spec — High Fidelity

## Goal
Create a high-quality real-time 3D character model for the `ふれあい` room. The target is a polished game-character asset, not a primitive/procedural approximation.

## Approved visual direction
- Character identity: Shioriko-like refined anime idol appearance based on the approved home standing illustration.
- Hair: short to medium-short dark teal-black hair, around chin/shoulder to upper-back at longest, layered ends, crown braid/ornamental braid, soft outward movement. Do not return to waist-length hair.
- Eyes: pink-red / warm crimson anime eyes; large but elegant, not overly mature.
- Costume: approved black + deep teal plaid + gold gothic live outfit.
- Key costume parts: beret, blue rose, white feather, black corset bodice, gold filigree, layered black/white lace skirt, teal plaid asymmetric overskirt, detached/asymmetric sleeves, choker, chains/ribbons, garter, patterned stockings, lace-up heeled boots.
- Overall impression: elegant, luxurious, stage-ready, refined rather than cute-first.

## Fidelity target
- Face must remain attractive at close camera distance.
- Silhouette must read correctly from front / 3-quarter / side / back.
- Hair must be constructed as layered meshes rather than capsules/cones.
- Lace, plaid, gold trim and ribbons need proper material separation.
- Avoid visible clipping in neutral pose, wave pose and simple dance poses.

## Geometry budget
Preferred launch target:
- Body + face: 25k–45k triangles
- Hair: 20k–40k triangles
- Outfit + accessories: 35k–70k triangles
- Total target: 80k–140k triangles
- Hard mobile ceiling: ~180k triangles for the first model
LOD can be added later if needed.

## Texture / material plan
Use PBR-friendly materials.
- M_SKIN
- M_FACE
- M_EYE
- M_HAIR
- M_HAIR_ACCENT
- M_CLOTH_BLACK
- M_CLOTH_PLAID
- M_LACE
- M_GOLD
- M_LEATHER
- M_GEM
- M_FEATHER

Texture target:
- Face/body atlas: 2048
- Hair atlas: 2048
- Costume atlas: 2048 or 4096 during authoring, export 2048 for iPhone baseline
- Accessories may share costume atlas
- Prefer KTX2/Basis later for shipping

## Required mesh objects
Body:
- Body
- Face
- Eyes_L / Eyes_R
- Teeth / MouthInterior (optional but recommended)
Hair:
- Hair_Base
- Hair_Bangs
- Hair_Side_L
- Hair_Side_R
- Hair_Back
- Hair_Braid
- Hair_LooseStrands
Costume:
- Costume_Bodice
- Costume_SkirtBase
- Costume_SkirtPlaid
- Costume_Lace
- Costume_Sleeve_L
- Costume_Sleeve_R
- Costume_Garter
- Costume_Stockings
- Costume_Boot_L
- Costume_Boot_R
Accessories:
- Acc_Hat
- Acc_Rose
- Acc_Feather
- Acc_Choker
- Acc_Ribbons
- Acc_Chains
- Acc_Gems

## Skeleton naming
Humanoid baseline:
- Hips
- Spine
- Chest
- UpperChest
- Neck
- Head
- LeftShoulder / RightShoulder
- LeftUpperArm / RightUpperArm
- LeftLowerArm / RightLowerArm
- LeftHand / RightHand
- LeftUpperLeg / RightUpperLeg
- LeftLowerLeg / RightLowerLeg
- LeftFoot / RightFoot
- LeftToes / RightToes

Recommended face bones:
- Eye_L / Eye_R
- Jaw

Secondary bones:
- Hair_* chains
- Skirt_* chains
- Ribbon_* chains
- Feather_* chain

## Expressions / morph targets
Required:
- Neutral
- Smile
- Happy
- Blink_L
- Blink_R
- Blink
- Serious
- Surprised
- Blush
- Mouth_A
- Mouth_I
- Mouth_U
- Mouth_E
- Mouth_O

Optional:
- SoftSmile
- Embarrassed
- ClosedSmile

## Physics
Do not bake heavy physics into the rhythm-game screen.
Physics is only active while the interaction room is visible.
Use spring-bone-like secondary motion for:
- side/back hair
- skirt tails
- long ribbons
- feather
- chains (small amplitude only)

## Export
Primary shipping file:
`assets/models/shioriko/shioriko-live-v1.glb`

Authoring source:
`assets/models/shioriko/source/shioriko-live-v1.blend` (not required to ship in PWA)

GLB requirements:
- meters / sane scale
- Y up after export
- model centered at world origin
- feet at y=0
- forward = +Z or documented consistently
- applied transforms
- no hidden authoring meshes
- no orphan textures
- animations may be embedded later

## Runtime performance
The interaction renderer must pause when the room is hidden and when the document is backgrounded.
Target 30 fps for interaction room on iPhone; 60 fps is optional.
Do not allow 3D rendering to consume GPU during rhythm gameplay.

## Acceptance criteria
The first production model is accepted only when:
1. face reads as the intended character at close distance,
2. approved short-hair silhouette is preserved,
3. costume layering is readable from all sides,
4. no major clipping in neutral/wave poses,
5. GLB loads on iPhone PWA,
6. rhythm gameplay performance is unchanged when interaction room is closed.
