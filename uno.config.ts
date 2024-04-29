import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'
import {primaryColor} from "./build/config/themeConfig";

export default defineConfig({
  shortcuts: [
    // ...
  ],
  rules: [
    [/^flex-(\d+\.?\d{0,2})$/, match => ({ flex: `${match[1]} ${match[1]} 0%` })],
  ],
  theme: {
    zIndex: {
      '-1': '-1',
    },
    colors: {
      primary: primaryColor,
      success: 'var(--success-color)',
      error: 'var(--error-color)',
      warning: 'var(--warning-color)',
      duck: 'var(--duck-color)',
      growth: 'var(--growth-color)',
      gray: 'var(--gray-color)',
      lightGray: 'var(--light-gray-color)',
    },
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1600px',
    },
    lineHeight: {
      'full': '100%',
    },
    flex: {
      0.5: '0.5 0.5 0%',
      1: '1 1 0%',
      2: '2 2 0%',
    },
    borderRadius: {
      '4xl': '2rem',
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
