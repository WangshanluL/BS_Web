<script setup lang="ts">
const formatContent=(content)=> {

        return content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:green" target="_blank">$1</a>');
    }
import { ref, onMounted, watch, onBeforeUnmount, computed } from "vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
import AnimationChat from "@/components/animations/AnimationChat1.vue";
import AnimationAi from "@/components/animations/AnimationBot1.vue";
import AnimationWaiting from "@/components/animations/AnimationSearch1.vue";
import { countAndCompleteCodeBlocks } from "@/utils/aiUtils";
import { scrollToBottom } from "@/utils/common";
import { getCurrentInstance } from "vue";
import { Vue3Lottie } from "vue3-lottie";
const animationUrl ="https://lottie.host/ca50b51e-bb42-49b0-bf96-a06c3af44b9a/e0gnNucSCb.json"
const { proxy } = getCurrentInstance();
import { useChatGPTStore } from "@/stores/chatGPTStore";
import "md-editor-v3/lib/style.css";
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({
  breaks: true, // 将换行符转换为 <br>
  linkify: true, // 自动将 URL 转换为链接
  typographer: true, // 启用一些语言中立的替换和引号美化
  html: true // 允许 HTML 标签
});

const formatContent_md = (content: string): string => {
  return md.render(content);
};
interface Item {
  title: string;
  text: string;
}
const customItems: Item[] = [
  { title: '示例数据 1', text: '小红最近感觉到肌肉疼痛，尤其是在活动后。她还发现关节有些肿胀和僵硬。这些症状使她在日常生活中感到不适和困扰。小红想问："我是不是患上了关节炎？还是这可能是其他肌肉骨骼问题的症状？我该如何缓解这些不适？"' },
  { title: '示例数据 2', text: '小红最近经常感到腹痛，尤其是在进食后。她还经常出现消化不良的症状，如胃部胀气和不适。这些症状影响了她的日常生活和饮食习惯。小红想问：她是不是患上了胃溃疡？还是这可能是其他消化系统疾病的症状？她该如何改善我的饮食和生活习惯？' },
  { title: '示例数据 3', text: '小明感到身体不适，而后被诊断出患上了疱疹。在吃药的同时他渴望能够尽快恢复健康。所以有哪些食物能益于他恢复呢？' }
]
const items = ref(customItems);
const close = () => {
  chatGPTStore.configDialog = false;
};
const handleCardClick = (text) => {
  userMessage.value = text;
  close();
}

const snackbarStore = useSnackbarStore();
const chatGPTStore = useChatGPTStore();

interface Message {
  content: string;
  role: "user" | "assistant" | "system";
}

// Store additional context from search results
interface SearchResults {
  relevant_nodes_links: any[];
  tavily_results: any[];
}

const searchResults = ref<SearchResults>({
  relevant_nodes_links: [],
  tavily_results: []
});

// User Input Message
const userMessage = ref("");
const tempMessage = ref("");
const messages = ref<Message[]>([]);
const userInfo = ref({});
let socket = ref<WebSocket | null>(null);
let streamingMessage = ref(""); // For storing the current streaming message

// WebSocket connection
const connectWebSocket = () => {
  // Construct WebSocket URL from the HTTP base URL
  // Replace http:// with ws:// or https:// with wss://
  const wsUrl = proxy.globalInfo.new_url_f.replace(/^http/, 'ws') + "/ws";

  socket.value = new WebSocket(wsUrl);

  socket.value.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket.value.onmessage = (event) => {
    try {
      // First try to parse as JSON
      const jsonData = JSON.parse(event.data);
      console.log("Received JSON data:", jsonData);

      // Handle structured data
      if (jsonData.relevant_nodes_links !== undefined && jsonData.tavily_results !== undefined) {
        // Store search results
        searchResults.value = {
          relevant_nodes_links: jsonData.relevant_nodes_links,
          tavily_results: jsonData.tavily_results
        };
      } else if (jsonData.type === "error") {
        snackbarStore.showErrorMessage(jsonData.content || "操作失败，请重试");
        iswaiting.value = false;
      }
    } catch (e) {
      // Not JSON, handle as streaming text
      const textData = event.data;
      console.log("Received text data:", textData);

      if (textData.endsWith("[END]")) {
        // End of streaming, finalize the message
        iswaiting.value = false;
        const finalContent = textData.replace("[END]", "");

        // Check if we're in the middle of streaming
        if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === "assistant") {
          // Update the last message
          messages.value[messages.value.length - 1].content = finalContent;
        } else {
          // Create a new message
          messages.value.push({
            content: finalContent,
            role: "assistant"
          });
        }

        // Reset streaming state
        streamingMessage.value = "";
      } else {
        // Ongoing streaming
        streamingMessage.value = textData;

        // Update or create assistant message
        if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === "assistant") {
          // Update existing message
          messages.value[messages.value.length - 1].content = textData;
        } else {
          // Create new message
          messages.value.push({
            content: textData,
            role: "assistant"
          });
        }

        // Ensure we scroll to show the latest content
        scrollToBottom(document.querySelector(".message-container"));
      }
    }
  };

  socket.value.onerror = (error) => {
    console.error("WebSocket error:", error);
    snackbarStore.showErrorMessage("连接错误，请刷新页面重试");
    iswaiting.value = false;
  };

  socket.value.onclose = () => {
    console.log("WebSocket connection closed");
    // Attempt to reconnect after a delay
    setTimeout(() => {
      if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
    }, 3000);
  };
};

