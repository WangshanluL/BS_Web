<script setup lang="ts">
import configs from "@/configs";
import { useCustomizeThemeStore } from "@/stores/customizeTheme";
import axios from "axios"; // 添加axios导入

const customizeTheme = useCustomizeThemeStore();
const navigation = ref({...configs.navigation}); // Create a reactive copy
const userInfo = ref({});

// 从后端获取用户聊天历史
const loadChatHistory = async () => {
  try {
    // 检查用户信息是否存在
    if (userInfo.value && userInfo.value.id) {
      // 向后端发送请求获取聊天历史
      //const response = await axios.get(`/api/chat-history/${userInfo.value.id}`);
      //const chatHistory = response.data || [];
      const chatHistory = [{chat_id:"123",title:"哈哈哈"},{chat_id:"23",title:"5555"},{chat_id:"1",title:"55554433"}];
      // 将chat_ids存储到localStorage
      const chatIds = chatHistory.map(history => history.chat_id);
      localStorage.setItem('chatIds', JSON.stringify(chatIds));
      
      // 更新导航菜单的聊天历史
      navigation.value.menu.forEach(menuGroup => {
        if (menuGroup.items) {
          menuGroup.items.forEach(item => {
            if (item.hasChatHistory) {
              // 清空现有子项
              item.children = [];
              
              // 将历史记录添加为子项
              chatHistory.forEach(history => {
                item.children.push({
                  icon: "mdi-message-outline",
                  text: history.title,
                  link: `/ai/chatbot_v1/${history.chat_id}`,
                  key: `chat-history-${history.chat_id}`,
                });
              });
            }
          });
        }
      });
      
      // 如果需要，也检查管理员菜单
      if (navigation.value.adminMenu) {
        navigation.value.adminMenu.forEach(menuGroup => {
          if (menuGroup.items) {
            menuGroup.items.forEach(item => {
              if (item.hasChatHistory) {
                item.children = [];
                chatHistory.forEach(history => {
                  item.children.push({
                    icon: "mdi-message-outline",
                    text: history.title,
                    link: `/ai/chatbot_v1/${history.id}`,
                    key: `chat-history-${history.id}`,
                  });
                });
              }
            });
          }
        });
      }
    }
  } catch (error) {
    console.error("获取聊天历史失败:", error);
  }
};

onMounted(() => {
  // 获取用户信息
  const userInfoData = localStorage.getItem('userInfo');
  if (userInfoData) {
    const userinf = JSON.parse(userInfoData);
    userInfo.value = userinf;
    console.log("mainsider获取的是");
    console.log(userInfo.value);
    
    // 获取聊天历史
    loadChatHistory();
  }
  
  // 设置滚动到当前选中项
  setTimeout(scrollToBottom, 100);
  
  // 设置事件监听器更新聊天历史
  window.addEventListener('chatHistoryUpdated', loadChatHistory);
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('chatHistoryUpdated', loadChatHistory);
});

const scrollToBottom = () => {
  const contentArea = document.querySelector(".v-navigation-drawer__content");
  const activeItem = document.querySelector(
    ".v-list-item--active"
  ) as HTMLElement;

  if (contentArea && activeItem) {
    contentArea.scrollTo({
      top: activeItem.offsetTop,
    });
  }
};
</script>

