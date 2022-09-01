<script setup></script>

<template>
  <div
    class="min-h-screen flex justify-center items-center flex-col gap-4 bg-gray-100"
  >
    <div>
      <ApplicationLogo />
    </div>
    <div class="bg-white shadow rounded-lg max-w-md w-full p-3">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
