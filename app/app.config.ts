export default defineAppConfig({
  footer: {
    credits: `© ${new Date().getFullYear()} Instruo`,
    description:
      "Browser tools for small jobs and games for short breaks. Everything opens without an account.",
    tagline: "Useful when you need it.",
    colorMode: true,
    columns: [
      {
        label: "Project",
        children: [
          { label: "All tools", to: "/tools" },
          { label: "All games", to: "/games" },
          {
            label: "Source code",
            to: "https://github.com/igris-labs/instruo",
            target: "_blank",
          },
          {
            label: "Report an issue",
            to: "https://github.com/igris-labs/instruo/issues",
            target: "_blank",
          },
          {
            label: "Sponsor",
            to: "https://github.com/sponsors/rahul-vashishtha",
            target: "_blank",
          },
        ],
      },
      {
        label: "Other products",
        children: [
          { label: "Initera", to: "https://initera.app", target: "_blank" },
          { label: "Inspira UI", to: "https://inspira-ui.com", target: "_blank" },
          { label: "Inspira UI Pro", to: "https://pro.inspira-ui.com", target: "_blank" },
          { label: "Akaza UI", to: "https://akaza-ui.com", target: "_blank" },
        ],
      },
      {
        label: "Created by",
        children: [
          { label: "Rahul Vashishtha", to: "https://rahulv.dev", target: "_blank" },
          { label: "Igris Labs", to: "https://igrislabs.com", target: "_blank" },
        ],
      },
    ],
    links: [
      {
        icon: "i-tabler-brand-x",
        to: "https://x.com/rahulv_dev",
        target: "_blank",
        "aria-label": "Instruo on X",
      },
      {
        icon: "i-tabler-brand-github",
        to: "https://github.com/igris-labs/instruo",
        target: "_blank",
        "aria-label": "Instruo on GitHub",
      },
    ],
  },
});
