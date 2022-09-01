<script setup>
const { $api } = useNuxtApp();
</script>

<template>
  <header class="p-3 shadow">
    <div class="flex gap-4">
      <NavLink to="/">Главная</NavLink>
      <template v-if="$api.loggedIn.value">
        <NavLink to="/home">Профиль</NavLink>
      </template>
      <template v-else>
        <NavLink to="/login">Войти</NavLink>
        <NavLink to="/register">Зарегистрироваться</NavLink>
      </template>
    </div>
  </header>
</template>