// Clean up WebSocket connection
onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close();
  }
});

onMounted(() => {
  const userInfoData = localStorage.getItem('userInfo');
  const userinf = JSON.parse(userInfoData);
  userInfo.value = userinf;

  // Initialize WebSocket connection
  connectWebSocket();

  // Load initial messages from local storage or keep empty array
  const savedMessages = localStorage.getItem(`chatMessages_${userInfo.value.userId}`);
  if (savedMessages) {
    try {
      messages.value = JSON.parse(savedMessages);
    } catch (e) {
      console.error("Failed to parse saved messages:", e);
      messages.value = [];
    }
  }
})

// Save messages to local storage
const saveMessages = () => {
  localStorage.setItem(`chatMessages_${userInfo.value.userId}`, JSON.stringify(messages.value));
};

const dialogVisible = ref(false)

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('你确定关闭对话框吗?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}

const clearchatmessages = () => {
  messages.value = [];
  saveMessages();
  dialogVisible.value = false;
  snackbarStore.showSuccessMessage("删除成功");
};

watch(
  () => messages.value,
  (newVal, oldVal) => {
    console.log("消息更新");
    saveMessages();

    // 检查是否有新值，并滚动到底部
    if (newVal) {
      scrollToBottom(document.querySelector(".message-container"));
    }
  },
  { immediate: true, deep: true }
);

const isLoading = ref(false);
const iswaiting = ref(false);

// Send Message via WebSocket
const sendMessage = async () => {
  if (userMessage.value) {
    // Add the message to the list
    messages.value.push({
      content: userMessage.value,
      role: "user",
    });
    tempMessage.value = userMessage.value;
    userMessage.value = "";
    await createCompletion();
  }
};

// Send message to process via WebSocket
const createCompletion = async () => {
  // 获取内容
  const content = tempMessage.value; // 问话请求的内容

  try {
    iswaiting.value = true;

    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({
        message: content,
        userId: userInfo.value.userId
      }));
    } else {
      snackbarStore.showErrorMessage("连接错误，请刷新页面重试");
      iswaiting.value = false;
    }
  } catch (error) {
    snackbarStore.showErrorMessage("网络错误，请重试");
    iswaiting.value = false;
  }
};

const displayMessages = computed(() => {
  if (messages.value.length === 0) return [];

  const messagesCopy = messages.value.slice(); // 创建原始数组的副本

  // Process each message to ensure code blocks are properly formatted
  return messagesCopy.map(message => ({
    ...message,
    content: countAndCompleteCodeBlocks(message.content),
  }));
});

const handleKeydown = (e) => {
  if (e.key === "Enter" && (e.altKey || e.shiftKey)) {
    // 当同时按下 alt或者shift 和 enter 时，插入一个换行符
    e.preventDefault();
    userMessage.value += "\n";
  } else if (e.key === "Enter") {
    // 当只按下 enter 时，发送消息
    e.preventDefault();
    sendMessage();
  }
};
const inputRow = ref(1);

</script>

<template>

  <div class="chat-bot">
    <el-dialog
    v-model="dialogVisible"
    title="Tips"
    width="500"
    :before-close="handleClose"
  >
    <span>请问你确定删除聊天记录吗？一旦删除，无法恢复</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="clearchatmessages">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
    <div class="messsage-area">
      <perfect-scrollbar v-if="messages.length > 0" class="message-container">
        <template v-for="message in displayMessages" :key="message">
          <div v-if="message.role === 'user'">
            <div class="pa-4 user-message">
              <v-avatar class="ml-4" rounded="sm" variant="elevated">
                <img :src="proxy.globalInfo.avatarUrl + userInfo.userId+'.jpg'" alt="alt" />
              </v-avatar>
              <v-card class=" text-pre-wrap" theme="dark" color="blue-grey">
                <v-card-text>
                  <b> {{ message.content }}</b></v-card-text
                >
              </v-card>
            </div>
          </div>
          <div v-else>
            <div class="pa-2 pa-md-5 assistant-message">
              <v-avatar
                class="d-none d-md-block mr-2 mr-md-4"
                rounded="sm"
                variant="elevated"
              >
                <img
                  src="@/assets/s1.png"
                  alt="alt"
                />
              </v-avatar>
              <v-card>
                <div>
                  <v-card class=" text-pre-wrap" theme="dark" color="primary">
                <v-card-text>
                  <b> <span v-html="formatContent(message.content)"></span></b>
