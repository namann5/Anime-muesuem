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
                    pink: '#ff6ea6',
                    'pink-light': '#ff9acb',
                    'pink-lighter': '#ffd1e8',
                    dark: '#05050a',
                    'dark-secondary': '#0b0b0f',
                    muted: '#9aa0a6',
                }
            },
            backgroundImage: {
                'gradient-anime': 'linear-gradient(90deg, #ff6ea6, #ff9acb)',
                'gradient-dark': 'linear-gradient(180deg, #05050a 0%, #0b0b0f 100%)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'fadeInUp': 'fadeInUp 0.6s ease-out backwards',
                'fadeInDown': 'fadeInDown 0.8s ease-out',
            },
            keyframes: {
                float: {
                    '0%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-8px) rotate(-1deg)' },
                    '100%': { transform: 'translateY(0) rotate(0deg)' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(40px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    from: { opacity: '0', transform: 'translateY(-30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                }
            },
            gridTemplateColumns: {
                'large': 'repeat(auto-fill, minmax(200px, 1fr))',
            },
        },
    },
    plugins: [],
}
