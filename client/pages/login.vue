<script setup>
definePageMeta({
  middleware: ["guest"],
  layout: "guest",
});

const router = useRouter();
const { $api, $utils } = useNuxtApp();

const email = ref("");
const password = ref("");

const loading = ref(false);

async function attempt() {
  loading.value = true;
  const token = await $api.store("/attemptLogin", {
    email: email.value,
    password: password.value,
  });
  loading.value = false;
  if (!token) {
    password.value = "";
    return;
  }
  const redirect = await $api.login(await $api.attempt(token));
  await $utils.sleep(400);
  await router.push({ path: redirect });
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="attempt">
    <div class="flex flex-col gap-2">
      <Label for="email">Почта</Label>
      <TextInput
        :error="$api.$errors.value.email"
        id="email"
        name="email"
        v-model="email"
        type="email"
      />
    </div>
    <div class="flex flex-col gap-2">
      <Label for="password">Пароль</Label>
      <TextInput
        :error="$api.$errors.value.password"
        id="password"
        name="password"
        v-model="password"
        type="password"
      />
    </div>
    <div class="flex justify-between items-center">
      <NuxtLink
        class="text-sm text-gray-600 hover:underline"
        to="/forgot-password"
        >Забыли пароль?</NuxtLink
      >
      <Button :disabled="loading">Войти</Button>
    </div>
  </form>
</template>

<style scoped></style>
