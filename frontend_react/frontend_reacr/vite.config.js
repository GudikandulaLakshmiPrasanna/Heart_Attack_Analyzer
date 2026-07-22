import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // ఒకవేళ నువ్వు టెయిల్విండ్ v4 ప్లగిన్ వాడుతుంటే

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // DaisyUI కి సంబంధించినవి ఇక్కడ ఏమీ ఉండకూడదు భాయ్!
  ],
})