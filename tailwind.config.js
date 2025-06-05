/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './src/**/*.{js,ts,jsx,tsx,mdx}',
      './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          // Custom color palette for Herofy
          herofy: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          // Quest difficulty colors
          quest: {
            easy: '#10b981',    // green
            medium: '#3b82f6',  // blue
            hard: '#8b5cf6',    // purple
            epic: '#f59e0b',    // amber
          },
          // RPG stat colors
          stat: {
            strength: '#ef4444',   // red
            wisdom: '#3b82f6',     // blue
            endurance: '#10b981',  // green
            charisma: '#f59e0b',   // amber
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['Fira Code', 'monospace'],
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'slide-down': 'slideDown 0.3s ease-out',
          'scale-in': 'scaleIn 0.2s ease-out',
          'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
          'glow': 'glow 2s ease-in-out infinite alternate',
          'level-up': 'levelUp 0.8s ease-out',
          'xp-gain': 'xpGain 0.5s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          slideDown: {
            '0%': { transform: 'translateY(-10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          scaleIn: {
            '0%': { transform: 'scale(0.95)', opacity: '0' },
            '100%': { transform: 'scale(1)', opacity: '1' },
          },
          bounceSubtle: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-5px)' },
          },
          glow: {
            '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
            '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
          },
          levelUp: {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)', boxShadow: '0 0 30px gold' },
            '100%': { transform: 'scale(1)' },
          },
          xpGain: {
            '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
            '100%': { transform: 'translateY(-20px) scale(1.2)', opacity: '0' },
          },
        },
        boxShadow: {
          'quest': '0 4px 20px rgba(0, 0, 0, 0.1)',
          'quest-hover': '0 8px 30px rgba(0, 0, 0, 0.15)',
          'level-up': '0 0 30px rgba(255, 215, 0, 0.6)',
          'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
          'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        },
        backdropBlur: {
          xs: '2px',
        },
        screens: {
          'xs': '475px',
        },
      },
    },
    plugins: [],
  }