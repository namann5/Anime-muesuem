/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        anime: {
          cream: "#E1E0CC",
          'cream-muted': "#A1A094",
          'cream-dim': "#71716A",
          terracotta: "#D97A5C",
          'terracotta-soft': "#E09A7F",
          dark: "#0A0A0B",
          'dark-secondary': "#141416",
          'dark-card': "#1B1B1E",
          line: "rgba(225, 224, 204, 0.08)",
          pink: "#D97A5C",
          'pink-light': "#DE9074",
          'pink-lighter': "#E8B49B",
          muted: "#A1A094",
          accent: "#D97A5C",
        },
        pink: {
          300: "#E8B49B",
          400: "#DE9074",
          500: "#D97A5C",
          600: "#C26244",
          700: "#A3513C",
        },
        rose: {
          400: "#C97E6B",
          500: "#B96B57",
          600: "#A05A48",
        },
        purple: {
          300: "#A8A091",
          400: "#8F8577",
          500: "#776F64",
          600: "#635C53",
        },
        violet: {
          400: "#A1907B",
          500: "#8B7D6A",
          600: "#6B5E4E",
        },
        indigo: {
          400: "#7E7A8A",
          500: "#6A6674",
          600: "#585462",
        },
        cyan: {
          300: "#7FA3A3",
          400: "#6E9595",
          500: "#5D8585",
          600: "#4F7272",
        },
        blue: {
          300: "#9AAAB3",
          400: "#82949F",
          500: "#6C808D",
          600: "#596C7A",
        },
        orange: {
          400: "#D2915F",
          500: "#C9814F",
          600: "#B06F41",
        },
        amber: {
          300: "#DfB87D",
          400: "#D9A05B",
          500: "#C98C4C",
        },
        emerald: {
          400: "#6FA08C",
          500: "#5A8B78",
        },
        teal: {
          400: "#5F9494",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Helvetica", "Arial", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'gradient-anime': 'linear-gradient(90deg, #D97A5C, #DE9074)',
        'gradient-dark': "linear-gradient(180deg, #0A0A0B 0%, #141416 100%)",
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-0.5deg)' },
          '100%': { transform: 'translateY(0) rotate(0deg)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'grain-shift': {
          '0%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-3%, 2%)' },
          '100%': { transform: 'translate(0, 0)' },
        },
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.6s ease-out backwards',
        'fadeInDown': 'fadeInDown 0.8s ease-out',
        'grain': 'grain-shift 0.9s steps(2) infinite',
      },
      gridTemplateColumns: {
        'large': 'repeat(auto-fill, minmax(220px, 1fr))',
      },
    },
  },
  plugins: [],
}