<script setup>
const props = defineProps(["modelValue", "error"]);

defineEmits(["update:modelValue"]);

const input = ref(null);
onMounted(() => {
  if (input.value.hasAttribute("autofocus")) {
    input.value.focus();
  }
});
</script>

<script>
export default {
  inheritAttrs: false,
};
</script>

<template>
  <input
    :="$attrs"
    class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    ref="input"
  />
  <span class="text-sm text-rose-600" v-if="error">{{ error }}</span>
</template>
