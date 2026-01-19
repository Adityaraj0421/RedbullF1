#!/usr/bin/env node

/**
 * Rebuild GLB file with upscaled textures
 * Takes the original f1_car.glb and replaces embedded textures with upscaled versions
 */

const fs = require('fs');
const path = require('path');

const INPUT_GLB = 'public/models/f1_car.glb';
const OUTPUT_GLB = 'public/models/f1_car_hd.glb';
const UPSCALED_DIR = 'upscaled_textures';

console.log('🔧 GLB Texture Replacer\n');

// Read original GLB
const glbBuffer = fs.readFileSync(INPUT_GLB);

// Parse GLB header
const magic = glbBuffer.readUInt32LE(0);
const version = glbBuffer.readUInt32LE(4);
const length = glbBuffer.readUInt32LE(8);

console.log(`📦 Original GLB: ${(length / 1024 / 1024).toFixed(2)} MB`);

// Parse JSON chunk
const jsonLength = glbBuffer.readUInt32LE(12);
const jsonType = glbBuffer.readUInt32LE(16);
const jsonData = JSON.parse(glbBuffer.toString('utf8', 20, 20 + jsonLength));

console.log(`📄 Meshes: ${jsonData.meshes.length}`);
console.log(`🎨 Materials: ${jsonData.materials.length}`);
console.log(`🖼️  Textures: ${jsonData.textures.length}`);
console.log(`📸 Images: ${jsonData.images.length}\n`);

// Parse BIN chunk
const binOffset = 20 + jsonLength;
const binLength = glbBuffer.readUInt32LE(binOffset);
const binType = glbBuffer.readUInt32LE(binOffset + 4);
const binData = glbBuffer.slice(binOffset + 8, binOffset + 8 + binLength);

// Check if upscaled textures exist
const upscaledFiles = fs.readdirSync(UPSCALED_DIR).filter(f => f.endsWith('.png'));

if (upscaledFiles.length === 0) {
    console.error('❌ No upscaled textures found in upscaled_textures/');
    console.error('Please run the upscaling process first.');
    process.exit(1);
}

console.log(`✅ Found ${upscaledFiles.length} upscaled textures\n`);

// Build new binary data with upscaled textures
let newBinData = Buffer.alloc(0);
const newBufferViews = [];

jsonData.images.forEach((img, i) => {
    const originalName = img.name;
    const upscaledPath = path.join(UPSCALED_DIR, `${originalName}.png`);

    if (fs.existsSync(upscaledPath)) {
        const upscaledData = fs.readFileSync(upscaledPath);

        // Add to binary data
        const byteOffset = newBinData.length;
        newBinData = Buffer.concat([newBinData, upscaledData]);

        // Update buffer view
        newBufferViews.push({
            buffer: 0,
            byteOffset: byteOffset,
            byteLength: upscaledData.length
        });

        // Update image reference
        img.bufferView = newBufferViews.length - 1;

        console.log(`${i + 1}. ${originalName}: ${(upscaledData.length / 1024).toFixed(1)} KB`);
    } else {
        console.warn(`⚠️  Missing: ${upscaledPath}`);
    }
});

// Update JSON with new buffer views
jsonData.bufferViews = newBufferViews;
jsonData.buffers = [{ byteLength: newBinData.length }];

// Serialize new JSON
const newJsonString = JSON.stringify(jsonData);
const newJsonBuffer = Buffer.from(newJsonString, 'utf8');

// Pad JSON to 4-byte alignment
const jsonPadding = (4 - (newJsonBuffer.length % 4)) % 4;
const paddedJsonBuffer = Buffer.concat([
    newJsonBuffer,
    Buffer.alloc(jsonPadding, 0x20) // Space character
]);

// Pad BIN to 4-byte alignment
const binPadding = (4 - (newBinData.length % 4)) % 4;
const paddedBinBuffer = Buffer.concat([
    newBinData,
    Buffer.alloc(binPadding, 0x00)
]);

// Build new GLB
const newLength = 12 + 8 + paddedJsonBuffer.length + 8 + paddedBinBuffer.length;

const newGlb = Buffer.alloc(newLength);
let offset = 0;

// GLB header
newGlb.writeUInt32LE(0x46546C67, offset); offset += 4; // magic "glTF"
newGlb.writeUInt32LE(2, offset); offset += 4; // version
newGlb.writeUInt32LE(newLength, offset); offset += 4; // length

// JSON chunk
newGlb.writeUInt32LE(paddedJsonBuffer.length, offset); offset += 4;
newGlb.writeUInt32LE(0x4E4F534A, offset); offset += 4; // "JSON"
paddedJsonBuffer.copy(newGlb, offset); offset += paddedJsonBuffer.length;

// BIN chunk
newGlb.writeUInt32LE(paddedBinBuffer.length, offset); offset += 4;
newGlb.writeUInt32LE(0x004E4942, offset); offset += 4; // "BIN\0"
paddedBinBuffer.copy(newGlb, offset);

// Write output
fs.writeFileSync(OUTPUT_GLB, newGlb);

console.log(`\n✅ Created HD model: ${OUTPUT_GLB}`);
console.log(`📦 New size: ${(newLength / 1024 / 1024).toFixed(2)} MB`);
console.log(`📈 Size increase: ${((newLength / length - 1) * 100).toFixed(1)}%`);
console.log(`\n🎯 Update F1Car.jsx to use: '/models/f1_car_hd.glb'`);
