import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  sourcemap: {
    server: false,
    client: false,
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxtjs/color-mode",
    "@nuxt/content",
    "@vueuse/nuxt",
    "nuxt-gtag",
  ],

  alias: {
    "#wordle-answers": new URL("./node_modules/wordles/wordles.json", import.meta.url).pathname,
    "#wordle-guesses": new URL("./node_modules/wordles/nonwordles.json", import.meta.url).pathname,
  },

  nitro: {
    preset: "cloudflare-pages",
  },

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  colorMode: {
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
      path: "~/components",
      global: true,
      pathPrefix: false,
      extensions: [".vue"],
      ignore: ["ui/**"],
    },
    {
      path: "~/components/ui",
      prefix: "Ui",
      pathPrefix: false,
      extensions: [".vue"],
    },
  ],
});
