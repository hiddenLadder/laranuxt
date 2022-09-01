import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import Api from "~/lib/api";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  return {
    provide: {
      api: new Api({
        fetchOptions: {
          baseURL: config.public.apiURL,
        },
        apiURL: config.public.apiURL,
        webURL: config.public.webURL,
        redirect: {
          logout: "/",
          login: "/login",
        },
      }),
    },
  };
});

declare module "#app" {
  interface NuxtApp {
    $api: Api;
  }
}
