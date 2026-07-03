import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    // Fill transparent areas with the app's dark background (iOS icons must be opaque)
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background: '#101415' },
    },
  },
  images: ['public/pwa-icon.svg'],
})
