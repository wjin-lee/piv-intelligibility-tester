/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@spartan-ng/ui-core/hlm-tailwind-preset")],
  content: ["./src/**/*.{html,ts}", "./src/components/spartan/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        mona: ["MonaSans"],
      },
      colors: {
        lime: "#00ed64",
      },
    },
  },
  plugins: [],
};
