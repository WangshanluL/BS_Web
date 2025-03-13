<template>
  <div class="cover" :style="{ width: width + 'px', height: width + 'px' }">
    <el-image
      :style="{ width: width + 'px', height: width + 'px' }"
      fit="scale-down"
      loading="lazy"
      :src="proxy.globalInfo.coverImage + cover"
    >
    </el-image>
  </div>
</template>

<script setup>
import { getCurrentInstance,onBeforeUnmount } from "vue";
const { proxy } = getCurrentInstance();



const localCover = new URL("@/assets/default_cover.png", import.meta.url).href;

const props = defineProps({
  cover: {
    type: String,
  },
  width: {
    type: Number,
    default: 60,
  },
});

</script>

<style lang="scss">
.cover {
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
}
</style>