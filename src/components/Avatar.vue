<template>
  <div
    class="avatar"
    :style="{
      width: width + 'px',
      height: width + 'px',
      'border-radius': width / 2 + 'px',
    }"
  >
    <el-image
      v-if="userId"
      :style="{
        width: width + 'px',
        height: width + 'px',
        'border-radius': width / 2 + 'px',
      }"
      :src="proxy.globalInfo.avatarUrl + userId+'.jpg'"
      fit="scale-down"
      loading="lazy"
      @click="goToUcenter"
    >
    </el-image>
    <div v-else class="no-login">未登录</div>
  </div>
</template>

<script setup>

import { useRouter } from "vue-router";
import axios from 'axios';
import { ref, onMounted,getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();
const router = useRouter();

const props = defineProps({
  userId: {
    type: String,
  },
  width: {
    type: Number,
    default: 60,
  },
  addLink: {
    type: Boolean,
    default: true,
  },
});
console.log("proxy.globalInfo.avatarUrl + userId")
const goToUcenter = () => {
  if (props.addLink) {
    router.push("/user/" + userId);
  }
};
</script>

<style lang="scss">
.avatar {
  display: flex;
  cursor: pointer;
  background: #f0f0f0;
  align-items: center;
  overflow: hidden;
  .no-login {
    width: 100%;
    text-align: center;
    font-size: 13px;
  }
}
</style>