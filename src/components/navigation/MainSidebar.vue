<script setup lang="ts">
import { useCustomizeThemeStore } from "@/stores/customizeTheme";
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import axios from "axios";

const customizeTheme = useCustomizeThemeStore();
const userInfo = ref({});
const { proxy } = getCurrentInstance();

// 定义接口
interface ChatItem {
  id: number;
  chat_id: string;
  title: string;
  created_time: string;
}



const chatHistory = ref<ChatItem[]>([]);
const router = useRouter();

// 从后端获取聊天历史数据
const fetchChatHistory = async () => {
  try {
    console.log("gg",userInfo.value.userId)

    const response = await axios.post(
      proxy.globalInfo.new_url_f+"/chats/getUserChats",
      { user_id: userInfo.value.userId}
    );
    
    if (response.data.code === 200) {
      chatHistory.value = response.data.data;
    } else {
      console.error('获取聊天历史失败:', response.data.message);
    }
  } catch (error) {
    console.error('获取聊天历史失败:', error);
  }
};

// 导航到特定聊天并更新访问时间
const navigateToChat = async (chatId: string): Promise<void> => {
  try {
    // 更新访问时间
    await axios.post(`${proxy.globalInfo.new_url_f}/chats/updateAccessTime`, {
      chat_id: chatId,
      user_id: userInfo.value.userId
    });
    
    // 重新获取聊天历史
    await fetchChatHistory();
    localStorage.setItem("chat_id", chatId);
    // 导航到聊天页面
    router.push(`/ai/chatbot_v1/${chatId}`);
  } catch (error) {
    console.error('更新访问时间失败:', error);
  }
};

// 在组件挂载时获取数据
onMounted(async () => {
  const userInfoData = localStorage.getItem('userInfo');
  if (userInfoData) {
    const userIn = JSON.parse(userInfoData);
    userInfo.value = userIn;
    await fetchChatHistory();
  }
});
</script>

<template>
  <v-navigation-drawer expand-on-hover rail style="padding-left: 3px;">
    <template v-if="!customizeTheme.miniSidebar" v-slot:prepend>
      <div class="logo-container">
        <img
          v-if="customizeTheme.darkTheme"
          width="100"
          src="@/assets/logo/final.jpg"
          alt="Logo"
          class="my-2"
        />
        <img
          v-else
          width="100"
          src="@/assets/logo/logo2_light.jpg"
          alt="Logo"
          class="my-2"
        />
        <div class="app-title">慧问速答</div>
      </div>
    </template>
    
    <v-divider></v-divider>
    
    <v-list density="compact" nav>
      <v-list-group value="chats">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-message-text"
            title="聊天记录"
            value="chats"
          ></v-list-item>
        </template>
        
        <v-list-item
          v-for="chat in chatHistory"
          :key="chat.chat_id"
          prepend-icon="mdi-message-processing-outline"
          :title="chat.title"
          :value="chat.chat_id"
          @click="navigateToChat(chat.chat_id)"
        ></v-list-item>
      </v-list-group>
      
      <v-list-item 
        prepend-icon="mdi-account-multiple" 
        title="Shared with me" 
        value="shared"
        to="/shared"
      ></v-list-item>
      
      <v-list-item 
        prepend-icon="mdi-star" 
        title="Starred" 
        value="starred"
        to="/starred"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-title {
  margin-top: 4px;
  margin-bottom: 8px;
  font-size: 1.4rem !important;
  font-weight: 600;
  letter-spacing: 1px;
  font-family: 'SourceHanSansCN-Bold', sans-serif;
}
</style>