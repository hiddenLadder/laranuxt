import { defineNuxtConfig } from "nuxt";

export default defineNuxtConfig({
  srcDir: "client/",
  meta: {
    title: "VIP BSU",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || "",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/img/favicon.png" }],
  },
  modules: ["@vueuse/nuxt", "@nuxtjs/tailwindcss"],
  runtimeConfig: {
    public: {
      webURL: process.env.WEB_URL || "http://localhost:3000",
      apiURL: process.env.API_URL || "http://localhost:8000",
    },
  },
});
