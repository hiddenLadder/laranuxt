export default defineNuxtRouteMiddleware((to) => {
  const { $api } = useNuxtApp();
  if (!$api.loggedIn.value) {
    return navigateTo("/");
  }
});
