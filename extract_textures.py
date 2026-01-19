import json
import struct
import os

# Read GLB file
with open('public/models/f1_car.glb', 'rb') as f:
    # Read GLB header
    magic = f.read(4)
    version = struct.unpack('<I', f.read(4))[0]
    length = struct.unpack('<I', f.read(4))[0]
    
    # Read JSON chunk
    json_length = struct.unpack('<I', f.read(4))[0]
    json_type = f.read(4)
    json_data = json.loads(f.read(json_length).decode('utf-8'))
    
    # Read BIN chunk
    bin_length = struct.unpack('<I', f.read(4))[0]
    bin_type = f.read(4)
    bin_data = f.read(bin_length)

# Create output directory
os.makedirs('extracted_textures', exist_ok=True)

print('=== Extracting Textures ===\n')

# Extract images
for i, img in enumerate(json_data['images']):
    name = img.get('name', f'texture_{i}')
    buffer_view_idx = img['bufferView']
    buffer_view = json_data['bufferViews'][buffer_view_idx]
    
    offset = buffer_view['byteOffset']
    length = buffer_view['byteLength']
    
    # Extract image data
    image_data = bin_data[offset:offset + length]
    
    # Save
    output_path = f'extracted_textures/{name}.png'
    with open(output_path, 'wb') as out:
        out.write(image_data)
    
    # Read PNG dimensions (simple header parsing)
    width = struct.unpack('>I', image_data[16:20])[0]
    height = struct.unpack('>I', image_data[20:24])[0]
    
    print(f'{i}. {name}')
    print(f'   Resolution: {width}x{height}')
    print(f'   Size: {len(image_data) / 1024:.1f} KB')
    print(f'   Saved to: {output_path}\n')

print(f'✅ Extracted {len(json_data["images"])} textures to extracted_textures/')