<template>
  <v-navigation-drawer
    border="none"
    elevation="1"
    v-model="customizeTheme.mainSidebar"
    id="mainMenu"
    class="main-sidebar"
    width="240"
  >
    <!-- ---------------------------------------------- -->
    <!---Top Area -->
    <!-- ---------------------------------------------- -->
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
          v-else="customizeTheme.darkTheme"
          width="100"
          src="@/assets/logo/logo2_light.jpg"
          alt="Logo"
          class="my-2"
        />
        <div class="app-title">医智伴行</div>
      </div>
    </template>
    
    <!-- User Menu -->
    <v-list v-if="userInfo.isAdmin === 0" density="compact" class="py-0">
      <template v-for="(menuGroup, i) in navigation.menu" :key="i">
        <v-list-subheader v-if="menuGroup.header" class="text-caption font-weight-bold">
          {{ menuGroup.header }}
        </v-list-subheader>
        
        <v-list-group v-else class="menu-group">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" class="menu-group-item">
              <v-list-item-title>{{ menuGroup.text }}</v-list-item-title>
            </v-list-item>
          </template>
          
          <template v-for="(item, j) in menuGroup.items" :key="j">
            <!-- For items with chat history -->
            <v-list-group v-if="item.hasChatHistory && item.children && item.children.length > 0" sub-group>
              <template v-slot:activator="{ props }">
                <v-list-item v-bind="props" :to="item.link" :prepend-icon="item.icon" class="sub-menu-item">
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item>
              </template>
              
              <!-- Chat history items -->
              <v-list-item 
                v-for="(historyItem, k) in item.children" 
                :key="k"
                :to="historyItem.link"
                :prepend-icon="historyItem.icon"
                class="history-item pl-2"
                density="compact"
              >
                <v-list-item-title class="text-truncate text-subtitle-2">{{ historyItem.text }}</v-list-item-title>
              </v-list-item>
            </v-list-group>
            
            <!-- Regular items -->
            <v-list-item 
              v-else 
              :to="item.link"
              :prepend-icon="item.icon"
              class="menu-item"
            >
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-list-group>
      </template>
    </v-list>
    
    <!-- Admin Menu -->
    <v-list v-else density="compact" class="py-0">
      <template v-for="(menuGroup, i) in navigation.adminMenu" :key="i">
        <v-list-subheader v-if="menuGroup.header" class="text-caption font-weight-bold">
          {{ menuGroup.header }}
        </v-list-subheader>
        
        <v-list-group v-else class="menu-group">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" class="menu-group-item">
              <v-list-item-title>{{ menuGroup.text }}</v-list-item-title>
            </v-list-item>
          </template>
          
          <template v-for="(item, j) in menuGroup.items" :key="j">
            <!-- For items with chat history -->
            <v-list-group v-if="item.hasChatHistory && item.children && item.children.length > 0" sub-group>
              <template v-slot:activator="{ props }">
                <v-list-item v-bind="props" :to="item.link" :prepend-icon="item.icon" class="sub-menu-item">
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item>
              </template>
              
              <!-- Chat history items -->
              <v-list-item 
                v-for="(historyItem, k) in item.children" 
                :key="k"
                :to="historyItem.link"
                :prepend-icon="historyItem.icon"
                class="history-item pl-2"
                density="compact"
              >
                <v-list-item-title class="text-truncate text-subtitle-2">{{ historyItem.text }}</v-list-item-title>
              </v-list-item>
            </v-list-group>
            
            <!-- Regular items -->
            <v-list-item 
              v-else 
              :to="item.link"
              :prepend-icon="item.icon"
              class="menu-item"
            >
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
// 减小导航栏宽度并优化样式
.main-sidebar {
  max-width: 240px;
  
  :deep(.v-navigation-drawer__content) {
    scrollbar-width: thin;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
  }
}

// 优化Logo容器
.logo-container {
  padding: 10px 0;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

// 应用标题样式
.app-title {
  margin-top: 4px;
  margin-bottom: 8px;
  font-size: 1.4rem !important;
  font-weight: 600;
  letter-spacing: 1px;
  font-family: 'SourceHanSansCN-Bold', sans-serif;
}

// 优化列表样式
:deep(.v-list) {
  padding: 4px 0;
  
  .v-list-item {
    min-height: 38px;
    padding: 0 4px;  // 减少右侧填充，让内容更靠左
    
    &__title {
      font-size: 0.9rem;
    }
  }
  
  .v-list-group {
    margin-bottom: 2px;
    
    &__header {
      min-height: 40px;
    }
  }
  
  .v-list-subheader {
    font-size: 0.75rem;
    height: 32px;
    padding: 0 8px;  // 减少填充
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  }
}

// 为菜单项添加悬停效果
:deep(.menu-item:hover),
:deep(.sub-menu-item:hover),
:deep(.history-item:hover) {
  background-color: rgba(0, 0, 0, 0.04);
  
  .v-theme--dark & {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

// 历史记录项样式
:deep(.history-item) {
  min-height: 32px;
  margin-left: 4px;  // 减少左边距
  border-left: 1px dashed rgba(0, 0, 0, 0.1);
  
  .v-theme--dark & {
    border-left-color: rgba(255, 255, 255, 0.1);
  }
  
  .v-list-item-title {
    font-size: 0.85rem;
    max-width: 180px;  // 增加最大宽度
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 菜单组样式
:deep(.menu-group) {
  background-color: rgba(0, 0, 0, 0.02);
  margin: 2px 0;
  border-radius: 4px;
  
  .v-theme--dark & {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>