

<script setup lang="ts">
import { ref } from "vue";
const search = ref("");

const loading = ref(false);

const onClick = () => {
  console.log(search.value);
  loading.value = true;

  setTimeout(() => {
    loading.value = false;
  }, 2000);
};
</script>

<template>
  <v-container>
    <v-card class="mx-auto" color="grey-lighten-3" max-width="100%">
      <v-card-text>
        <v-text-field
          v-model="search"
          :loading="loading"
          append-inner-icon="mdi-magnify"
          density="compact"
          label="Search templates"
          variant="solo"
          hide-details
          single-line
          @click:append-inner="onClick"
        ></v-text-field>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped lang="scss"></style>
