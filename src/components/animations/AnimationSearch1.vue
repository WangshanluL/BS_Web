<!--
* @Component: 
* @Maintainer: J.K. Yang
* @Description: 
-->
<script setup lang="ts">
import { Vue3Lottie } from "vue3-lottie";
const props = defineProps({
  size: {
    type: Number,
    default: 600,
  },
});
</script>

<template>
  <Vue3Lottie
    animationLink="https://lottie.host/304b015a-9624-4f5f-96c3-553b7db901e2/4ftG3zOxF9.json"
    :height="props.size"
    :width="props.size"
  />
</template>

<style scoped lang="scss"></style>
