"""Dependency-free shipping-contract check. Not a substitute for Khronos glTF Validator or visual QA.
python tools/validate_shioriko_glb.py [path/to/model.glb]
"""
import argparse
import json
from pathlib import Path
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = json.loads((ROOT / 'assets/models/shioriko/model.json').read_text(encoding='utf-8-sig'))


def inspect_glb(path):
    errors, warnings = [], []
    data = Path(path).read_bytes()
    if len(data) < 20 or struct.unpack_from('<III', data) != (0x46546C67, 2, len(data)):
        raise ValueError('Invalid/truncated GLB header')
    if len(data) > CONTRACT['maxFileBytes']:
        errors.append('File exceeds mobile byte budget')
    chunks, offset = [], 12
    while offset < len(data):
        if offset + 8 > len(data):
            raise ValueError('Truncated chunk header')
        length, kind = struct.unpack_from('<II', data, offset)
        offset += 8
        if length % 4 or offset + length > len(data):
            raise ValueError('Invalid chunk length')
        chunks.append((kind, data[offset:offset + length]))
        offset += length
    if not chunks or chunks[0][0] != 0x4E4F534A:
        raise ValueError('JSON must be the first chunk')
    document = json.loads(chunks[0][1])
    binary = next((body for kind, body in chunks if kind == 0x004E4942), b'')
    buffers = document.get('buffers', [])
    if len(buffers) != 1 or buffers[0].get('uri') or buffers[0]['byteLength'] > len(binary):
        errors.append('Require one embedded binary buffer')
    views = document.get('bufferViews', [])
    for view in views:
        if view.get('buffer', 0) != 0 or view.get('byteOffset', 0) + view['byteLength'] > len(binary):
            errors.append('Buffer view outside embedded BIN')
    for texture in document.get('images', []):
        if 'uri' in texture or 'bufferView' not in texture:
            errors.append('Textures must be embedded')
            continue
        view = views[texture['bufferView']]
        start = view.get('byteOffset', 0)
        image = binary[start:start + view['byteLength']]
        width = height = None
        if image.startswith(b'\x89PNG\r\n\x1a\n') and len(image) >= 24:
            width, height = struct.unpack_from('>II', image, 16)
        elif image.startswith(b'\xff\xd8'):
            pos = 2
            while pos + 4 <= len(image):
                if image[pos] != 255:
                    break
                marker = image[pos + 1]
                length = struct.unpack_from('>H', image, pos + 2)[0]
                if marker in (0xC0, 0xC1, 0xC2) and pos + 9 <= len(image):
                    height, width = struct.unpack_from('>HH', image, pos + 5)
                    break
                if length < 2:
                    break
                pos += 2 + length
        if width is None:
            errors.append('Cannot validate texture dimensions (use PNG/JPEG baseline)')
        elif max(width, height) > CONTRACT['maxTextureSize']:
            errors.append('Texture exceeds mobile dimension budget')
    if document.get('extensionsRequired'):
        errors.append('Compressed/custom required extensions need a configured decoder; baseline permits none')
    nodes = document.get('nodes', [])
    names = {node.get('name') for node in nodes}
    for name in ['Head', 'Face', 'LeftHand', 'RightHand', 'Eye_L', 'Eye_R']:
        if name not in names:
            errors.append('Missing interaction node/bone: ' + name)
    if not document.get('skins'):
        errors.append('No skin/rig')
    morphs, triangles = set(), 0
    accessors = document.get('accessors', [])
    meshes = document.get('meshes', [])
    for mesh in meshes:
        morphs.update(mesh.get('extras', {}).get('targetNames', []))
    # Count instantiated meshes rather than just unique geometries.
    for node in nodes:
        if 'mesh' not in node:
            continue
        for primitive in meshes[node['mesh']].get('primitives', []):
            if primitive.get('mode', 4) != 4:
                errors.append('Use triangle primitives')
                continue
            accessor = primitive.get('indices', primitive.get('attributes', {}).get('POSITION'))
            if accessor is None:
                errors.append('Primitive has no positions')
                continue
            triangles += accessors[accessor]['count'] // 3
    if triangles == 0 or triangles > CONTRACT['maxTriangles']:
        errors.append('Triangle count outside mobile ceiling')
    for name in CONTRACT['expressions']:
        if name == 'Neutral' or (name == 'Blink' and {'Blink_L', 'Blink_R'} <= morphs):
            continue
        if name not in morphs:
            errors.append('Missing morph: ' + name)
    clips = {a.get('name') for a in document.get('animations', [])}
    for name in CONTRACT['animations']:
        if name not in clips:
            warnings.append('Clip not authored yet: ' + name)
    if len(document.get('materials', [])) > 16:
        warnings.append('More than 16 materials: profile draw calls on device')
    return {'errors': errors, 'warnings': warnings, 'bytes': len(data), 'triangles': triangles,
            'morphs': sorted(morphs), 'animations': sorted(clips)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('path', nargs='?', type=Path, default=ROOT / CONTRACT['path'])
    args = parser.parse_args()
    try:
        report = inspect_glb(args.path)
    except (OSError, ValueError, KeyError, IndexError, TypeError, struct.error) as error:
        report = {'errors': [str(error)], 'warnings': []}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report['errors'] else 0


if __name__ == '__main__':
    sys.exit(main())
