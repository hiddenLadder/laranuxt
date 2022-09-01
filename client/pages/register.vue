<script setup>
definePageMeta({
  middleware: ["guest"],
  layout: "guest",
});

const router = useRouter();
const { $api, $utils } = useNuxtApp();

const name = ref("");
const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");

const loading = ref(false);

async function attempt() {
  loading.value = true;
  const token = await $api.store("/attemptRegister", {
    name: name.value,
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
  });
  loading.value = false;
  if (!token) {
    password.value = "";
    passwordConfirmation.value = "";
    return;
  }
  const redirect = await $api.login(await $api.attempt(token));
  await $utils.sleep(400);
  await router.push({ path: redirect });
}
</script>

<template>
  <form @submit.prevent="attempt" class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label for="name">Логин</Label>
      <TextInput
        :error="$api.$errors.value.name"
        id="name"
        name="name"
        v-model="name"
        type="text"
      />
    </div>
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
    <div class="flex flex-col gap-2">
      <Label for="password_confirmation">Подтвердите пароль</Label>
      <TextInput
        id="password_confirmation"
        name="password_confirmation"
        v-model="passwordConfirmation"
        type="password"
      />
    </div>
    <div class="flex justify-between items-center">
      <NuxtLink class="text-sm text-gray-600 hover:underline" to="/login"
        >Уже зарегистрированы?</NuxtLink
      >
      <Button :disabled="loading">Зарегистрироваться</Button>
    </div>
  </form>
</template>

<style scoped></style>
