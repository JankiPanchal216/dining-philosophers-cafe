const v = (name) => `var(--${name})`;
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        muted: v('muted'),
        ink: v('text'),
        sub: v('sub'),
        line: v('border'),
        accent: v('accent'),
        tone: {
          thinking: v('tone-thinking'),
          hungry: v('tone-hungry'),
          waiting: v('tone-waiting'),
          eating: v('tone-eating'),
          bad: v('tone-bad'),
          backoff: v('tone-backoff'),
        },
      },
    },
  },
  plugins: [],
};
