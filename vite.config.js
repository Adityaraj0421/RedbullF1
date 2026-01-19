import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        target: 'esnext',
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    'three': ['three'],
                    'r3f': ['@react-three/fiber', '@react-three/drei'],
                    'mediapipe': ['@mediapipe/tasks-vision'],
                    'postprocessing': ['@react-three/postprocessing']
                }
            }
        }
    },
    optimizeDeps: {
        include: ['three', '@react-three/fiber', '@react-three/drei']
    }
})
