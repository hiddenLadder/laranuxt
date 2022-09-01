export default defineNuxtRouteMiddleware((to, from) => {
  const { $api } = useNuxtApp();
  if ($api.$errors.value.length !== 0) {
    $api.$errors.value = [];
  }
});
