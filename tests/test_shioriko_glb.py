import importlib.util
import json
from pathlib import Path
import struct
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('validator',Path(__file__).resolve().parents[1]/'tools/validate_shioriko_glb.py')
validator=importlib.util.module_from_spec(spec);spec.loader.exec_module(validator)


def binary(document, payload=b'\0'*36):
    chunk=json.dumps(document).encode();chunk+=b' '*((-len(chunk))%4)
    payload+=b'\0'*((-len(payload))%4)
    return struct.pack('<III',0x46546c67,2,28+len(chunk)+len(payload))+struct.pack('<II',len(chunk),0x4e4f534a)+chunk+struct.pack('<II',len(payload),0x004e4942)+payload


def minimal():
    return {'asset':{'version':'2.0'},'buffers':[{'byteLength':36}], 'bufferViews':[{'buffer':0,'byteLength':36}],
      'accessors':[{'count':3,'type':'VEC3','componentType':5126,'bufferView':0}],
      'meshes':[{'primitives':[{'attributes':{'POSITION':0}}], 'extras':{'targetNames':validator.CONTRACT['expressions']}}],
      'nodes':[{'name':n,**({'mesh':0} if n=='Face' else {})} for n in ['Head','Face','LeftHand','RightHand','Eye_L','Eye_R']],
      'skins':[{'joints':[0]}]}


class ContractTests(unittest.TestCase):
    def inspect(self, data):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'fixture.glb';path.write_bytes(data)
            return validator.inspect_glb(path)

    def test_contract_only_fixture(self):
        result=self.inspect(binary(minimal()))
        self.assertEqual(result['errors'],[])
        self.assertEqual(result['triangles'],1)
        self.assertEqual(len(result['warnings']),4)

    def test_truncation(self):
        with self.assertRaises(ValueError):self.inspect(binary(minimal())[:-1])

    def test_missing_face_and_morph(self):
        doc=minimal();doc['nodes'][1]['name']='WrongFace';doc['meshes'][0]['extras']['targetNames']=[]
        self.assertIn('Missing interaction node/bone: Face',self.inspect(binary(doc))['errors'])
        self.assertIn('Missing morph: Smile',self.inspect(binary(doc))['errors'])

    def test_external_texture_and_budget(self):
        doc=minimal();doc['images']=[{'uri':'texture.png'}];doc['accessors'][0]['count']=540003
        result=self.inspect(binary(doc))
        self.assertIn('Textures must be embedded',result['errors'])
        self.assertIn('Triangle count outside mobile ceiling',result['errors'])

    def test_bin_bounds(self):
        doc=minimal();doc['bufferViews'][0]['byteLength']=999
        self.assertIn('Buffer view outside embedded BIN',self.inspect(binary(doc))['errors'])

    def test_embedded_texture_dimensions(self):
        doc=minimal();payload=b'\x89PNG\r\n\x1a\n'+b'\0'*8+struct.pack('>II',4096,2048)
        doc['buffers'][0]['byteLength']=len(payload);doc['bufferViews'][0]['byteLength']=len(payload)
        doc['images']=[{'bufferView':0,'mimeType':'image/png'}]
        self.assertIn('Texture exceeds mobile dimension budget',self.inspect(binary(doc,payload))['errors'])


if __name__=='__main__':unittest.main()