<!--   <b> <div v-html="formatContent_md(message.content)"></div></b>    -->
                  </v-card-text>
              </v-card>
                </div>
              </v-card>
            </div>
          </div>
        </template>
        <div v-if="isLoading">
          <div class="pa-6">
            <div class="message">
              <AnimationAi :size="100" />
            </div>
          </div>
        </div>
        <div v-if="iswaiting">
          <div class="pa-6">
            <div class="message">
              <AnimationWaiting :size="150" />
            </div>
          </div>
        </div>
      </perfect-scrollbar>
      <div class="no-message-container" v-else>
        <h1 class="text-h1 text-md-h1 font-weight-bold" style="color: #344767;">
          Chat With Me
        </h1>
        <Vue3Lottie
:animationLink="animationUrl"
:height="500"
:width="500"
/>
      </div>
    </div>
    <div class="input-area">
      <v-sheet
        color="transparent"
        elevation="0"
        class="input-panel d-flex align-end pa-1"
      >
      <v-btn class="mb-1"  variant="elevated" style="margin-right: 10px;" icon @click="dialogVisible = true">
          <v-icon  class="text-primary">mdi-close-circle-outline</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            text="删除聊天记录"
          ></v-tooltip>
        </v-btn>
        <v-btn
          class="mb-1"
          variant="elevated"
          icon
          @click="chatGPTStore.configDialog = true"
        >
          <v-icon size="30" class="text-primary">mdi-comment-text-multiple</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            text="样例数据"
          ></v-tooltip>
        </v-btn>
        <transition name="fade">
          <v-textarea
            class="mx-2"
            color="primary"
            type="text"
            clearable
            variant="solo"
            ref="input"
            v-model="userMessage"
            placeholder="Ask Anything"
            hide-details
            @keydown="handleKeydown"
            :rows="inputRow"
            @focus="inputRow = 3"
            @blur="inputRow = 1"
          >
          </v-textarea>
        </transition>

        <v-btn class="mb-1"  variant="elevated" icon>
          <v-icon @click="sendMessage" class="text-primary">mdi-send</v-icon>
        </v-btn>

      </v-sheet>

     <template>
  <v-dialog v-model="chatGPTStore.configDialog" width="600">
    <v-card>
      <v-card-title class="font-weight-bold pa-5">
        示例数据</v-card-title>
      <v-divider />
      <v-card-text>
        <v-data-iterator :items="items" >
          <template v-slot:default="{ items }">
            <template v-for="(item) in items" :key="item">
              <v-card v-bind="item.raw"  style="cursor:pointer;"  @click="handleCardClick(item.raw.text)"></v-card>
              <br>
            </template>
          </template>
        </v-data-iterator>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="flat" color="primary" @click="close">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-bot {
  background-repeat: repeat;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .messsage-area {
    flex: 1;
    height: 80%;
  }

  .input-area {
    position: absolute;
    width: 100%;
    bottom: 0;
    // padding: 1rem;

    align-items: center;

    .input-panel {
      border-radius: 5px;
      max-width: 1200px;
      margin: 0 auto;
    }
  }
}

.user-message {
  display: flex;
  align-content: center;
  justify-content: end;
  flex-direction: row-reverse;
  margin-left: 20%;
}

.assistant-message {
  display: flex;
  align-content: center;
  justify-content: start;
  flex-direction: row;
  margin-right: 20%;
}

.message {
  margin: 0 auto;
  max-width: 1200px;
  display: flex;
}

.message-container {
  height: calc(80vh );
}

.no-message-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  h1 {
    font-size: 2rem;
    font-weight: 500;
  }
}

:deep(.md-editor-preview-wrapper) {
  padding: 5px 15px;
}

.font-1 {
  font-size: 13px !important;
}

@media screen and (max-width: 768px) {
  :deep(#md-editor-v3-preview),
  .user-message {
    font-size: 14px !important;
  }
}
</style>
