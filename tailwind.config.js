/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', '"Segoe UI"', 'Tahoma', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#5B2C87',
          light: '#7B4397',
          dark: '#3E1D5E',
        },
        accent: {
          DEFAULT: '#8B1E3F',
          light: '#B14A5F',
        },
        surface: {
          DEFAULT: '#F8F7FB',
          dark: '#1E1230',
        },
        panel: {
          DEFAULT: '#FFFFFF',
          dark: '#2A1B42',
        },
        ink: {
          DEFAULT: '#1A1A2E',
          dark: '#EDE7F6',
        },
        muted: {
          DEFAULT: '#6B6478',
          dark: '#A79BC0',
        },
        stable: '#2F7D5C',
        watch: '#C97A2B',
        medium: '#C97A2B',
        high: '#8B1E3F',
        border: {
          DEFAULT: '#E4E0EC',
          dark: '#3D2B5C',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};
