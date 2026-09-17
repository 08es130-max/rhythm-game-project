# Codex Task — Shioriko High-Fidelity 3D Pipeline

Repository: 08es130-max/rhythm-game-project

## Objective
Prepare and integrate a production-quality GLB/VRM pipeline for the Shioriko interaction room without disturbing the rhythm engine.

## Non-negotiable stability constraints
Do NOT modify unless absolutely required:
- tap-sound-fix-v068.js
- input-fix-v077.js
- smooth-clock-v072.js
- live gameplay timing / scoring
- note speed defaults

## Model contract
Read:
- docs/shioriko-3d-production-spec.md
- assets/models/shioriko/model.json

Primary model path:
- assets/models/shioriko/shioriko-live-v1.glb

## Required implementation
1. Keep 3D lazy-loaded only after entering `#interactionRoomScreen`.
2. If the production GLB exists, load it with Three.js GLTFLoader.
3. If it does not exist or loading fails, fall back to the existing procedural model.
4. Pause requestAnimationFrame/rendering while the interaction room is hidden.
5. Pause when `document.visibilityState !== 'visible'`.
6. Target 30fps in the interaction room.
7. Preserve orbit camera: horizontal 360°, vertical orbit including true top/bottom.
8. Keep touch/raycast hooks for head / hand / body reactions.
9. Keep room isolated from live gameplay.
10. Dispose geometry/materials/textures if the production model is replaced or fully unloaded.

## Model interaction naming contract
Prefer these object/bone names:
- Head
- LeftHand / RightHand
- Eye_L / Eye_R
- Hair_*
- Skirt_*
- Ribbon_*

## Expressions
If morph targets exist, expose helpers for:
- Neutral
- Smile
- Happy
- Blink
- Serious
- Surprised
- Blush
- Mouth_A / I / U / E / O

## Future animation contract
Support `THREE.AnimationMixer` and named clips:
- Idle
- Wave
- Look
- Dance_01

## Do not fake completion
If no authored GLB has been committed yet, leave the procedural fallback active and report that the production model asset is still missing.
