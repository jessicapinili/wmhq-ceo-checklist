/** All colours/fonts/radii/shadows come from CSS variables in src/index.css */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'color-mix(in srgb, var(--c-bg) calc(<alpha-value> * 100%), transparent)', surface: 'color-mix(in srgb, var(--c-surface) calc(<alpha-value> * 100%), transparent)', cream: 'color-mix(in srgb, var(--c-cream) calc(<alpha-value> * 100%), transparent)',
        ink: 'color-mix(in srgb, var(--c-ink) calc(<alpha-value> * 100%), transparent)', muted: 'color-mix(in srgb, var(--c-muted) calc(<alpha-value> * 100%), transparent)', line: 'color-mix(in srgb, var(--c-line) calc(<alpha-value> * 100%), transparent)', soft: 'color-mix(in srgb, var(--c-soft) calc(<alpha-value> * 100%), transparent)',
        blush: 'color-mix(in srgb, var(--c-blush) calc(<alpha-value> * 100%), transparent)', accent: 'color-mix(in srgb, var(--c-accent) calc(<alpha-value> * 100%), transparent)', 'accent-soft': 'color-mix(in srgb, var(--c-accent-soft) calc(<alpha-value> * 100%), transparent)',
        highlight: 'color-mix(in srgb, var(--c-highlight) calc(<alpha-value> * 100%), transparent)', success: 'color-mix(in srgb, var(--c-success) calc(<alpha-value> * 100%), transparent)', 'success-soft': 'color-mix(in srgb, var(--c-success-soft) calc(<alpha-value> * 100%), transparent)', danger: 'color-mix(in srgb, var(--c-danger) calc(<alpha-value> * 100%), transparent)',
      },
      fontFamily: { sans: 'var(--f-body)', display: 'var(--f-display)', pixel: 'var(--f-pixel)' },
      borderRadius: { card: 'var(--r-card)', pill: '999px', field: 'var(--r-field)' },
      boxShadow: { card: 'var(--sh-card)', lift: 'var(--sh-lift)' },
      borderWidth: { DEFAULT: '1px', bold: 'var(--bw-bold)' },
    },
  },
}
