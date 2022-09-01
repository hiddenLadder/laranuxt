<script setup>
import { useNuxtApp } from "#app";

const { $api } = useNuxtApp();

const users = ref([]);

// onMounted(async () => {
//   users.value = await $api.index("/example", { count: 9 });
// });
</script>

<template>
  <div class="mx-auto container p-2 flex flex-col">
    <h1>Index page</h1>
    <div>
      {{ users }}
    </div>
  </div>
</template>
