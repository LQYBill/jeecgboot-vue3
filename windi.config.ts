import { defineConfig } from 'vite-plugin-windicss';
import { primaryColor } from './build/config/themeConfig';

export default defineConfig({
  darkMode: 'class',
  plugins: [createEnterPlugin()],
  theme: {
    extend: {
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
    },
    flex: {
      1: '1 1 0%',
      2: '2 2 0%',
    },
  },
});

/**
 * Used for animation when the element is displayed
 * @param maxOutput The larger the maxOutput output, the larger the generated css volume
 */
function createEnterPlugin(maxOutput = 8) {
  const createCss = (index: number, d = 'x') => {
    const upd = d.toUpperCase();
    return {
      [`*> .enter-${d}:nth-child(${index})`]: {
        transform: `translate${upd}(50px)`,
      },
      [`*> .-enter-${d}:nth-child(${index})`]: {
        transform: `translate${upd}(-50px)`,
      },
      [`* > .enter-${d}:nth-child(${index}),* > .-enter-${d}:nth-child(${index})`]: {
        'z-index': `${10 - index}`,
        opacity: '0',
        animation: `enter-${d}-animation 0.4s ease-in-out 0.3s`,
        'animation-fill-mode': 'forwards',
        'animation-delay': `${(index * 1) / 10}s`,
      },
    };
  };
  const handler = ({ addBase }) => {
    const addRawCss = {};
    for (let index = 1; index < maxOutput; index++) {
      Object.assign(addRawCss, {
        ...createCss(index, 'x'),
        ...createCss(index, 'y'),
      });
    }
    addBase({
      ...addRawCss,
      [`@keyframes enter-x-animation`]: {
        to: {
          opacity: '1',
          transform: 'translateX(0)',
        },
      },
      [`@keyframes enter-y-animation`]: {
        to: {
          opacity: '1',
          transform: 'translateY(0)',
        },
      },
    });
  };
  return { handler };
}
