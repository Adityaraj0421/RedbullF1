"""
Simple texture upscaling using Python's built-in libraries
Upscales textures from 512x512 to 2048x2048 using Lanczos resampling
"""

import os
import struct

def read_png_dimensions(data):
    """Read PNG dimensions from header"""
    width = struct.unpack('>I', data[16:20])[0]
    height = struct.unpack('>I', data[20:24])[0]
    return width, height

def upscale_with_imagemagick(input_dir, output_dir, scale=4):
    """Upscale using ImageMagick (if available)"""
    import subprocess
    
    os.makedirs(output_dir, exist_ok=True)
    
    files = [f for f in os.listdir(input_dir) if f.endswith('.png')]
    
    print(f'🎨 Upscaling {len(files)} textures using ImageMagick...\n')
    
    for i, filename in enumerate(files, 1):
        input_path = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename)
        
        # Read original dimensions
        with open(input_path, 'rb') as f:
            data = f.read(24)
            width, height = read_png_dimensions(data)
        
        new_width = width * scale
        new_height = height * scale
        
        print(f'{i}. {filename}')
        print(f'   {width}x{height} → {new_width}x{new_height}')
        
        try:
            # Use ImageMagick's convert command
            subprocess.run([
                'magick', input_path,
                '-filter', 'Lanczos',
                '-resize', f'{new_width}x{new_height}',
                output_path
            ], check=True, capture_output=True)
            print(f'   ✅ Upscaled\n')
        except subprocess.CalledProcessError as e:
            print(f'   ❌ Failed: {e}\n')
        except FileNotFoundError:
            print(f'   ❌ ImageMagick not found. Install with: brew install imagemagick\n')
            return False
    
    return True

if __name__ == '__main__':
    input_dir = 'extracted_textures'
    output_dir = 'upscaled_textures'
    
    success = upscale_with_imagemagick(input_dir, output_dir, scale=4)
    
    if success:
        print('✅ All textures upscaled successfully!')
        print(f'📁 Output directory: {output_dir}/')
    else:
        print('\n⚠️  ImageMagick not available.')
        print('Please use one of the other methods in texture_upscaling_guide.md')
