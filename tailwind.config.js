/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tokens LRPC legacy (gardés pour compatibilité)
        'wle-dark':         '#1a1a1a',
        'wle-neon-orange':  '#FF6A00',
        'wle-neon-green':   '#A8FF00',
        'wle-neon-yellow':  '#FFFF00',
        'wle-neutral':      '#F0F0F0',

        // Tokens Festichill (liés aux CSS vars)
        'fs-bg':            'var(--fs-bg)',
        'fs-surface':       'var(--fs-surface)',
        'fs-surface-2':     'var(--fs-surface-2)',
        'fs-border':        'var(--fs-border)',
        'fs-text':          'var(--fs-text)',
        'fs-text-muted':    'var(--fs-text-muted)',
        'fs-accent':        'var(--fs-accent)',
        'fs-accent-hover':  'var(--fs-accent-hover)',
        'fs-success':       'var(--fs-success)',
        'fs-danger':        'var(--fs-danger)',
        'fs-warning':       'var(--fs-warning)',
        'fs-green':         'var(--fs-green)',
      },
    },
  },
  plugins: [],
};
