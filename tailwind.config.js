export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--background)',
          surface: 'var(--surface)',
          primary: 'var(--primary)',
          primaryContainer: 'var(--primary-container)',
          text: 'var(--text)',
          textMuted: 'var(--text-muted)',
          error: 'var(--error)',
          success: 'var(--success)',
          secondary: 'var(--secondary)',
          border: 'var(--border)',
        }
      }
    },
  },
  plugins: [],
}
