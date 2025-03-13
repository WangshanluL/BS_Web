<script setup lang="ts">
import MainSidebar from "@/components/navigation/MainSidebar.vue";//这个是左边选项栏
import MainAppbar from "@/components/toolbar/MainAppbar.vue";
// import GlobalLoading from "@/components/GlobalLoading.vue";

import { useCustomizeThemeStore } from "@/stores/customizeTheme";
const customizeTheme = useCustomizeThemeStore();
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!---Main Sidebar -->
  <!-- ---------------------------------------------- -->
  <MainSidebar /> 
  <!-- 左边选择功能栏 -->
  <!-- ---------------------------------------------- -->
  <!---Top AppBar -->
  <!-- ---------------------------------------------- -->
  <MainAppbar />
  <!-- ---------------------------------------------- -->
  <!---MainArea -->
  <!-- ---------------------------------------------- -->

  <v-main
    class="main-container"
    v-touch="{
      left: () => (customizeTheme.mainSidebar = false),
      right: () => (customizeTheme.mainSidebar = true),
    }"
  >
    <!-- <GlobalLoading /> -->
    <!-- <ToolBox /> -->
    <div class="flex-fill">
      <slot></slot>
    </div>
  </v-main>
</template>

<style scoped>
.scrollnav {
  height: calc(100vh - 326px);
}
.main-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
