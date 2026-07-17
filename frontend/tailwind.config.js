/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Premium Crime Registry Theme
        ink: "#0F1B2D",          // deep navy - authority, professionalism
        paper: "#F8F7F3",        // premium off-white
        panel: "#FFFFFF",        // clean white for cards
        seal: "#C9A561",         // premium gold accent
        sealDark: "#A37D3F",
        sealLight: "#E8DCC4",
        
        // Law enforcement accent colors
        alert: "#DC2626",        // critical/urgent red
        warning: "#F59E0B",      // warning amber
        review: "#8B6F47",       // under review (warm brown)
        progress: "#1E40AF",     // investigating (deep blue)
        resolved: "#065F46",     // resolved (deep green)
        closed: "#4B5563",       // closed (gray)
        
        // Structural colors
        line: "#E5E2DB",         // premium dividers
        surface: "#F3F1ED",      // slightly tinted surface
        dark: "#1A2332",         // darker alternative to ink
        
        // Semantic colors
        success: "#10B981",      // success green
        info: "#3B82F6",         // info blue
        error: "#EF4444",        // error red
      },
      fontFamily: {
        display: ["Source Serif 4", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      borderRadius: {
        none: "0px",
        sm: "3px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      },
      spacing: {
        0: "0",
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        8: "2rem",
        10: "2.5rem",
        12: "3rem",
        16: "4rem",
        20: "5rem",
        24: "6rem",
        32: "8rem",
      },
    },
  },
  plugins: [],
};
