/** @type {import('tailwindcss').Config} */
module.exports = {
  // Указываем пути ко всем файлам, где будет использоваться Tailwind
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Тот самый глубокий темный цвет с референса
        'tura-black': '#0a0a0a',
        'tura-gray': '#161616',
      },
      letterSpacing: {
        // Для «растянутых» заголовков как на картинке
        'tighter-extra': '-0.05em',
        'widest-extra': '0.5em',
      },
      fontFamily: {
        // Теперь класс 'font-main' будет использовать Inter
        main: ['var(--font-inter)'],
        // Класс 'font-title' будет для заголовков TURA
        title: ['var(--font-syncopate)'],
      },
    },
  },
  plugins: [],
}