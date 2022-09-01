<template>
  <div class="">
    <h1 class="text-center py-4">This page is behind auth middleware</h1>
    <span>$api.$user</span>
    <pre class="text-xs border p-4 bg-gray-900 text-gray-100 rounded-lg mb-4">
    {{ $api.$user }} </pre
    >
    <div class="flex justify-center">
      <NuxtLink to="/"> Go to Index </NuxtLink>
    </div>
    <div class="flex justify-center">
      <button
        @click="$api.logout($router)"
        class="py-1 px-3 bg-sky-500 text-white hover:bg-sky-400 rounded-lg"
      >
        Выйти
      </button>
    </div>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp();

definePageMeta({
  middleware: ["auth"],
});
</script>
