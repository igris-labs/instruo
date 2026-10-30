import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  buildDir: process.env.INSTRUO_BUILD_DIR || ".nuxt",
  compatibilityDate: "2025-07-15",
  // Keep the owner's normal devtools; isolated review/test builds need an unobstructed viewport.
  devtools: { enabled: !process.env.INSTRUO_BUILD_DIR },

  sourcemap: {
    server: false,
    client: false,
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxtjs/color-mode",
    "@nuxt/content",
    "@vueuse/nuxt",
    "akaza-ui/nuxt",
    "nuxt-gtag",
  ],

  alias: {
    "#wordle-answers": new URL("./node_modules/wordles/wordles.json", import.meta.url).pathname,
    "#wordle-guesses": new URL("./node_modules/wordles/nonwordles.json", import.meta.url).pathname,
  },

  nitro: {
    preset: "cloudflare-pages",
  },

  css: ["~/assets/main.css", "~/assets/brand.css"],

  vite: {
    plugins: [tailwindcss()],
    worker: { format: "es" },
    optimizeDeps: {
      // Prevent first-use dependency optimization from reloading an editor with unsaved input.
      include: [
        "culori",
        "mermaid",
        "marked",
        "dompurify",
        "exifr",
        "@peculiar/x509",
        "reflect-metadata",
        "cron-parser",
        "diff",
        "parse5",
        "jsqr",
        "qrcode",
        "papaparse",
        "jsonpath-js",
        "ajv/dist/2020.js",
        "ajv-formats",
        "prettier/standalone",
        "prettier/plugins/babel",
        "prettier/plugins/estree",
        "prettier/plugins/html",
        "prettier/plugins/postcss",
        "prettier/plugins/graphql",
        "terser",
        "csso",
        "sql-formatter",
        "xml-formatter",
        "html-minifier-terser/dist/htmlminifier.esm.bundle",
        "shiki/core",
        "shiki/engine/javascript",
        "shiki/themes/light-plus.mjs",
        "shiki/themes/dark-plus.mjs",
        ...[
          "json",
          "jsonc",
          "javascript",
          "typescript",
          "html",
          "css",
          "sql",
          "yaml",
          "xml",
          "shellscript",
          "dockerfile",
          "ini",
          "dotenv",
          "nginx",
          "graphql",
          "markdown",
          "csv",
          "mermaid",
          "http",
          "vue",
          "diff",
        ].map((language) => `shiki/langs/${language}.mjs`),
      ],
    },
  },

  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "light",
  },

  icon: {
    cssLayer: "components",
    provider: "none",
    fallbackToApi: false,
    serverBundle: {
      collections: ["tabler"],
    },
    clientBundle: {
      // Include content frontmatter so dynamic catalogue icons stay available offline.
      scan: {
        globInclude: ["app/**/*.vue", "app/**/*.ts", "content/**/*.md"],
        globExclude: ["node_modules/**", ".nuxt/**", "dist/**"],
      },
    },
  },

  components: [
    {
      path: "~/components/ui",
      prefix: "Ui",
      pathPrefix: false,
      extensions: [".vue"],
    },
  ],
});
