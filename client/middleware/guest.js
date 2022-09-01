export default defineNuxtRouteMiddleware((to, from) => {
  const { $api } = useNuxtApp();
  if ($api.loggedIn.value) {
    return navigateTo("/");
  }
});
