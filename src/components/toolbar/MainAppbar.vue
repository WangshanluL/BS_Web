<!-- * @Component: * @Maintainer: J.K. Yang * @Description: --> 
<script setup lang="ts">
import { useDisplay } from "vuetify";
import { useCustomizeThemeStore } from "@/stores/customizeTheme";
import ToolbarNotifications from "./ToolbarNotifications.vue";
import ToolbarUser from "./ToolbarUser.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { getCurrentInstance } from "vue";
import { ref, onMounted, watch, onBeforeUnmount, computed, nextTick ,onUnmounted} from "vue";
const { mdAndUp } = useDisplay();
const customizeTheme = useCustomizeThemeStore();
const router = useRouter();
const snackbarStore = useSnackbarStore();
const { proxy } = getCurrentInstance();
const userInfo = ref({});

onMounted(() => {
  const userInfoData = localStorage.getItem('userInfo');
  const userinf = JSON.parse(userInfoData);
  userInfo.value = userinf;
})

// 开始新聊天的函数
const startNewChat = async () => {
  try {
    // 向后端发送创建新聊天的请求
    const response = await axios.post(proxy.globalInfo.new_url_f + '/chats/newChat', {
      user_id: userInfo.value.userId
    });
    
    // 检查响应状态码是否成功
    if (response.data.code === 200) {
      // 从响应中获取chat_id
      const chatId = response.data.data.chat_id;
      
      // 将chat_id存储到localStorage
      localStorage.setItem('chat_id', chatId);
      
      // 导航到聊天页面
      router.push(`/ai/chatbot_v1/${chatId}`);
      // 显示成功提示
      snackbarStore.showSuccessMessage("新建聊天成功");
    } else {
      // 处理错误情况
      console.error('创建聊天失败:', response.data.message);
      // 显示错误提示
      snackbarStore.showErrorMessage(`创建聊天失败: ${response.data.message}`);
    }
  } catch (error) {
    // 处理网络错误或其他异常
    console.error('请求发生错误:', error);
    // 显示网络错误提示
    snackbarStore.showErrorMessage("连接错误，请刷新页面重试");
  }
};
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!--App Bar -->
  <!-- ---------------------------------------------- -->
  <v-app-bar :density="mdAndUp ? 'default' : 'compact'">
  <div class="px-2 d-flex align-center justify-space-between w-100">
    <!-- 替换为圆形New Chat按钮 -->
    <v-btn
      icon
      @click="startNewChat"
      variant="text"
      size="large"
      class="ml-2"
    >
      <v-icon size="large">mdi-message-plus-outline</v-icon>
      <v-tooltip
        activator="parent"
        location="bottom"
      >
        New Chat
      </v-tooltip>
    </v-btn>
    
    <v-spacer></v-spacer>
    
    <!-- 头像和通知 -->
    <div class="d-flex">
      <ToolbarNotifications />
      <v-divider vertical thickness="2" inset class="ml-5 mr-1"></v-divider>
      <ToolbarUser />
    </div>
  </div>
  </v-app-bar>
</template>

<style scoped lang="scss"></style>